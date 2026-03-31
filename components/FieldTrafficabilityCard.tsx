interface FieldTrafficabilityCardProps {
  rating: "Passable" | "Caution" | "No-Go";
  reason: string;
  totalRain7d: number;
  yesterdayRainIn: number;
  tempF: number | null;
  groundFrozen: boolean;
  history: {
    date: string;
    label: string;
    precipIn: number;
  }[];
  rainExpected: boolean;
  error?: string;
}

function ratingBadge(rating: string): { bg: string; text: string } {
  switch (rating) {
    case "Passable": return { bg: "bg-green-500", text: "PASSABLE" };
    case "Caution": return { bg: "bg-amber-400", text: "CAUTION" };
    case "No-Go": return { bg: "bg-red-500", text: "NO-GO" };
    default: return { bg: "bg-slate-400", text: "UNKNOWN" };
  }
}

function precipBarWidth(inches: number): string {
  if (inches === 0) return "";
  if (inches < 0.1) return "w-[8%]";
  if (inches < 0.25) return "w-[15%]";
  if (inches < 0.5) return "w-[30%]";
  if (inches < 1) return "w-[50%]";
  return "w-[75%]";
}

export default function FieldTrafficabilityCard({
  rating, reason, totalRain7d, yesterdayRainIn, tempF, groundFrozen, history, rainExpected, error
}: FieldTrafficabilityCardProps) {
  if (error && history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Field Trafficability</h2>
        <p className="text-sm text-slate-400 text-center py-2">{error}</p>
      </div>
    );
  }

  const badge = ratingBadge(rating);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-slate-900">Field Trafficability</h2>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${badge.bg}`}>
          {badge.text}
        </span>
      </div>

      {/* Reason */}
      <p className="text-xs text-slate-600 mb-2">{reason}</p>

      {/* Stats row */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 rounded-lg mb-2 text-xs">
        <div className="text-center">
          <div className="text-slate-400 text-[10px]">7-Day Rain</div>
          <div className="font-bold text-blue-600">{totalRain7d}"</div>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div className="text-center">
          <div className="text-slate-400 text-[10px]">Yesterday</div>
          <div className="font-bold text-blue-600">{yesterdayRainIn}"</div>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div className="text-center">
          <div className="text-slate-400 text-[10px]">Temp</div>
          <div className="font-bold text-slate-700">{tempF !== null ? `${tempF}°` : "--"}</div>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div className="text-center">
          <div className="text-slate-400 text-[10px]">Ground</div>
          <div className="font-bold text-slate-700">{groundFrozen ? "🥶" : "💧"}</div>
        </div>
      </div>

      {/* 7-day rain history bars */}
      <div className="space-y-0.5 mb-1">
        {history.slice(0, 7).map((d) => (
          <div key={d.date} className="flex items-center gap-2 text-[10px]">
            <span className="w-14 text-right text-slate-400 font-medium">{d.label}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2 relative overflow-hidden">
              {d.precipIn > 0 && (
                <div
                  className={`absolute left-0 top-0 h-full rounded-full ${d.precipIn > 0.5 ? "bg-blue-400" : "bg-blue-300"} ${precipBarWidth(d.precipIn)}`}
                />
              )}
            </div>
            <span className="w-10 text-slate-500 font-medium">{d.precipIn > 0 ? `${d.precipIn}"` : "—"}</span>
          </div>
        ))}
      </div>

      {/* Rain expected warning */}
      {rainExpected && (
        <p className="text-[10px] text-amber-600 text-center font-medium pt-1">
          ⚠️ More rain expected — conditions may worsen
        </p>
      )}
    </div>
  );
}
