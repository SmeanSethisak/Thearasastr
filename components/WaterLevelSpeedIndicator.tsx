"use client";

import { WaterLevelChangeRate } from "@/lib/types";

interface WaterLevelSpeedIndicatorProps {
  changeRate: WaterLevelChangeRate | null;
  loading: boolean;
  error: string | null;
}

export function WaterLevelSpeedIndicator({
  changeRate,
  loading,
  error,
}: WaterLevelSpeedIndicatorProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
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

  if (!changeRate) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📈 Water Level Speed
        </h3>
        <p className="text-gray-500 text-sm">
          Insufficient data to calculate rate
        </p>
      </div>
    );
  }

  const trendConfig = {
    rising: {
      icon: "↑",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      label: "Rising",
    },
    falling: {
      icon: "↓",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      label: "Falling",
    },
    stable: {
      icon: "→",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      label: "Stable",
    },
  };

  const strengthConfig = {
    slow: { label: "Slow", color: "text-gray-600", dots: 1 },
    moderate: { label: "Moderate", color: "text-yellow-600", dots: 2 },
    fast: { label: "Fast", color: "text-orange-600", dots: 3 },
    rapid: { label: "Rapid", color: "text-red-600", dots: 4 },
  };

  const trend = trendConfig[changeRate.trend];
  const strength = strengthConfig[changeRate.trendStrength];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          📈 Water Level Speed
        </h3>
        <span className="text-xs text-gray-500">
          Last {changeRate.timeDeltaMinutes.toFixed(1)} min
        </span>
      </div>

      {/* Main Trend Display */}
      <div className={`${trend.bg} border ${trend.border} rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-4xl font-bold ${trend.color}`}>
              {trend.icon}
            </span>
            <div>
              <p className={`${trend.color} font-semibold text-lg`}>
                {trend.label}
              </p>
              <p className="text-gray-600 text-sm">
                {Math.abs(changeRate.changeRate).toFixed(2)} cm/min
              </p>
            </div>
          </div>

          {/* Strength Indicator */}
          <div className="text-right">
            <p className={`${strength.color} font-medium text-sm`}>
              {strength.label}
            </p>
            <div className="flex gap-1 mt-1 justify-end">
              {[1, 2, 3, 4].map((dot) => (
                <div
                  key={dot}
                  className={`w-2 h-2 rounded-full ${
                    dot <= strength.dots
                      ? trend.color.replace("text-", "bg-")
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs mb-1">Current Level</p>
          <p className="text-lg font-bold text-gray-900">
            {changeRate.currentLevel.toFixed(1)}{" "}
            <span className="text-sm font-normal text-gray-500">cm</span>
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs mb-1">Previous Level</p>
          <p className="text-lg font-bold text-gray-900">
            {changeRate.previousLevel.toFixed(1)}{" "}
            <span className="text-sm font-normal text-gray-500">cm</span>
          </p>
        </div>
      </div>

      {/* Change Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Level Change:</span>
          <span
            className={`font-medium ${
              changeRate.changeRate >= 0 ? "text-red-600" : "text-blue-600"
            }`}
          >
            {changeRate.changeRate >= 0 ? "+" : ""}
            {(changeRate.currentLevel - changeRate.previousLevel).toFixed(2)} cm
          </span>
        </div>
      </div>
    </div>
  );
}

// Compact inline speed indicator for use in tables/lists
export function SpeedIndicatorBadge({
  changeRate,
}: {
  changeRate: WaterLevelChangeRate | null;
}) {
  if (!changeRate) {
    return <span className="text-gray-400 text-sm">--</span>;
  }

  const trendIcons = {
    rising: { icon: "↑", color: "text-red-600", bg: "bg-red-100" },
    falling: { icon: "↓", color: "text-blue-600", bg: "bg-blue-100" },
    stable: { icon: "→", color: "text-green-600", bg: "bg-green-100" },
  };

  const config = trendIcons[changeRate.trend];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded ${config.bg}`}
    >
      <span className={`${config.color} font-bold`}>{config.icon}</span>
      <span className={`${config.color} text-sm font-medium`}>
        {Math.abs(changeRate.changeRate).toFixed(2)} cm/min
      </span>
    </span>
  );
}

// Large display for dashboard header
export function SpeedIndicatorLarge({
  changeRate,
  loading,
}: {
  changeRate: WaterLevelChangeRate | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="animate-pulse flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
        <div className="w-20 h-6 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!changeRate) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-2xl">→</span>
        <span className="text-lg">-- cm/min</span>
      </div>
    );
  }

  const trendConfig = {
    rising: { icon: "↑", color: "text-red-500", animation: "animate-bounce" },
    falling: { icon: "↓", color: "text-blue-500", animation: "" },
    stable: { icon: "→", color: "text-green-500", animation: "" },
  };

  const config = trendConfig[changeRate.trend];
  const isRapid =
    changeRate.trendStrength === "rapid" || changeRate.trendStrength === "fast";

  return (
    <div className={`flex items-center gap-2 ${config.color}`}>
      <span className={`text-3xl font-bold ${isRapid ? config.animation : ""}`}>
        {config.icon}
      </span>
      <div>
        <span className="text-xl font-bold">
          {changeRate.changeRate >= 0 ? "+" : ""}
          {changeRate.changeRate.toFixed(2)}
        </span>
        <span className="text-sm ml-1">cm/min</span>
      </div>
    </div>
  );
}
