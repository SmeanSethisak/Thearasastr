"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { WaterLevelReading } from "@/hooks/useWaterLevels";

interface TimeSeriesChartProps {
  data: WaterLevelReading[];
  loading: boolean;
  deviceId: string;
}

export function TimeSeriesChart({
  data,
  loading,
  deviceId,
}: TimeSeriesChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-96">
        <div className="h-full bg-gray-200 rounded animate-pulse flex items-center justify-center">
          <span className="text-gray-500">Loading chart...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-96 flex items-center justify-center">
        <p className="text-gray-500">No data available for {deviceId}</p>
      </div>
    );
  }

  const chartData = data.map((reading) => ({
    timestamp: new Date(reading.created_at).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    level: reading.water_level,
    fullTime: reading.created_at,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Water Level Trend - {deviceId}
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            label={{
              value: "Water Level (cm)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            formatter={(value) => [`${value.toFixed(2)} cm`, "Level"]}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="level"
            stroke="#3b82f6"
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
            name="Water Level"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
