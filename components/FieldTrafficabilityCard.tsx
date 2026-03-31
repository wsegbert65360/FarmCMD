interface FieldTrafficabilityCardProps {
  days: {
    label: string;
    date: string;
    rainIn: number;
    rating: string;
    reason: string;
    isPast: boolean;
  }[];
  currentStatus: string;
  summary: string;
  totalRain7d: number;
  rain48h: number;
  tempF: number | null;
  isRainingNow: boolean;
  error?: string;
}

function statusBadge(status: string): { bg: string; text: string } {
  switch (status) {
    case "Passable": return { bg: "bg-green-500", text: "PASSABLE" };
    case "Caution": return { bg: "bg-amber-400", text: "CAUTION" };
    default: return { bg: "bg-red-500", text: "NO-GO" };
  }
}

function ratingDot(rating: string): string {
  switch (rating) {
    case "Passable": return "bg-green-400";
    case "Caution": return "bg-amber-300";
    default: return "bg-red-400";
  }
}

function dayRowBg(rating: string, isPast: boolean): string {
  if (isPast) return "opacity-50";
  switch (rating) {
    case "Passable": return "bg-green-50";
    case "Caution": return "bg-amber-50";
    default: return "bg-red-50";
  }
}

export default function FieldTrafficabilityCard({
  days, currentStatus, summary, totalRain7d, rain48h, tempF, isRainingNow, error
}: FieldTrafficabilityCardProps) {
  if (error && days.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Field Trafficability</h2>
        <p className="text-sm text-slate-400 text-center py-2">{error}</p>
      </div>
    );
  }

  const badge = statusBadge(currentStatus);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-slate-900">Field Trafficability</h2>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${badge.bg}`}>
          {badge.text}
        </span>
      </div>

      {/* Summary */}
      <p className="text-xs text-slate-600 mb-2">{summary}</p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-1 mb-2">
        <div className="bg-slate-50 rounded-lg px-2 py-1.5 text-center">
          <p className="text-[9px] text-slate-400 font-medium">48HR RAIN</p>
          <p className="text-sm font-bold text-blue-600">{rain48h}"</p>
        </div>
        <div className="bg-slate-50 rounded-lg px-2 py-1.5 text-center">
          <p className="text-[9px] text-slate-400 font-medium">7-DAY TOTAL</p>
          <p className="text-sm font-bold text-blue-600">{totalRain7d}"</p>
        </div>
        <div className="bg-slate-50 rounded-lg px-2 py-1.5 text-center">
          <p className="text-[9px] text-slate-400 font-medium">TEMP</p>
          <p className="text-sm font-bold text-slate-700">{tempF !== null ? `${tempF}°` : "--"}</p>
        </div>
      </div>

      {/* Day-by-day table */}
      <div className="space-y-[2px]">
        {days.slice(-7).map((day) => (
          <div
            key={day.date}
            className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs ${dayRowBg(day.rating, day.isPast)}`}
          >
            {/* Status dot */}
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ratingDot(day.rating)}`} />
            {/* Day label */}
            <span className={`w-10 font-medium text-slate-700 ${day.isPast ? "line-through" : ""}`}>
              {day.label}
            </span>
            {/* Rain amount */}
            <span className="w-10 text-slate-500">
              {day.rainIn > 0 ? `${day.rainIn}"` : "Dry"}
            </span>
            {/* Rating badge */}
            <span className={`flex-1 text-right font-medium ${
              day.rating === "Passable" ? "text-green-700" :
              day.rating === "Caution" ? "text-amber-700" : "text-red-600"
            }`}>
              {day.rating}
            </span>
          </div>
        ))}
      </div>

      {/* Raining now indicator */}
      {isRainingNow && (
        <div className="mt-2 flex items-center justify-center gap-1 px-2 py-1 bg-blue-50 rounded-lg">
          <span className="text-sm">🌧️</span>
          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">Currently Raining</span>
        </div>
      )}
    </div>
  );
}
