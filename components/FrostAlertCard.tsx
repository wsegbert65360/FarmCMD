import { config } from "@/lib/config";
import type { FrostAlertData } from "@/lib/frost-alert";

interface FrostDay {
  date: string;
  dayLabel: string;
  lowF: number;
  frostRisk: string;
  precipChance: number;
}

interface FrostAlertCardProps {
  days: FrostDay[];
  alertLevel: string;
  summary: string;
  error?: string;
}

function riskBg(risk: string): string {
  switch (risk) {
    case "Freezing": return "bg-blue-200 text-blue-800";
    case "Frost": return "bg-cyan-100 text-cyan-800";
    case "Near Frost": return "bg-amber-50 text-amber-700";
    default: return "bg-slate-50 text-slate-600";
  }
}

function alertBannerBg(level: string): string {
  switch (level) {
    case "Freezing": return "bg-blue-600 text-white";
    case "Frost": return "bg-cyan-500 text-white";
    case "Near Frost": return "bg-amber-400 text-amber-900";
    default: return "bg-green-50 text-green-700";
  }
}

function alertIcon(level: string): string {
  switch (level) {
    case "Freezing": return "🥶";
    case "Frost": return "❄️";
    case "Near Frost": return "降温";
    default: return "✅";
  }
}

export default function FrostAlertCard({ days, alertLevel, summary, error }: FrostAlertCardProps) {
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Frost Alert</h2>
        <p className="text-sm text-slate-400 text-center py-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-slate-900">Frost Alert</h2>
        <span className="text-[10px] text-slate-400">72-hour outlook</span>
      </div>

      {/* Alert banner */}
      <div className={`rounded-lg px-3 py-2 mb-2 ${alertBannerBg(alertLevel)}`}>
        <p className="text-sm font-medium">
          {alertIcon(alertLevel)} {summary}
        </p>
      </div>

      {/* 3-day low temps */}
      <div className="grid grid-cols-3 gap-1.5">
        {days.map((day) => (
          <div key={day.date} className={`rounded-lg p-2 text-center ${riskBg(day.frostRisk)}`}>
            <p className="text-xs font-medium opacity-70">{day.dayLabel}</p>
            <p className="text-lg font-bold leading-tight">{day.lowF}°</p>
            <p className="text-[9px] opacity-60">{day.frostRisk === "None" ? "No frost" : day.frostRisk}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-slate-400 mt-1.5 text-center">
        Frost: ≤36°F &middot; Freeze: ≤32°F &middot; Protect tender crops
      </p>
    </div>
  );
}
