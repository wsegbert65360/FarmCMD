import { config } from "./config";
import { isValidNumber, isValidObject } from "./validation";

export interface RainHour {
  /** ISO datetime string (e.g. "2025-06-15T08:00") */
  time: string;
  /** Short hour label (e.g. "8AM", "2PM") */
  label: string;
  /** Precipitation probability 0-100 */
  prob: number;
  /** Expected precipitation in inches */
  precipIn: number;
  /** Whether this hour is in the past (already elapsed) */
  isNow: boolean;
}

export interface RainTimelineData {
  /** Hourly entries for the next 24 hours */
  hours: RainHour[];
  /** Total expected rain in inches over the window */
  totalPrecipIn: number;
  /** Longest consecutive dry streak in hours */
  dryStreak: number;
  /** Whether rain is expected in the next 3 hours */
  rainSoon: boolean;
  error?: string;
  updatedAt: string;
}

function mmToIn(mm: number): number {
  return Math.round((mm / 25.4) * 100) / 100;
}

function formatHour(isoTime: string): string {
  const date = new Date(isoTime);
  let h = date.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}${ampm}`;
}

function findNowIndex(times: string[]): number {
  const now = new Date();
  // Open-Meteo returns hourly timestamps like "2025-06-15T08:00"
  // Find the hour that best matches "now"
  const currentHour = now.getHours();

  for (let i = 0; i < times.length; i++) {
    const d = new Date(times[i]);
    if (d.getHours() === currentHour) return i;
  }
  return 0;
}

export async function fetchRainTimeline(): Promise<RainTimelineData> {
  const { lat, lon, timezone } = config.weather;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation_probability,precipitation&forecast_hours=24&timezone=${encodeURIComponent(timezone)}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Farm-Command/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { hours: [], totalPrecipIn: 0, dryStreak: 0, rainSoon: false, error: "API unavailable", updatedAt: new Date().toISOString() };
    }

    const rawData = await response.json();

    if (!isValidObject(rawData) || !Array.isArray(rawData.hourly) || !isValidObject(rawData.hourly)) {
      return { hours: [], totalPrecipIn: 0, dryStreak: 0, rainSoon: false, error: "Invalid response", updatedAt: new Date().toISOString() };
    }

    const hourly = rawData.hourly as Record<string, (number | string)[]>;
    const times = (hourly.time as string[]) || [];
    const probs = (hourly.precipitation_probability as number[]) || [];
    const precip = (hourly.precipitation as number[]) || [];

    if (times.length === 0) {
      return { hours: [], totalPrecipIn: 0, dryStreak: 0, rainSoon: false, error: "No hourly data", updatedAt: new Date().toISOString() };
    }

    const nowIdx = findNowIndex(times);
    let totalPrecip = 0;
    let longestDryStreak = 0;
    let currentDryStreak = 0;
    const hours: RainHour[] = [];

    for (let i = nowIdx; i < Math.min(nowIdx + 24, times.length); i++) {
      const prob = isValidNumber(probs[i]) ? probs[i] : 0;
      const precipMm = isValidNumber(precip[i]) ? precip[i] : 0;
      const precipIn = mmToIn(precipMm);

      totalPrecip += precipIn;

      if (prob < 20) {
        currentDryStreak++;
        longestDryStreak = Math.max(longestDryStreak, currentDryStreak);
      } else {
        currentDryStreak = 0;
      }

      hours.push({
        time: times[i],
        label: formatHour(times[i]),
        prob,
        precipIn,
        isNow: i === nowIdx,
      });
    }

    // Check if rain is expected in the next 3 hours
    const next3 = hours.slice(0, 3);
    const rainSoon = next3.some((h) => h.prob >= 30);

    return {
      hours,
      totalPrecipIn: Math.round(totalPrecip * 100) / 100,
      dryStreak: longestDryStreak,
      rainSoon,
      updatedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error("Rain timeline API error:", e);
    return { hours: [], totalPrecipIn: 0, dryStreak: 0, rainSoon: false, error: "API unavailable", updatedAt: new Date().toISOString() };
  }
}
