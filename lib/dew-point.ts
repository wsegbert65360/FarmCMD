import { config } from "./config";
import { isValidObject } from "./validation";

export interface DewPointData {
  dewPointF: number | null;
  humidityPct: number | null;
  tempF: number | null;
  /** Comfort/advisory message based on dew point */
  advisory: string;
  error?: string;
  updatedAt: string;
}

function toF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

function getAdvisory(dewPointF: number): string {
  if (dewPointF < 55) return "Comfortable — spray conditions good";
  if (dewPointF < 60) return "Slightly humid — monitor crops";
  if (dewPointF < 65) return "Humid — disease pressure increasing";
  if (dewPointF < 70) return "Very humid — high disease risk";
  return "Oppressive — avoid spraying, high stress";
}

export async function fetchDewPoint(): Promise<DewPointData> {
  const { lat, lon } = config.weather;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,dew_point_2m&timezone=${encodeURIComponent(config.weather.timezone)}&forecast_days=1`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Farm-Command/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { dewPointF: null, humidityPct: null, tempF: null, advisory: "", error: "API unavailable", updatedAt: new Date().toISOString() };
    }

    const rawData: Record<string, unknown> = await response.json();

    if (!isValidObject(rawData) || !isValidObject(rawData.current)) {
      return { dewPointF: null, humidityPct: null, tempF: null, advisory: "", error: "Invalid response", updatedAt: new Date().toISOString() };
    }

    const current = rawData.current as Record<string, unknown>;

    const tempC = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const dewPointC = current.dew_point_2m;

    const tempF = typeof tempC === "number" ? toF(tempC) : null;
    const humidityPct = typeof humidity === "number" ? Math.round(humidity) : null;
    const dewPointF = typeof dewPointC === "number" ? toF(dewPointC) : null;

    const advisory = dewPointF !== null ? getAdvisory(dewPointF) : "";

    return { dewPointF, humidityPct, tempF, advisory, updatedAt: new Date().toISOString() };
  } catch (e) {
    console.error("Dew point API error:", e);
    return { dewPointF: null, humidityPct: null, tempF: null, advisory: "", error: "API unavailable", updatedAt: new Date().toISOString() };
  }
}
