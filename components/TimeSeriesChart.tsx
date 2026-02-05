"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { WaterLevelReading } from "@/hooks/useWaterLevels";

interface TimeSeriesChartProps {
  data: WaterLevelReading[];
  loading: boolean;
  deviceId: string;
  highThreshold?: number;
  lowThreshold?: number;
}

export function TimeSeriesChart({
  data,
  loading,
  deviceId,
  highThreshold = 150,
  lowThreshold = 10,
}: TimeSeriesChartProps) {
  if (loading) {
    return (
      <div className="panel h-[400px]">
        <div className="panel-header">TELEMETRY — WATER LEVEL</div>
        <div className="p-4 h-[calc(100%-44px)] flex items-center justify-center">
          <div className="text-[var(--text-muted)] text-sm font-mono">
            LOADING DATA STREAM...
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="panel h-[400px]">
        <div className="panel-header">TELEMETRY — WATER LEVEL</div>
        <div className="p-4 h-[calc(100%-44px)] flex items-center justify-center">
          <div className="text-center">
            <div className="text-[var(--text-muted)] text-sm font-mono mb-2">
              NO DATA AVAILABLE
            </div>
            <div className="text-[var(--text-muted)] text-xs">
              Node: {deviceId}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const chartData = data.map((reading) => ({
    timestamp: new Date(reading.created_at).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    level: reading.water_level,
    fullTime: reading.created_at,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--bg-panel)] border border-[var(--border-primary)] p-3">
          <p className="text-[var(--text-muted)] text-xs font-mono mb-1">
            {label}
          </p>
          <p className="text-[var(--text-primary)] font-mono text-lg">
            {payload[0].value.toFixed(2)}{" "}
            <span className="text-xs text-[var(--text-muted)]">cm</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="panel h-[400px]">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="status-dot nominal" />
          <span>TELEMETRY — WATER LEVEL</span>
        </div>
        <span className="font-mono text-[var(--text-muted)]">{deviceId}</span>
      </div>
      <div className="p-4 h-[calc(100%-44px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-secondary)"
              vertical={false}
            />
            <XAxis
              dataKey="timestamp"
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              axisLine={{ stroke: "var(--border-primary)" }}
              tickLine={{ stroke: "var(--border-primary)" }}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              axisLine={{ stroke: "var(--border-primary)" }}
              tickLine={{ stroke: "var(--border-primary)" }}
              domain={["auto", "auto"]}
              label={{
                value: "cm",
                angle: -90,
                position: "insideLeft",
                fill: "var(--text-muted)",
                fontSize: 10,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={highThreshold}
              stroke="var(--status-critical)"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
            />
            <ReferenceLine
              y={lowThreshold}
              stroke="var(--status-warning)"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="level"
              stroke="var(--accent-primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: "var(--accent-primary)",
                stroke: "var(--bg-panel)",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
