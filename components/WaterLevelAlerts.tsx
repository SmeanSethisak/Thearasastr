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
      <div className="panel">
        <div className="panel-header">ALERT MONITOR</div>
        <div className="p-4">
          <div className="h-20 bg-[var(--bg-tertiary)] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <div className="panel-header flex items-center gap-3">
          <span className="status-dot critical" />
          <span>ALERT MONITOR — ERROR</span>
        </div>
        <div className="p-4">
          <p className="text-[var(--status-critical)] text-sm font-mono">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const highAlerts = alerts.filter((a) => a.type === "high");
  const lowAlerts = alerts.filter((a) => a.type === "low");
  const hasAlerts = alerts.length > 0;

  return (
    <div className="panel">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`status-dot ${hasAlerts ? "critical" : "nominal"}`}
          />
          <span>ALERT MONITOR</span>
        </div>
        <span className="text-[var(--text-muted)] font-mono text-[10px]">
          LAST 60 MIN
        </span>
      </div>

      <div className="p-4">
        {/* Threshold Info */}
        <div className="flex gap-4 mb-4 text-[10px] font-mono">
          <span className="text-[var(--status-critical)]">
            HIGH THRESHOLD: {highThreshold}cm
          </span>
          <span className="text-[var(--status-warning)]">
            LOW THRESHOLD: {lowThreshold}cm
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-[var(--status-nominal-bg)] border border-[var(--status-nominal)] p-4">
            <div className="flex items-center gap-3">
              <span className="status-dot nominal" />
              <div>
                <p className="text-[var(--status-nominal)] font-semibold text-sm">
                  ALL SYSTEMS NOMINAL
                </p>
                <p className="text-[var(--text-muted)] text-xs mt-1">
                  Water levels within operational parameters
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Alert Summary */}
            <div className="flex gap-3 mb-4">
              {highAlerts.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--status-critical-bg)] border border-[var(--status-critical)]">
                  <span className="text-[var(--status-critical)] font-mono font-bold text-lg">
                    {highAlerts.length}
                  </span>
                  <span className="text-[var(--status-critical)] text-xs uppercase tracking-wide">
                    High
                  </span>
                </div>
              )}
              {lowAlerts.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--status-warning-bg)] border border-[var(--status-warning)]">
                  <span className="text-[var(--status-warning)] font-mono font-bold text-lg">
                    {lowAlerts.length}
                  </span>
                  <span className="text-[var(--status-warning)] text-xs uppercase tracking-wide">
                    Low
                  </span>
                </div>
              )}
            </div>

            {/* Alert List */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {alerts.slice(0, 10).map((alert, index) => (
                <AlertEntry key={index} alert={alert} />
              ))}
              {alerts.length > 10 && (
                <p className="text-[var(--text-muted)] text-xs text-center py-2 font-mono">
                  +{alerts.length - 10} MORE ENTRIES
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AlertEntry({ alert }: { alert: AnomalyAlert }) {
  const isHigh = alert.type === "high";
  const statusColor = isHigh
    ? "var(--status-critical)"
    : "var(--status-warning)";
  const bgColor = isHigh
    ? "var(--status-critical-bg)"
    : "var(--status-warning-bg)";

  return (
    <div
      className="border-l-2 p-3"
      style={{
        borderLeftColor: statusColor,
        backgroundColor: bgColor,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5"
              style={{
                color: statusColor,
                backgroundColor: `${statusColor}30`,
              }}
            >
              {alert.type}
            </span>
            <span className="font-mono text-xs" style={{ color: statusColor }}>
              {alert.currentLevel.toFixed(1)}cm
            </span>
          </div>
          <p className="text-[var(--text-secondary)] text-xs">
            {alert.message}
          </p>
        </div>
        <span className="text-[var(--text-muted)] text-[10px] font-mono whitespace-nowrap ml-2">
          {new Date(alert.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
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
  const isCritical = highCount > 0;

  return (
    <div
      className="border-b px-4 py-2 flex items-center justify-between"
      style={{
        backgroundColor: isCritical
          ? "var(--status-critical-bg)"
          : "var(--status-warning-bg)",
        borderColor: isCritical
          ? "var(--status-critical)"
          : "var(--status-warning)",
      }}
    >
      <div className="flex items-center gap-4">
        <span className={`status-dot ${isCritical ? "critical" : "warning"}`} />
        <span
          className="text-xs font-semibold uppercase tracking-wide"
          style={{
            color: isCritical
              ? "var(--status-critical)"
              : "var(--status-warning)",
          }}
        >
          {alerts.length} ALERT{alerts.length > 1 ? "S" : ""} DETECTED
        </span>
        <div className="flex gap-2 text-xs font-mono">
          {highCount > 0 && (
            <span className="text-[var(--status-critical)]">
              {highCount} HIGH
            </span>
          )}
          {lowCount > 0 && (
            <span className="text-[var(--status-warning)]">{lowCount} LOW</span>
          )}
        </div>
      </div>
      <span className="text-[var(--text-muted)] text-[10px] font-mono">
        LAST 60 MIN
      </span>
    </div>
  );
}
