function parseValidatedFloat(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = parseFloat(value || "");
  if (isNaN(parsed) || parsed < min || parsed > max) {
    console.warn(`Invalid env var, using fallback: ${value} -> ${fallback}`);
    return fallback;
  }
  return parsed;
}

function parseValidatedInt(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = parseInt(value || "", 10);
  if (isNaN(parsed) || parsed < min || parsed > max) {
    console.warn(`Invalid env var, using fallback: ${value} -> ${fallback}`);
    return fallback;
  }
  return parsed;
}

export const VERSION = "1.4.1";

export const config = {
  weather: {
    lat: parseValidatedFloat(process.env.WEATHER_LAT, 38.4626783, -90, 90),
    lon: parseValidatedFloat(process.env.WEATHER_LON, -93.5373719, -180, 180),
    locationLabel: process.env.WEATHER_LOCATION_LABEL || "Windsor, MO",
    timezone: process.env.TIMEZONE || "America/Chicago",
  },
  spray: {
    maxWindMph: parseValidatedFloat(process.env.MAX_SPRAY_WIND_MPH, 10, 0, 100),
    maxGustMph: parseValidatedFloat(process.env.MAX_SPRAY_GUST_MPH, 15, 0, 200),
    rainThreshold: parseValidatedFloat(process.env.RAIN_THRESHOLD, 20, 0, 100),
    rainForecastHours: parseValidatedInt(process.env.RAIN_FORECAST_HOURS, 3, 1, 48),
  },
  grain: {
    priceDropThreshold: parseValidatedFloat(process.env.GRAIN_PRICE_DROP_THRESHOLD, -0.03, -10, 10),
    commoditiesApiKey: process.env.COMMODITIES_API_KEY || "",
  },
  rainfall: {
    apiUrl: process.env.RAINFALL_API_URL || "https://rain-api.vercel.app",
    // Legacy only: current rainfall integration uses coordinate mode via WEATHER_LAT/WEATHER_LON.
    fieldId: process.env.FIELD_ID || "",
  },
};
