interface DewPointCardProps {
  tempF: number | null;
  dewPointF: number | null;
  humidity: number | null;
  comfort: string;
  sprayNote: string;
  error?: string;
}

function comfortColor(comfort: string): string {
  switch (comfort) {
    case "Comfortable": return "text-green-600";
    case "Slightly Humid": return "text-lime-600";
    case "Humid": return "text-yellow-600";
    case "Muggy": return "text-orange-600";
    case "Oppressive": return "text-red-600";
    default: return "text-slate-400";
  }
}

function humidityColor(humidity: number | null): string {
  if (humidity === null) return "bg-slate-50 text-slate-400";
  if (humidity < 40) return "bg-green-50 text-green-700";
  if (humidity < 60) return "bg-lime-50 text-lime-700";
  if (humidity < 80) return "bg-yellow-50 text-yellow-700";
  return "bg-red-50 text-red-700";
}

export default function DewPointCard({ tempF, dewPointF, humidity, comfort, sprayNote, error }: DewPointCardProps) {
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Humidity</h2>
        <p className="text-sm text-slate-400 text-center py-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-slate-900">Humidity</h2>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-2">
        {/* Air temp */}
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">AIR</p>
          <p className="text-lg font-bold text-blue-600">
            {tempF !== null ? `${tempF}°` : "--"}
          </p>
        </div>

        {/* Dew point */}
        <div className="bg-cyan-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">DEW PT</p>
          <p className="text-lg font-bold text-cyan-600">
            {dewPointF !== null ? `${dewPointF}°` : "--"}
          </p>
        </div>

        {/* Relative humidity */}
        <div className={`rounded-lg p-2 text-center ${humidityColor(humidity)}`}>
          <p className="text-[10px] opacity-70">RH</p>
          <p className="text-lg font-bold">
            {humidity !== null ? `${humidity}%` : "--"}
          </p>
        </div>
      </div>

      {/* Comfort level */}
      {comfort && (
        <div className="flex items-center justify-between px-1">
          <span className={`text-xs font-medium ${comfortColor(comfort)}`}>
            {comfort}
          </span>
          <span className="text-[10px] text-slate-400">
            {sprayNote}
          </span>
        </div>
      )}
    </div>
  );
}
