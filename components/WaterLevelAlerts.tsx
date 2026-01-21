"use client";

import { AnomalyAlert } from "@/hooks/useWaterLevels";

interface WaterLevelAlertsProps {
  alerts: AnomalyAlert[];
  loading: boolean;
  error: string | null;
  highThreshold: number;
  lowThreshold: number;
}

export function WaterLevelAlerts({
  alerts,
  loading,
  error,
  highThreshold,
  lowThreshold,
}: WaterLevelAlertsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm">Error loading alerts: {error}</p>
      </div>
    );
  }

  const highAlerts = alerts.filter((a) => a.type === "high");
  const lowAlerts = alerts.filter((a) => a.type === "low");

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          ⚠️ Water Level Alerts
        </h3>
        <span className="text-xs text-gray-500">Last hour</span>
      </div>

      {/* Threshold Info */}
      <div className="flex gap-4 mb-4 text-xs">
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
          High: &gt;{highThreshold}cm
        </span>
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
          Low: &lt;{lowThreshold}cm
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-green-800 font-medium">All Normal</p>
              <p className="text-green-600 text-sm">
                Water levels are within safe thresholds
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Summary */}
          <div className="flex gap-4 mb-4">
            {highAlerts.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-100 rounded-lg">
                <span className="text-red-600 font-bold text-lg">
                  {highAlerts.length}
                </span>
                <span className="text-red-700 text-sm">High alerts</span>
              </div>
            )}
            {lowAlerts.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 font-bold text-lg">
                  {lowAlerts.length}
                </span>
                <span className="text-blue-700 text-sm">Low alerts</span>
              </div>
            )}
          </div>

          {/* Alert List */}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {alerts.slice(0, 10).map((alert, index) => (
              <AlertItem key={index} alert={alert} />
            ))}
            {alerts.length > 10 && (
              <p className="text-gray-500 text-sm text-center py-2">
                +{alerts.length - 10} more alerts
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AlertItem({ alert }: { alert: AnomalyAlert }) {
  const isHigh = alert.type === "high";
  const bgColor = isHigh ? "bg-red-50" : "bg-blue-50";
  const borderColor = isHigh ? "border-red-300" : "border-blue-300";
  const textColor = isHigh ? "text-red-800" : "text-blue-800";
  const icon = isHigh ? "🔴" : "🔵";

  return (
    <div
      className={`${bgColor} border ${borderColor} rounded-lg p-3 flex items-start gap-3`}
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`${textColor} font-medium text-sm`}>{alert.message}</p>
        <p className="text-gray-500 text-xs mt-1">
          {new Date(alert.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// Compact alert banner for top of page
export function AlertBanner({
  alerts,
  loading,
}: {
  alerts: AnomalyAlert[];
  loading: boolean;
}) {
  if (loading || alerts.length === 0) return null;

  const highCount = alerts.filter((a) => a.type === "high").length;
  const lowCount = alerts.filter((a) => a.type === "low").length;

  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl animate-[pulse_3s_ease-in-out_infinite]">
            ⚠️
          </span>
          <span className="font-medium">
            {alerts.length} abnormal reading{alerts.length > 1 ? "s" : ""}{" "}
            detected
          </span>
          <div className="flex gap-2 ml-2">
            {highCount > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                {highCount} high
              </span>
            )}
            {lowCount > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                {lowCount} low
              </span>
            )}
          </div>
        </div>
        <span className="text-sm opacity-80">Last hour</span>
      </div>
    </div>
  );
}
