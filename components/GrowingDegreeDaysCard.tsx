interface GDDCardProps {
  todayGDD: number;
  seasonGDD: number;
  soySeasonGDD: number;
  weekGDD: number;
  dailyGDD: { date: string; gdd: number }[];
  error?: string;
}

function formatDay(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
}

function barHeight(gdd: number, maxGDD: number): string {
  if (maxGDD === 0) return "h-1";
  const pct = Math.max(4, (gdd / maxGDD) * 100);
  return `h-[${Math.round(pct)}%]`;
}

export default function GDDCard({ todayGDD, seasonGDD, soySeasonGDD, weekGDD, dailyGDD, error }: GDDCardProps) {
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Growing Degree Days</h2>
        <p className="text-sm text-slate-400 text-center py-2">{error}</p>
      </div>
    );
  }

  const maxDailyGDD = Math.max(...dailyGDD.map(d => d.gdd), 1);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-slate-900">Growing Degree Days</h2>
        <span className="text-[10px] text-slate-400">Base 50°F</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <div className="text-center bg-green-50 rounded-lg p-1.5">
          <p className="text-[10px] text-slate-500">TODAY</p>
          <p className="text-lg font-bold text-green-700">{todayGDD}</p>
        </div>
        <div className="text-center bg-amber-50 rounded-lg p-1.5">
          <p className="text-[10px] text-slate-500">CORN</p>
          <p className="text-lg font-bold text-amber-700">{Math.round(seasonGDD)}</p>
          <p className="text-[8px] text-slate-400">since Apr 1</p>
        </div>
        <div className="text-center bg-lime-50 rounded-lg p-1.5">
          <p className="text-[10px] text-slate-500">SOY</p>
          <p className="text-lg font-bold text-lime-700">{Math.round(soySeasonGDD)}</p>
          <p className="text-[8px] text-slate-400">since May 1</p>
        </div>
      </div>

      {/* 7-day mini bar chart */}
      <div className="bg-slate-50 rounded-lg p-2">
        <div className="flex items-end gap-1 h-12">
          {dailyGDD.map((d) => {
            const heightPct = Math.max(4, (d.gdd / maxDailyGDD) * 100);
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
                <span className="text-[8px] text-slate-500 leading-none">{d.gdd > 0 ? d.gdd : ""}</span>
                <div
                  className="w-full bg-green-400 rounded-t-sm min-h-[2px] transition-all"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>
        <p className="text-[9px] text-slate-400 mt-1 text-center">
          7-day total: {weekGDD} GDD
        </p>
      </div>
    </div>
  );
}
