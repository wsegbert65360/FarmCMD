import { config } from "./config";
import { isValidNumber, isValidObject } from "./validation";

export interface DryingData {
  tempF: number | null;
  humidity: number | null;
  windMph: number | null;
  gustMph: number | null;
  /** Overall drying rating */
  rating: "Excellent" | "Good" | "Fair" | "Poor";
  /** One-line reason */
  reason: string;
  /** Individual factor ratings for display */
  tempRating: string;
  humidityRating: string;
  windRating: string;
  error?: string;
  updatedAt: string;
}

function toF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

function toMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}

function rateTemp(tempF: number): { rating: string; score: number } {
  if (tempF >= 85) return { rating: "Hot", score: 4 };
  if (tempF >= 70) return { rating: "Warm", score: 3 };
  if (tempF >= 55) return { rating: "Cool", score: 2 };
  return { rating: "Cold", score: 1 };
}

function rateHumidity(humidity: number): { rating: string; score: number } {
  if (humidity < 30) return { rating: "Dry", score: 4 };
  if (humidity < 50) return { rating: "Moderate", score: 3 };
  if (humidity < 70) return { rating: "Humid", score: 2 };
  return { rating: "Very Humid", score: 1 };
}

function rateWind(windMph: number): { rating: string; score: number } {
  if (windMph >= 20) return { rating: "Windy", score: 4 };
  if (windMph >= 10) return { rating: "Breezy", score: 3 };
  return { rating: "Calm", score: 2 };
}

function getOverallRating(tempScore: number, humidityScore: number, windScore: number): { rating: DryingData["rating"]; reason: string } {
  // Weights: humidity is most important for drying, then wind, then temp
  const total = (humidityScore * 3) + (windScore * 2) + tempScore;

  if (total >= 13) return { rating: "Excellent", reason: "Ideal conditions for drying — low humidity with wind" };
  if (total >= 10) return { rating: "Good", reason: "Good drying conditions — favorable wind and moisture" };
  if (total >= 7) return { rating: "Fair", reason: "Marginal — humidity or wind not ideal" };
  return { rating: "Poor", reason: "Not recommended — too humid or calm for effective drying" };
}

export async function fetchDryingConditions(): Promise<DryingData> {
  const { lat, lon } = config.weather;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Farm-Command/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { tempF: null, humidity: null, windMph: null, gustMph: null, rating: "Poor", reason: "", tempRating: "Cold", humidityRating: "Very Humid", windRating: "Calm", error: "API unavailable", updatedAt: new Date().toISOString() };
    }

    const rawData = await response.json();

    if (!isValidObject(rawData) || !isValidObject(rawData.current)) {
      return { tempF: null, humidity: null, windMph: null, gustMph: null, rating: "Poor", reason: "", tempRating: "Cold", humidityRating: "Very Humid", windRating: "Calm", error: "Invalid response", updatedAt: new Date().toISOString() };
    }

    const current = rawData.current as Record<string, number>;

    const tempF = isValidNumber(current.temperature_2m) ? toF(current.temperature_2m) : null;
    const humidity = isValidNumber(current.relative_humidity_2m) ? current.relative_humidity_2m : null;
    const windMph = isValidNumber(current.wind_speed_10m) ? toMph(current.wind_speed_10m) : null;
    const gustMph = isValidNumber(current.wind_gusts_10m) ? toMph(current.wind_gusts_10m) : null;

    if (tempF === null || humidity === null || windMph === null) {
      return { tempF, humidity, windMph, gustMph, rating: "Poor", reason: "Incomplete data", tempRating: "Cold", humidityRating: "Very Humid", windRating: "Calm", error: "Incomplete data", updatedAt: new Date().toISOString() };
    }

    const temp = rateTemp(tempF);
    const humid = rateHumidity(humidity);
    const wind = rateWind(windMph);
    const { rating, reason } = getOverallRating(temp.score, humid.score, wind.score);

    return {
      tempF,
      humidity,
      windMph,
      gustMph,
      rating,
      reason,
      tempRating: temp.rating,
      humidityRating: humid.rating,
      windRating: wind.rating,
      updatedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error("Drying conditions API error:", e);
    return { tempF: null, humidity: null, windMph: null, gustMph: null, rating: "Poor", reason: "", tempRating: "Cold", humidityRating: "Very Humid", windRating: "Calm", error: "API unavailable", updatedAt: new Date().toISOString() };
  }
}
