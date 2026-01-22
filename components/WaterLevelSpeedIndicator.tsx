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
      <div className="panel">
        <div className="panel-header">RATE OF CHANGE MONITOR</div>
        <div className="p-4">
          <div className="h-24 bg-[var(--bg-tertiary)] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <div className="panel-header flex items-center gap-3">
          <span className="status-dot critical" />
          <span>RATE OF CHANGE MONITOR — ERROR</span>
        </div>
        <div className="p-4">
          <p className="text-[var(--status-critical)] text-sm font-mono">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!changeRate) {
    return (
      <div className="panel">
        <div className="panel-header">RATE OF CHANGE MONITOR</div>
        <div className="p-4">
          <p className="text-[var(--text-muted)] text-sm font-mono">
            INSUFFICIENT DATA
          </p>
        </div>
      </div>
    );
  }

  const trendConfig = {
    rising: {
      status: "critical" as const,
      icon: "▲",
      label: "RISING",
      color: "var(--status-critical)",
    },
    falling: {
      status: "nominal" as const,
      icon: "▼",
      label: "FALLING",
      color: "var(--status-info)",
    },
    stable: {
      status: "nominal" as const,
      icon: "●",
      label: "STABLE",
      color: "var(--status-nominal)",
    },
  };

  const strengthConfig = {
    slow: { label: "SLOW", bars: 1 },
    moderate: { label: "MODERATE", bars: 2 },
    fast: { label: "FAST", bars: 3 },
    rapid: { label: "RAPID", bars: 4 },
  };

  const trend = trendConfig[changeRate.trend];
  const strength = strengthConfig[changeRate.trendStrength];

  return (
    <div className="panel">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`status-dot ${trend.status}`} />
          <span>RATE OF CHANGE MONITOR</span>
        </div>
        <span className="text-[var(--text-muted)] font-mono text-[10px]">
          Δt: {changeRate.timeDeltaMinutes.toFixed(1)}min
        </span>
      </div>

      <div className="p-4">
        {/* Main Trend Display */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-secondary)]">
          <div className="flex items-center gap-4">
            <span
              className="text-4xl font-bold font-mono"
              style={{ color: trend.color }}
            >
              {trend.icon}
            </span>
            <div>
              <p
                className="text-lg font-bold tracking-wide"
                style={{ color: trend.color }}
              >
                {trend.label}
              </p>
              <p className="font-mono text-2xl font-semibold text-[var(--text-primary)]">
                {Math.abs(changeRate.changeRate).toFixed(2)}
                <span className="text-xs text-[var(--text-muted)] ml-1">
                  cm/min
                </span>
              </p>
            </div>
          </div>

          {/* Strength Indicator */}
          <div className="text-right">
            <p className="metric-label mb-2">{strength.label}</p>
            <div className="flex gap-1 justify-end">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className="w-2 h-6"
                  style={{
                    backgroundColor:
                      bar <= strength.bars ? trend.color : "var(--bg-tertiary)",
                    opacity: bar <= strength.bars ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Level Comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--bg-tertiary)] p-3 border border-[var(--border-secondary)]">
            <p className="metric-label mb-1">CURRENT</p>
            <p className="font-mono text-xl font-semibold text-[var(--text-primary)]">
              {changeRate.currentLevel.toFixed(1)}
              <span className="text-xs text-[var(--text-muted)] ml-1">cm</span>
            </p>
          </div>
          <div className="bg-[var(--bg-tertiary)] p-3 border border-[var(--border-secondary)]">
            <p className="metric-label mb-1">PREVIOUS</p>
            <p className="font-mono text-xl font-semibold text-[var(--text-secondary)]">
              {changeRate.previousLevel.toFixed(1)}
              <span className="text-xs text-[var(--text-muted)] ml-1">cm</span>
            </p>
          </div>
        </div>

        {/* Delta Summary */}
        <div className="mt-3 pt-3 border-t border-[var(--border-secondary)] flex items-center justify-between">
          <span className="metric-label">LEVEL DELTA</span>
          <span
            className="font-mono font-semibold"
            style={{
              color:
                changeRate.changeRate >= 0
                  ? "var(--status-critical)"
                  : "var(--status-info)",
            }}
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
    return (
      <span className="text-[var(--text-muted)] text-xs font-mono">--</span>
    );
  }

  const trendConfig = {
    rising: { icon: "▲", color: "var(--status-critical)" },
    falling: { icon: "▼", color: "var(--status-info)" },
    stable: { icon: "●", color: "var(--status-nominal)" },
  };

  const config = trendConfig[changeRate.trend];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono"
      style={{
        color: config.color,
        backgroundColor: `${config.color}20`,
      }}
    >
      <span className="font-bold">{config.icon}</span>
      {Math.abs(changeRate.changeRate).toFixed(2)} cm/min
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
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="w-20 h-5 bg-[var(--bg-tertiary)] animate-pulse" />
      </div>
    );
  }

  if (!changeRate) {
    return (
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        <span className="text-xl font-mono">●</span>
        <span className="text-sm font-mono">-- cm/min</span>
      </div>
    );
  }

  const trendConfig = {
    rising: { icon: "▲", color: "var(--status-critical)" },
    falling: { icon: "▼", color: "var(--status-info)" },
    stable: { icon: "●", color: "var(--status-nominal)" },
  };

  const config = trendConfig[changeRate.trend];
  const isRapid =
    changeRate.trendStrength === "rapid" || changeRate.trendStrength === "fast";

  return (
    <div className="flex items-center gap-2" style={{ color: config.color }}>
      <span
        className={`text-2xl font-bold font-mono ${
          isRapid ? "animate-pulse" : ""
        }`}
      >
        {config.icon}
      </span>
      <div className="font-mono">
        <span className="text-lg font-bold">
          {changeRate.changeRate >= 0 ? "+" : ""}
          {changeRate.changeRate.toFixed(2)}
        </span>
        <span className="text-xs text-[var(--text-muted)] ml-1">cm/min</span>
      </div>
    </div>
  );
}
