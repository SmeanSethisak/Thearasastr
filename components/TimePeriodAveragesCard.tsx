"use client";

import { TimePeriodAverages } from "@/hooks/useWaterLevels";

interface TimePeriodAveragesCardProps {
  averages: TimePeriodAverages | null;
  loading: boolean;
  error: string | null;
}

export function TimePeriodAveragesCard({
  averages,
  loading,
  error,
}: TimePeriodAveragesCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm">Error: {error}</p>
      </div>
    );
  }

  if (!averages) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Time Period Averages
        </h3>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const periods = [
    {
      label: "Last 1 Hour",
      value: averages.last1hour,
      icon: "🕐",
      color: "blue",
    },
    {
      label: "Last 6 Hours",
      value: averages.last6hours,
      icon: "🕕",
      color: "green",
    },
    {
      label: "Last 12 Hours",
      value: averages.last12hours,
      icon: "🕛",
      color: "purple",
    },
    {
      label: "Last 24 Hours",
      value: averages.last24hours,
      icon: "📅",
      color: "orange",
    },
  ];

  const colorClasses: Record<
    string,
    { bg: string; border: string; text: string }
  > = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📊 Time Period Averages
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {periods.map((period) => {
          const colors = colorClasses[period.color];
          return (
            <div
              key={period.label}
              className={`${colors.bg} border ${colors.border} rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{period.icon}</span>
                <span className="text-sm text-gray-600">{period.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${colors.text}`}>
                  {period.value > 0 ? period.value.toFixed(1) : "—"}
                </span>
                {period.value > 0 && (
                  <span className="text-sm text-gray-500">cm</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
