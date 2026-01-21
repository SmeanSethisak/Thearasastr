"use client";

import { FloodRiskPrediction } from "@/lib/types";

interface FloodRiskCardProps {
  prediction: FloodRiskPrediction | null;
  loading: boolean;
  error: string | null;
}

export function FloodRiskCard({
  prediction,
  loading,
  error,
}: FloodRiskCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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

  if (!prediction) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🌊 Flood Risk Prediction
        </h3>
        <p className="text-gray-500 text-sm">
          Insufficient data for prediction
        </p>
      </div>
    );
  }

  const riskConfig = {
    safe: {
      bg: "bg-green-50",
      border: "border-green-300",
      text: "text-green-800",
      badge: "bg-green-500",
      icon: "✅",
      label: "SAFE",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      text: "text-yellow-800",
      badge: "bg-yellow-500",
      icon: "⚠️",
      label: "WARNING",
    },
    critical: {
      bg: "bg-red-50",
      border: "border-red-300",
      text: "text-red-800",
      badge: "bg-red-500",
      icon: "🚨",
      label: "CRITICAL",
    },
  };

  const config = riskConfig[prediction.level];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          🌊 Flood Risk Prediction
        </h3>
        <span className="text-xs text-gray-500">
          Updated: {new Date(prediction.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Risk Level Display */}
      <div
        className={`${config.bg} border ${config.border} rounded-lg p-4 mb-4`}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <span
              className={`${config.badge} text-white text-sm font-bold px-3 py-1 rounded-full`}
            >
              {config.label}
            </span>
            <p className={`${config.text} text-sm mt-1`}>
              Flood risk level based on current conditions
            </p>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="mt-3 space-y-1">
          {prediction.factors.map((factor, index) => (
            <p
              key={index}
              className={`${config.text} text-sm flex items-center gap-2`}
            >
              <span>•</span> {factor}
            </p>
          ))}
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs mb-1">Current Level</p>
          <p className="text-xl font-bold text-gray-900">
            {prediction.currentLevel.toFixed(1)}{" "}
            <span className="text-sm font-normal">cm</span>
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs mb-1">Change Rate</p>
          <p
            className={`text-xl font-bold ${
              prediction.changeRate >= 0 ? "text-red-600" : "text-blue-600"
            }`}
          >
            {prediction.changeRate >= 0 ? "+" : ""}
            {prediction.changeRate.toFixed(2)}
            <span className="text-sm font-normal"> cm/min</span>
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-blue-600 text-xs mb-1">Predicted (30 min)</p>
          <p className="text-xl font-bold text-blue-800">
            {prediction.predictedLevel30min.toFixed(1)}{" "}
            <span className="text-sm font-normal">cm</span>
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-purple-600 text-xs mb-1">Predicted (60 min)</p>
          <p className="text-xl font-bold text-purple-800">
            {prediction.predictedLevel60min.toFixed(1)}{" "}
            <span className="text-sm font-normal">cm</span>
          </p>
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-xs">Confidence:</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${prediction.confidence}%` }}
          />
        </div>
        <span className="text-gray-600 text-xs font-medium">
          {prediction.confidence}%
        </span>
      </div>
    </div>
  );
}

// Compact Risk Banner for top of page
export function FloodRiskBanner({
  prediction,
  loading,
}: {
  prediction: FloodRiskPrediction | null;
  loading: boolean;
}) {
  if (loading || !prediction || prediction.level === "safe") return null;

  const isCritical = prediction.level === "critical";
  const bgClass = isCritical
    ? "bg-gradient-to-r from-red-600 to-red-500"
    : "bg-gradient-to-r from-yellow-500 to-orange-500";

  return (
    <div className={`${bgClass} text-white px-4 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl animate-[pulse_3s_ease-in-out_infinite]">
            {isCritical ? "🚨" : "⚠️"}
          </span>
          <span className="font-medium">
            {isCritical ? "CRITICAL FLOOD RISK" : "Flood Warning"}
          </span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
            {prediction.currentLevel.toFixed(1)} cm
          </span>
          {prediction.changeRate > 0 && (
            <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
              +{prediction.changeRate.toFixed(2)} cm/min
            </span>
          )}
        </div>
        <span className="text-sm opacity-80">
          Predicted: {prediction.predictedLevel30min.toFixed(1)} cm in 30 min
        </span>
      </div>
    </div>
  );
}
