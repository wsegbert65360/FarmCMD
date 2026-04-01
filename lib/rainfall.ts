import { config } from "./config";

export async function fetchRainfall(): Promise<{
  rain1d: number | null;
  rain3d: number | null;
  rain7d: number | null;
  error?: string;
}> {
  const { apiUrl } = config.rainfall;
  const { lat, lon } = config.weather;

  if (!lat || !lon) {
    return { rain1d: null, rain3d: null, rain7d: null };
  }

  const baseUrl = apiUrl.replace(/\/+$/, "").replace(/[\r\n]/g, "");

  try {
    // Single API call: GET /rain?lat=X&lon=Y&days=7
    // Returns { rainfall, breakdown: { "YYYY-MM-DD": inches }, ... }
    const response = await fetch(
      `${baseUrl}/rain?lat=${lat}&lon=${lon}&days=7`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      console.error(`Rain API error: ${response.status}`);
      return { rain1d: null, rain3d: null, rain7d: null, error: "Rainfall service error" };
    }

    const data = await response.json();
    const breakdown: Record<string, number> = data.breakdown || {};
    const dates = Object.keys(breakdown).sort();

    if (dates.length === 0) {
      return { rain1d: 0, rain3d: 0, rain7d: 0 };
    }

    // Aggregate from daily breakdown (per API contract)
    const rain1d = dates.slice(-1).reduce((s, d) => s + (Number(breakdown[d]) || 0), 0);
    const rain3d = dates.slice(-3).reduce((s, d) => s + (Number(breakdown[d]) || 0), 0);
    const rain7d = Number(data.rainfall) || dates.reduce((s, d) => s + (Number(breakdown[d]) || 0), 0);

    return {
      rain1d: Math.round(rain1d * 1000) / 1000,
      rain3d: Math.round(rain3d * 1000) / 1000,
      rain7d: Math.round(rain7d * 1000) / 1000,
    };
  } catch (error) {
    console.error("Rainfall integration error:", error);
    return {
      rain1d: null,
      rain3d: null,
      rain7d: null,
      error: "Rainfall service error",
    };
  }
}
