interface RainTimelineCardProps {
  hours: {
    time: string;
    label: string;
    prob: number;
    precipIn: number;
    isNow: boolean;
  }[];
  totalPrecipIn: number;
  dryStreak: number;
  rainSoon: boolean;
  error?: string;
}

function barColor(prob: number): string {
  if (prob >= 70) return "bg-red-500";
  if (prob >= 50) return "bg-orange-400";
  if (prob >= 30) return "bg-amber-300";
  if (prob >= 15) return "bg-yellow-200";
  return "bg-green-300";
}

function barBorderColor(prob: number): string {
  if (prob >= 70) return "border-red-600";
  if (prob >= 50) return "border-orange-500";
  if (prob >= 30) return "border-amber-400";
  if (prob >= 15) return "border-yellow-300";
  return "border-green-400";
}

function precipLabel(precipIn: number): string {
  if (precipIn === 0) return "";
  if (precipIn < 0.01) return "<.01\"";
  return `${precipIn}"`;
}

export default function RainTimelineCard({ hours, totalPrecipIn, dryStreak, rainSoon, error }: RainTimelineCardProps) {
  if (error && hours.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Rain Timeline</h2>
        <p className="text-sm text-slate-400 text-center py-2">{error}</p>
      </div>
    );
  }

  // Summary message
  let summary = "";
  if (rainSoon && totalPrecipIn > 0.5) {
    summary = `Rain arriving soon — ${totalPrecipIn}" expected in 24hrs`;
  } else if (rainSoon) {
    summary = "Light rain possible in the next few hours";
  } else if (totalPrecipIn > 0) {
    summary = `${totalPrecipIn}" rain expected in next 24hrs — mostly dry for now`;
  } else if (dryStreak >= 12) {
    summary = `All clear for ${dryStreak}+ hours — great window`;
  } else if (dryStreak >= 6) {
    summary = `Dry stretch of ${dryStreak}hrs — good window`;
  } else {
    summary = "Scattered showers possible — watch the radar";
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-slate-900">Rain Timeline</h2>
        <span className="text-[10px] font-medium text-slate-400">Next 24hrs</span>
      </div>

      {/* Summary */}
      <p className="text-xs text-slate-600 mb-2">{summary}</p>

      {/* Timeline bars */}
      <div className="flex gap-[2px] mb-2">
        {hours.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            {/* Bar */}
            <div
              className={`w-full rounded-sm border-t-2 ${barColor(h.prob)} ${barBorderColor(h.prob)} transition-colors`}
              style={{ height: `${Math.max(20, Math.min(48, h.prob * 0.48))}px` }}
              title={`${h.label}: ${h.prob}% chance, ${precipLabel(h.precipIn)}`}
            >
              {/* Probability text inside bar if tall enough */}
              {h.prob >= 30 && (
                <span className="block text-center text-[8px] font-bold text-white leading-tight pt-0.5">
                  {h.prob}
                </span>
              )}
            </div>
            {/* Hour label */}
            <span className={`text-[7px] ${h.isNow ? "font-bold text-sky-600" : "text-slate-400"} leading-none`}>
              {h.isNow ? "Now" : i % 3 === 0 ? h.label : ""}
            </span>
            {/* Precip amount under bar */}
            {h.precipIn > 0 && (
              <span className="text-[7px] text-blue-500 font-medium leading-none">
                {precipLabel(h.precipIn)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Legend row */}
      <div className="flex items-center justify-center gap-3 text-[9px] text-slate-400 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-green-300 border border-green-400" />
          Clear
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-amber-300 border border-amber-400" />
          Low
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-orange-400 border border-orange-500" />
          Med
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-red-500 border border-red-600" />
          High
        </div>
        {dryStreak >= 3 && (
          <span className="ml-1 text-green-600 font-medium">
            {dryStreak}hr dry
          </span>
        )}
      </div>
    </div>
  );
}
