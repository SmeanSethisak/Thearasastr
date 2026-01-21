"use client";

import { WaterLevelStats } from "@/hooks/useWaterLevels";

interface StatCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: string;
  trend?: "up" | "down" | "stable";
}

export function StatCard({ title, value, unit, icon, trend }: StatCardProps) {
  const trendColor = {
    up: "text-red-500",
    down: "text-green-500",
    stable: "text-blue-500",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-gray-500 text-sm">{unit}</span>
      </div>
      {trend && (
        <div className={`text-sm mt-2 font-medium ${trendColor[trend]}`}>
          {trend === "up" && "↑ Rising"}
          {trend === "down" && "↓ Falling"}
          {trend === "stable" && "→ Stable"}
        </div>
      )}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <p className="text-gray-500 col-span-full">No data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Latest Reading"
        value={stats.latest.toFixed(1)}
        unit="cm"
        icon="💧"
      />
      <StatCard
        title="Maximum (24h)"
        value={stats.max.toFixed(1)}
        unit="cm"
        icon="📈"
        trend="up"
      />
      <StatCard
        title="Minimum (24h)"
        value={stats.min.toFixed(1)}
        unit="cm"
        icon="📉"
        trend="down"
      />
      <StatCard
        title="Average (24h)"
        value={stats.average.toFixed(1)}
        unit="cm"
        icon="📊"
        trend="stable"
      />
    </div>
  );
}
