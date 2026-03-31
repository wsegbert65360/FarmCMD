import { config } from "./config";
import { isValidNumber } from "./validation";

export interface FrostDay {
  date: string;
  dayLabel: string;
  lowF: number;
  frostRisk: "Freezing" | "Frost" | "Near Frost" | "None";
  precipChance: number;
}

export interface FrostAlertData {
  days: FrostDay[];
  /** Highest risk level found */
  alertLevel: "Freezing" | "Frost" | "Near Frost" | "Clear";
  /** Summary reason */
  summary: string;
  error?: string;
  updatedAt: string;
}

function toF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

function getFrostRisk(lowF: number): FrostDay["frostRisk"] {
  if (lowF <= 32) return "Freezing";
  if (lowF <= 36) return "Frost";
  if (lowF <= 40) return "Near Frost";
  return "None";
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tmrw";
  return DAY_LABELS[date.getDay()] || dateStr.slice(5);
}

export async function fetchFrostAlert(): Promise<FrostAlertData> {
  const { lat, lon, timezone } = config.weather;

  // 3-day forecast is enough for frost — farmers care about the next 48-72 hours
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_min,precipitation_probability_max&timezone=${encodeURIComponent(timezone)}&forecast_days=3`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Farm-Command/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { days: [], alertLevel: "Clear", summary: "", error: "API unavailable", updatedAt: new Date().toISOString() };
    }

    const rawData: Record<string, unknown> = await response.json();
    const daily = rawData.daily as Record<string, unknown[]> | undefined;

    if (!daily || !Array.isArray(daily.time) || daily.time.length === 0) {
      return { days: [], alertLevel: "Clear", summary: "", error: "Invalid response", updatedAt: new Date().toISOString() };
    }

    const days: FrostDay[] = daily.time.map((dateStr, i) => {
      const lowC = daily.temperature_2m_min[i];
      const lowF = isValidNumber(lowC) ? toF(lowC as number) : 0;
      const precipChance = isValidNumber(daily.precipitation_probability_max[i]) ? daily.precipitation_probability_max[i] as number : 0;

      return {
        date: dateStr as string,
        dayLabel: getDayLabel(dateStr as string),
        lowF,
        frostRisk: getFrostRisk(lowF),
        precipChance,
      };
    });

    // Determine highest risk
    const riskOrder: Record<string, number> = { "Freezing": 4, "Frost": 3, "Near Frost": 2, "None": 1 };
    let maxRisk = "None" as string;
    let maxRiskDay: FrostDay | null = null;

    for (const day of days) {
      if ((riskOrder[day.frostRisk] || 0) > (riskOrder[maxRisk] || 0)) {
        maxRisk = day.frostRisk;
        maxRiskDay = day;
      }
    }

    let alertLevel: FrostAlertData["alertLevel"] = "Clear";
    let summary = "";

    if (maxRisk === "Freezing" && maxRiskDay) {
      alertLevel = "Freezing";
      summary = `Freeze warning: ${maxRiskDay.lowF}°F low on ${maxRiskDay.dayLabel}`;
    } else if (maxRisk === "Frost" && maxRiskDay) {
      alertLevel = "Frost";
      summary = `Frost possible: ${maxRiskDay.lowF}°F low on ${maxRiskDay.dayLabel}`;
    } else if (maxRisk === "Near Frost" && maxRiskDay) {
      alertLevel = "Near Frost";
      summary = `Near frost: ${maxRiskDay.lowF}°F low on ${maxRiskDay.dayLabel} — protect sensitive crops`;
    } else {
      alertLevel = "Clear";
      summary = "No frost risk in the next 3 days";
    }

    return { days, alertLevel, summary, updatedAt: new Date().toISOString() };
  } catch (e) {
    console.error("Frost alert API error:", e);
    return { days: [], alertLevel: "Clear", summary: "", error: "API unavailable", updatedAt: new Date().toISOString() };
  }
}
