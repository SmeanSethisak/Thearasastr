"use client";

import { WaterLevelReading } from "@/hooks/useWaterLevels";

interface LatestReadingsTableProps {
  readings: WaterLevelReading[];
  loading: boolean;
}

export function LatestReadingsTable({
  readings,
  loading,
}: LatestReadingsTableProps) {
  if (loading) {
    return (
      <div className="panel">
        <div className="panel-header">SYSTEM LOG — LATEST READINGS</div>
        <div className="p-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-[var(--bg-tertiary)] mb-2 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!readings || readings.length === 0) {
    return (
      <div className="panel">
        <div className="panel-header">SYSTEM LOG — LATEST READINGS</div>
        <div className="p-4">
          <p className="text-[var(--text-muted)] text-sm font-mono">
            NO READINGS AVAILABLE
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header flex items-center justify-between">
        <span>SYSTEM LOG — LATEST READINGS</span>
        <span className="text-[var(--text-muted)] font-mono text-[10px]">
          {readings.length} ENTRIES
        </span>
      </div>
      <div className="max-h-[350px] overflow-y-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Node ID</th>
              <th>Level</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((reading) => (
              <tr key={reading.id}>
                <td className="font-mono text-[var(--accent-primary)]">
                  {reading.device_id}
                </td>
                <td>
                  <span className="font-mono text-lg font-semibold text-[var(--text-primary)]">
                    {reading.water_level.toFixed(2)}
                  </span>
                  <span className="text-[var(--text-muted)] text-xs ml-1">
                    cm
                  </span>
                </td>
                <td className="font-mono text-[var(--text-muted)] text-xs">
                  {new Date(reading.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
