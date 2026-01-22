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
      <div className="panel">
        <div className="panel-header">TIME PERIOD ANALYSIS</div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-[var(--bg-tertiary)] animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <div className="panel-header flex items-center gap-3">
          <span className="status-dot critical" />
          <span>TIME PERIOD ANALYSIS — ERROR</span>
        </div>
        <div className="p-4">
          <p className="text-[var(--status-critical)] text-sm font-mono">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!averages) {
    return (
      <div className="panel">
        <div className="panel-header">TIME PERIOD ANALYSIS</div>
        <div className="p-4">
          <p className="text-[var(--text-muted)] text-sm font-mono">
            NO DATA AVAILABLE
          </p>
        </div>
      </div>
    );
  }

  const periods = [
    { label: "1 HOUR", value: averages.last1hour, key: "1h" },
    { label: "6 HOURS", value: averages.last6hours, key: "6h" },
    { label: "12 HOURS", value: averages.last12hours, key: "12h" },
    { label: "24 HOURS", value: averages.last24hours, key: "24h" },
  ];

  return (
    <div className="panel">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="status-dot nominal" />
          <span>TIME PERIOD ANALYSIS</span>
        </div>
        <span className="text-[var(--text-muted)] font-mono text-[10px]">
          AVG READINGS
        </span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {periods.map((period) => (
            <div
              key={period.key}
              className="bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] p-3"
            >
              <p className="metric-label mb-2">{period.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl font-semibold text-[var(--text-primary)]">
                  {period.value > 0 ? period.value.toFixed(1) : "—"}
                </span>
                {period.value > 0 && (
                  <span className="text-xs text-[var(--text-muted)]">cm</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
