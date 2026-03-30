"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 text-center">
      <h2 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h2>
      <p className="text-sm text-slate-500 mb-4">
        {error.message || "An unexpected error occurred loading the dashboard."}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
