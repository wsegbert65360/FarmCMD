export default function Loading() {
  return (
    <main className="space-y-2">
      {/* Grain skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-16 mb-3" />
        <div className="space-y-2">
          <div className="h-10 bg-slate-100 rounded" />
          <div className="h-10 bg-slate-100 rounded" />
        </div>
      </div>

      {/* Weather skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-16 mb-3" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-slate-100 rounded" />
          <div className="h-16 bg-slate-100 rounded" />
        </div>
      </div>

      {/* Spray skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-16 mb-3" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      </div>

      {/* Forecast skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-28 mb-3" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[72px] h-24 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>

      {/* News skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    </main>
  );
}
