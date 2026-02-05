"use client";

import { useState } from "react";
import {
  useDeviceTimeSeries,
  useAvailableDevices,
  useTimePeriodAverages,
  useAnomalyDetection,
} from "@/hooks/useWaterLevels";
import { AppLayout, PageHeader, PageContent } from "@/components/AppLayout";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";
import { TimePeriodAveragesCard } from "@/components/TimePeriodAveragesCard";

const HIGH_THRESHOLD = 150;
const LOW_THRESHOLD = 10;

export default function AnalyticsPage() {
  const { devices, loading: devicesLoading } = useAvailableDevices();
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [timeRange, setTimeRange] = useState<24 | 7 | 30>(24);

  if (devices.length > 0 && !selectedDevice) {
    setSelectedDevice(devices[0]);
  }

  const { data: timeSeries, loading: timeSeriesLoading } = useDeviceTimeSeries(
    selectedDevice,
    timeRange
  );
  const [timePeriodAverages, averagesLoading, averagesError] =
    useTimePeriodAverages(selectedDevice);
  const [alerts] = useAnomalyDetection(
    selectedDevice,
    HIGH_THRESHOLD,
    LOW_THRESHOLD
  );

  return (
    <AppLayout alertCount={alerts?.length || 0}>
      <PageHeader
        title="Analytics"
        description="Water level trends and historical data analysis"
        actions={
          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Range:</span>
              {[
                { value: 24, label: "24H" },
                { value: 7, label: "7D" },
                { value: 30, label: "30D" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value as 24 | 7 | 30)}
                  className={`control-btn text-xs py-1.5 px-3 ${
                    timeRange === option.value ? "active" : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Device Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Device:</span>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                disabled={devicesLoading}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm rounded px-3 py-1.5 focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {devicesLoading ? (
                  <option>Loading...</option>
                ) : (
                  devices.map((device) => (
                    <option key={device} value={device}>
                      {device}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        }
      />

      <PageContent>
        {/* Main Time Series Chart */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            Water Level Over Time
          </h2>
          <TimeSeriesChart
            data={timeSeries}
            loading={timeSeriesLoading}
            deviceId={selectedDevice || "—"}
            highThreshold={HIGH_THRESHOLD}
            lowThreshold={LOW_THRESHOLD}
          />
        </div>

        {/* Time Period Averages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Time Period Averages
            </h2>
            <TimePeriodAveragesCard
              averages={timePeriodAverages}
              loading={averagesLoading}
              error={averagesError}
            />
          </div>

          {/* Summary Stats */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Data Summary
            </h2>
            <div className="panel p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-secondary)]">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Data Points
                  </span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {timeSeriesLoading ? "—" : timeSeries?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-secondary)]">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Time Range
                  </span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {timeRange === 24
                      ? "Last 24 Hours"
                      : timeRange === 7
                      ? "Last 7 Days"
                      : "Last 30 Days"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-secondary)]">
                  <span className="text-sm text-[var(--text-secondary)]">
                    High Threshold
                  </span>
                  <span className="font-mono text-[var(--status-critical)]">
                    {HIGH_THRESHOLD} cm
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Low Threshold
                  </span>
                  <span className="font-mono text-[var(--status-warning)]">
                    {LOW_THRESHOLD} cm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </AppLayout>
  );
}
