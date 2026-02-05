"use client";

import { WaterLevelStats } from "@/hooks/useWaterLevels";

interface StatCardProps {
  title: string;
  value: number | string;
  unit: string;
  status?: "nominal" | "warning" | "critical";
  trend?: "up" | "down" | "stable";
}

function StatCard({
  title,
  value,
  unit,
  status = "nominal",
  trend,
}: StatCardProps) {
  const statusColors = {
    nominal: "border-l-[var(--status-nominal)]",
    warning: "border-l-[var(--status-warning)]",
    critical: "border-l-[var(--status-critical)]",
  };

  const trendIndicator = {
    up: { icon: "▲", color: "text-[var(--status-critical)]" },
    down: { icon: "▼", color: "text-[var(--status-info)]" },
    stable: { icon: "●", color: "text-[var(--status-nominal)]" },
  };

  return (
    <div
      className={`bg-[var(--bg-panel)] border border-[var(--border-primary)] border-l-2 ${statusColors[status]}`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="metric-label">{title}</span>
          {trend && (
            <span className={`text-xs ${trendIndicator[trend].color}`}>
              {trendIndicator[trend].icon}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="metric-value">{value}</span>
          <span className="metric-unit">{unit}</span>
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  stats: WaterLevelStats | null;
  loading: boolean;
}

export function StatsGrid({ stats, loading }: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-[var(--bg-panel)] border border-[var(--border-primary)] h-24 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-[var(--bg-panel)] border border-[var(--border-primary)] p-4">
        <p className="text-[var(--text-muted)] text-sm">
          No telemetry data available
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        title="Current Level"
        value={stats.latest.toFixed(1)}
        unit="cm"
        status="nominal"
      />
      <StatCard
        title="Maximum"
        value={stats.max.toFixed(1)}
        unit="cm"
        trend="up"
      />
      <StatCard
        title="Minimum"
        value={stats.min.toFixed(1)}
        unit="cm"
        trend="down"
      />
      <StatCard
        title="Average"
        value={stats.average.toFixed(1)}
        unit="cm"
        trend="stable"
      />
    </div>
  );
}
