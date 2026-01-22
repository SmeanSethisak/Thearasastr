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
      <div className="panel">
        <div className="panel-header">FLOOD RISK ASSESSMENT</div>
        <div className="p-4">
          <div className="h-32 bg-[var(--bg-tertiary)] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <div className="panel-header flex items-center gap-3">
          <span className="status-dot critical" />
          <span>FLOOD RISK ASSESSMENT — ERROR</span>
        </div>
        <div className="p-4">
          <p className="text-[var(--status-critical)] text-sm font-mono">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="panel">
        <div className="panel-header">FLOOD RISK ASSESSMENT</div>
        <div className="p-4">
          <p className="text-[var(--text-muted)] text-sm font-mono">
            INSUFFICIENT DATA FOR PREDICTION
          </p>
        </div>
      </div>
    );
  }

  const riskConfig = {
    safe: {
      status: "nominal" as const,
      label: "SAFE",
      color: "var(--status-nominal)",
      bg: "var(--status-nominal-bg)",
    },
    warning: {
      status: "warning" as const,
      label: "WARNING",
      color: "var(--status-warning)",
      bg: "var(--status-warning-bg)",
    },
    critical: {
      status: "critical" as const,
      label: "CRITICAL",
      color: "var(--status-critical)",
      bg: "var(--status-critical-bg)",
    },
  };

  const config = riskConfig[prediction.level];

  return (
    <div className="panel">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`status-dot ${config.status}`} />
          <span>FLOOD RISK ASSESSMENT</span>
        </div>
        <span className="text-[var(--text-muted)] font-mono text-[10px]">
          {new Date(prediction.timestamp).toLocaleTimeString("en-US", {
            hour12: false,
          })}
        </span>
      </div>

      <div className="p-4">
        {/* Risk Level Display */}
        <div
          className="border p-4 mb-4"
          style={{ borderColor: config.color, backgroundColor: config.bg }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-lg font-bold tracking-wider"
              style={{ color: config.color }}
            >
              {config.label}
            </span>
            <span
              className="text-xs font-mono px-2 py-1"
              style={{
                color: config.color,
                backgroundColor: `${config.color}30`,
              }}
            >
              CONFIDENCE: {prediction.confidence}%
            </span>
          </div>

          {/* Risk Factors */}
          <div className="space-y-1">
            {prediction.factors.map((factor, index) => (
              <p
                key={index}
                className="text-[var(--text-secondary)] text-xs flex items-center gap-2"
              >
                <span style={{ color: config.color }}>▸</span> {factor}
              </p>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--bg-tertiary)] p-3 border border-[var(--border-secondary)]">
            <p className="metric-label mb-1">CURRENT LEVEL</p>
            <p className="font-mono text-xl font-semibold text-[var(--text-primary)]">
              {prediction.currentLevel.toFixed(1)}
              <span className="text-xs text-[var(--text-muted)] ml-1">cm</span>
            </p>
          </div>
          <div className="bg-[var(--bg-tertiary)] p-3 border border-[var(--border-secondary)]">
            <p className="metric-label mb-1">CHANGE RATE</p>
            <p
              className={`font-mono text-xl font-semibold ${
                prediction.changeRate >= 0
                  ? "text-[var(--status-critical)]"
                  : "text-[var(--status-info)]"
              }`}
            >
              {prediction.changeRate >= 0 ? "+" : ""}
              {prediction.changeRate.toFixed(2)}
              <span className="text-xs text-[var(--text-muted)] ml-1">
                cm/min
              </span>
            </p>
          </div>
          <div className="bg-[var(--bg-tertiary)] p-3 border border-[var(--border-secondary)]">
            <p className="metric-label mb-1">PREDICTED +30 MIN</p>
            <p className="font-mono text-xl font-semibold text-[var(--accent-primary)]">
              {prediction.predictedLevel30min.toFixed(1)}
              <span className="text-xs text-[var(--text-muted)] ml-1">cm</span>
            </p>
          </div>
          <div className="bg-[var(--bg-tertiary)] p-3 border border-[var(--border-secondary)]">
            <p className="metric-label mb-1">PREDICTED +60 MIN</p>
            <p className="font-mono text-xl font-semibold text-[var(--accent-primary)]">
              {prediction.predictedLevel60min.toFixed(1)}
              <span className="text-xs text-[var(--text-muted)] ml-1">cm</span>
            </p>
          </div>
        </div>
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
  const statusColor = isCritical
    ? "var(--status-critical)"
    : "var(--status-warning)";
  const bgColor = isCritical
    ? "var(--status-critical-bg)"
    : "var(--status-warning-bg)";

  return (
    <div
      className="border-b px-4 py-2 flex items-center justify-between"
      style={{ backgroundColor: bgColor, borderColor: statusColor }}
    >
      <div className="flex items-center gap-4">
        <span className={`status-dot ${isCritical ? "critical" : "warning"}`} />
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: statusColor }}
        >
          {isCritical ? "CRITICAL FLOOD RISK" : "FLOOD WARNING"}
        </span>
        <div
          className="flex gap-4 text-xs font-mono"
          style={{ color: statusColor }}
        >
          <span>{prediction.currentLevel.toFixed(1)}cm</span>
          {prediction.changeRate > 0 && (
            <span>+{prediction.changeRate.toFixed(2)} cm/min</span>
          )}
        </div>
      </div>
      <span className="text-[var(--text-muted)] text-xs font-mono">
        PRED +30m: {prediction.predictedLevel30min.toFixed(1)}cm
      </span>
    </div>
  );
}
