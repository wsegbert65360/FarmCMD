interface DryingCardProps {
  tempF: number | null;
  humidity: number | null;
  windMph: number | null;
  gustMph: number | null;
  rating: string;
  reason: string;
  tempRating: string;
  humidityRating: string;
  windRating: string;
  error?: string;
}

function ratingBadge(rating: string): { bg: string; text: string } {
  switch (rating) {
    case "Excellent": return { bg: "bg-green-500", text: "EXCELLENT" };
    case "Good": return { bg: "bg-lime-500", text: "GOOD" };
    case "Fair": return { bg: "bg-amber-400", text: "FAIR" };
    default: return { bg: "bg-slate-400", text: "POOR" };
  }
}

function factorBg(score: number): string {
  if (score >= 4) return "bg-green-50 text-green-700";
  if (score >= 3) return "bg-lime-50 text-lime-700";
  if (score >= 2) return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-500";
}

function factorEmoji(rating: string): string {
  switch (rating) {
    case "Hot": return "🌡️";
    case "Warm": return "☀️";
    case "Cool": return "🌤️";
    case "Cold": return "❄️";
    case "Dry": return "🏜️";
    case "Moderate": return "🌤️";
    case "Humid": return "💧";
    case "Very Humid": return "🌧️";
    case "Windy": return "💨";
    case "Breezy": return "🍃";
    default: return "🍃";
  }
}

export default function DryingCard({ tempF, humidity, windMph, gustMph, rating, reason, tempRating, humidityRating, windRating, error }: DryingCardProps) {
  if (error && !tempF) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Drying</h2>
        <p className="text-sm text-slate-400 text-center py-2">{error}</p>
      </div>
    );
  }

  const badge = ratingBadge(rating);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-slate-900">Drying</h2>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${badge.bg}`}>
          {badge.text}
        </span>
      </div>

      {/* Factor rows */}
      <div className="space-y-1 mb-2">
        <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${factorBg(tempRating === "Hot" ? 4 : tempRating === "Warm" ? 3 : tempRating === "Cool" ? 2 : 1)}`}>
          <span className="text-sm">{factorEmoji(tempRating)}</span>
          <span className="text-xs font-medium text-slate-700 flex-1">Temp</span>
          <span className="text-sm font-bold">{tempF !== null ? `${tempF}°` : "--"}</span>
        </div>
        <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${factorBg(humidityRating === "Dry" ? 4 : humidityRating === "Moderate" ? 3 : humidityRating === "Humid" ? 2 : 1)}`}>
          <span className="text-sm">{factorEmoji(humidityRating)}</span>
          <span className="text-xs font-medium text-slate-700 flex-1">Humidity</span>
          <span className="text-sm font-bold">{humidity !== null ? `${humidity}%` : "--"}</span>
        </div>
        <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${factorBg(windRating === "Windy" ? 4 : windRating === "Breezy" ? 3 : 2)}`}>
          <span className="text-sm">{factorEmoji(windRating)}</span>
          <span className="text-xs font-medium text-slate-700 flex-1">Wind</span>
          <span className="text-sm font-bold">{windMph !== null ? `${windMph} mph` : "--"}</span>
          {gustMph !== null && (
            <span className="text-[10px] text-slate-400">G:{gustMph}</span>
          )}
        </div>
      </div>

      {/* Reason */}
      <p className="text-xs text-slate-500 text-center italic px-1">
        {reason}
      </p>
    </div>
  );
}
