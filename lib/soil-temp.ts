import { config } from "./config";
import { isValidNumber } from "./validation";

export interface SoilTempData {
  surfaceF: number | null;
  sixInchF: number | null;
  eighteenInchF: number | null;
  fourFootF: number | null;
  error?: string;
  updatedAt: string;
}

function toF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export async function fetchSoilTemp(): Promise<SoilTempData> {
  const { lat, lon, timezone } = config.weather;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm&timezone=${encodeURIComponent(timezone)}&forecast_days=1`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Farm-Command/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { surfaceF: null, sixInchF: null, eighteenInchF: null, fourFootF: null, error: "API unavailable", updatedAt: new Date().toISOString() };
    }

    const rawData: Record<string, unknown> = await response.json();
    const hourly = rawData.hourly as Record<string, unknown[]> | undefined;

    if (!hourly || !Array.isArray(hourly.time) || hourly.time.length === 0) {
      return { surfaceF: null, sixInchF: null, eighteenInchF: null, fourFootF: null, error: "Invalid response", updatedAt: new Date().toISOString() };
    }

    // Use the most recent hourly reading (current hour)
    const idx = hourly.time.length - 1;

    const surfaceF = isValidNumber(hourly.soil_temperature_0cm?.[idx]) ? toF(hourly.soil_temperature_0cm[idx] as number) : null;
    const sixInchF = isValidNumber(hourly.soil_temperature_6cm?.[idx]) ? toF(hourly.soil_temperature_6cm[idx] as number) : null;
    const eighteenInchF = isValidNumber(hourly.soil_temperature_18cm?.[idx]) ? toF(hourly.soil_temperature_18cm[idx] as number) : null;
    const fourFootF = isValidNumber(hourly.soil_temperature_54cm?.[idx]) ? toF(hourly.soil_temperature_54cm[idx] as number) : null;

    return { surfaceF, sixInchF, eighteenInchF, fourFootF, updatedAt: new Date().toISOString() };
  } catch (e) {
    console.error("Soil temp API error:", e);
    return { surfaceF: null, sixInchF: null, eighteenInchF: null, fourFootF: null, error: "API unavailable", updatedAt: new Date().toISOString() };
  }
}
