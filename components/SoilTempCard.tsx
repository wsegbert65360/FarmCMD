interface SoilTempCardProps {
  surfaceF: number | null;
  sixInchF: number | null;
  eighteenInchF: number | null;
  fourFootF: number | null;
  error?: string;
}

function depthColor(temp: number | null): string {
  if (temp === null) return "bg-slate-100 text-slate-400";
  if (temp >= 65) return "bg-green-50 text-green-700";
  if (temp >= 55) return "bg-yellow-50 text-yellow-700";
  if (temp >= 45) return "bg-orange-50 text-orange-700";
  return "bg-blue-50 text-blue-700";
}

function formatTemp(temp: number | null): string {
  return temp !== null ? `${temp}°` : "--";
}

export default function SoilTempCard({ surfaceF, sixInchF, eighteenInchF, fourFootF, error }: SoilTempCardProps) {
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Soil Temp</h2>
        <p className="text-sm text-slate-400 text-center py-2">{error}</p>
      </div>
    );
  }

  const depths = [
    { label: "0 in", value: surfaceF, sublabel: "Surface" },
    { label: "6 in", value: sixInchF, sublabel: "Seed zone" },
    { label: "18 in", value: eighteenInchF, sublabel: "Root zone" },
    { label: "4 ft", value: fourFootF, sublabel: "Deep" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-slate-900">Soil Temp</h2>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {depths.map((d) => (
          <div key={d.label} className={`text-center rounded-lg p-2 ${depthColor(d.value)}`}>
            <p className="text-[10px] font-medium opacity-70">{d.label}</p>
            <p className="text-lg font-bold leading-tight">{formatTemp(d.value)}</p>
            <p className="text-[9px] opacity-60 leading-tight mt-0.5">{d.sublabel}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 mt-1.5 text-center">
        Corn: plant at 50°F+ (2in) &middot; Soybeans: 55°F+
      </p>
    </div>
  );
}
