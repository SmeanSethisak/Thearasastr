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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Latest Readings
        </h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!readings || readings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Latest Readings
        </h2>
        <p className="text-gray-500">No readings available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Latest Readings
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Device
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Water Level
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {readings.map((reading) => (
              <tr
                key={reading.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-4 text-gray-900 font-medium">
                  {reading.device_id}
                </td>
                <td className="py-3 px-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {reading.water_level.toFixed(2)}
                  </span>
                  <span className="text-gray-500 ml-1">cm</span>
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                  {new Date(reading.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
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
