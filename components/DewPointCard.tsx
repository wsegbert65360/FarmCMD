import { config } from "@/lib/config";

interface DewPointCardProps {
  dewPointF: number | null;
  humidityPct: number | null;
  tempF: number | null;
  advisory: string;
  error?: string;
}

function dewPointColor(dewPointF: number | null): string {
  if (dewPointF === null) return "text-slate-400";
  if (dewPointF < 55) return "text-green-600";
  if (dewPointF < 65) return "text-yellow-600";
  return "text-red-600";
}

function humidityColor(humidityPct: number | null): string {
  if (humidityPct === null) return "text-slate-400";
  if (humidityPct < 50) return "text-green-600";
  if (humidityPct < 70) return "text-yellow-600";
  return "text-red-600";
}

function dewPointBg(dewPointF: number | null): string {
  if (dewPointF === null) return "bg-slate-50";
  if (dewPointF < 55) return "bg-green-50";
  if (dewPointF < 65) return "bg-yellow-50";
  return "bg-red-50";
}

export default function DewPointCard({ dewPointF, humidityPct, tempF, advisory, error }: DewPointCardProps) {
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Dew Point</h2>
        <p className="text-sm text-slate-400 text-center py-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-slate-900">Dew Point</h2>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className={`text-center rounded-lg p-2 ${dewPointBg(dewPointF)}`}>
          <p className="text-[10px] text-slate-500">DEW PT</p>
          <p className={`text-xl font-bold leading-tight ${dewPointColor(dewPointF)}`}>
            {dewPointF !== null ? `${dewPointF}°` : "--"}
          </p>
        </div>
        <div className="text-center bg-blue-50 rounded-lg p-2">
          <p className="text-[10px] text-slate-500">HUMIDITY</p>
          <p className={`text-xl font-bold leading-tight ${humidityColor(humidityPct)}`}>
            {humidityPct !== null ? `${humidityPct}%` : "--"}
          </p>
        </div>
        <div className="text-center bg-slate-50 rounded-lg p-2">
          <p className="text-[10px] text-slate-500">TEMP</p>
          <p className="text-xl font-bold leading-tight text-slate-900">
            {tempF !== null ? `${tempF}°` : "--"}
          </p>
        </div>
      </div>
      <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
        <p className="text-xs text-slate-600">{advisory}</p>
      </div>
    </div>
  );
}
