import { ForecastDay } from "@/lib/types";
import { config } from "@/lib/config";

interface ForecastCardProps {
  days: ForecastDay[];
  updatedAt: string;
}

export default function ForecastCard({ days, updatedAt }: ForecastCardProps) {
  if (days.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
        <h2 className="text-base font-semibold text-slate-900 mb-2">10-Day Forecast</h2>
        <p className="text-sm text-slate-400 text-center py-2">Forecast unavailable</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-900">10-Day Forecast</h2>
        <span className="text-xs text-slate-400">
          {new Date(updatedAt).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: config.weather.timezone,
          })}
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory">
        {days.map((day) => (
          <div
            key={day.date}
            className="flex-shrink-0 w-[72px] snap-start flex flex-col items-center bg-slate-50 rounded-lg p-2 border border-slate-100"
          >
            <span className="text-xs font-semibold text-slate-600 mb-1">{day.dayLabel}</span>
            <WeatherIcon code={day.weatherCode} />
            <div className="mt-1 text-center leading-tight">
              <span className="text-sm font-bold text-slate-900">{day.highF}°</span>
              <span className="text-xs text-slate-400 ml-0.5">{day.lowF}°</span>
            </div>
            <div className="flex items-center gap-0.5 mt-1.5">
              <RainDropIcon />
              <span className={`text-xs font-medium ${day.rainChance >= 50 ? "text-blue-600" : "text-slate-500"}`}>
                {day.rainChance}%
              </span>
            </div>
            {day.rainMm > 0 && (
              <span className="text-[10px] text-blue-400 mt-0.5">{(day.rainMm / 25.4).toFixed(2)}&quot;</span>
            )}
            <span className="text-[10px] text-slate-400 mt-1">
              {day.windMph} mph
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeatherIcon({ code }: { code: number }) {
  // WMO Weather interpretation codes (simplified)
  // 0: Clear, 1-3: Partly cloudy, 45-48: Fog
  // 51-55: Drizzle, 61-65: Rain, 71-75: Snow
  // 80-82: Rain showers, 95-99: Thunderstorm
  if (code === 0) {
    return <span className="text-lg" title="Clear">☀️</span>;
  }
  if (code <= 3) {
    return <span className="text-lg" title="Partly cloudy">⛅</span>;
  }
  if (code <= 48) {
    return <span className="text-lg" title="Fog">🌫️</span>;
  }
  if (code <= 55) {
    return <span className="text-lg" title="Drizzle">🌦️</span>;
  }
  if (code <= 65) {
    return <span className="text-lg" title="Rain">🌧️</span>;
  }
  if (code <= 75) {
    return <span className="text-lg" title="Snow">🌨️</span>;
  }
  if (code <= 82) {
    return <span className="text-lg" title="Rain showers">🌧️</span>;
  }
  if (code >= 95) {
    return <span className="text-lg" title="Thunderstorm">⛈️</span>;
  }
  return <span className="text-lg" title="Unknown">🌡️</span>;
}

function RainDropIcon() {
  return (
    <svg
      className="w-3 h-3 text-blue-400 flex-shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 2a1 1 0 01.894.553l5.264 10.528A2 2 0 0114.464 16H5.536a2 2 0 01-1.789-2.919L9.106 2.553A1 1 0 0110 2zm0 2.236L5.673 13.105a.5.5 0 00.447.728h7.76a.5.5 0 00.447-.728L10 4.236z"
        clipRule="evenodd"
      />
    </svg>
  );
}
