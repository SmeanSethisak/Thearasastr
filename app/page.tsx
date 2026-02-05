"use client";

import { useState } from "react";
import {
  useLatestReadings,
  useDeviceStats,
  useAvailableDevices,
  useAnomalyDetection,
  useFloodRiskPrediction,
  useWaterLevelChangeRate,
} from "@/hooks/useWaterLevels";
import { AppLayout, PageHeader, PageContent } from "@/components/AppLayout";
import { StatsGrid } from "@/components/StatsGrid";
import { FloodRiskCard, FloodRiskBanner } from "@/components/FloodRiskCard";
import { WaterLevelSpeedIndicator } from "@/components/WaterLevelSpeedIndicator";
import { AlertBanner } from "@/components/WaterLevelAlerts";

// Threshold constants
const HIGH_THRESHOLD = 150;
const LOW_THRESHOLD = 10;

export default function DashboardPage() {
  const { devices, loading: devicesLoading } = useAvailableDevices();
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  // Set default device when devices load
  if (devices.length > 0 && !selectedDevice) {
    setSelectedDevice(devices[0]);
  }

  const [stats, statsLoading, statsError] = useDeviceStats(selectedDevice, 24);
  const [floodRisk, floodRiskLoading, floodRiskError] =
    useFloodRiskPrediction(selectedDevice);
  const [changeRate, changeRateLoading, changeRateError] =
    useWaterLevelChangeRate(selectedDevice);
  const [alerts] = useAnomalyDetection(
    selectedDevice,
    HIGH_THRESHOLD,
    LOW_THRESHOLD
  );

  return (
    <AppLayout alertCount={alerts?.length || 0}>
      {/* Critical Alerts Banner */}
      <FloodRiskBanner prediction={floodRisk} loading={floodRiskLoading} />
      <AlertBanner alerts={alerts} loading={false} />

      <PageHeader
        title="Dashboard"
        description="Overview of water level monitoring system"
        actions={
          <div className="flex items-center gap-3">
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
        }
      />

      <PageContent>
        {/* Primary Metrics */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            Current Statistics
          </h2>
          <StatsGrid stats={stats} loading={statsLoading} />
          {statsError && (
            <div className="mt-2 p-3 border border-[var(--status-critical)] bg-[var(--status-critical-bg)] rounded">
              <p className="text-[var(--status-critical)] text-xs font-mono">
                ERROR: {statsError}
              </p>
            </div>
          )}
        </div>

        {/* Risk Assessment Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Flood Risk Assessment
            </h2>
            <FloodRiskCard
              prediction={floodRisk}
              loading={floodRiskLoading}
              error={floodRiskError}
            />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Water Level Change Rate
            </h2>
            <WaterLevelSpeedIndicator
              changeRate={changeRate}
              loading={changeRateLoading}
              error={changeRateError}
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickLinkCard
            title="View Analytics"
            description="Detailed charts and time series data"
            href="/analytics"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
          />
          <QuickLinkCard
            title="View Alerts"
            description={`${alerts?.length || 0} active alerts`}
            href="/alerts"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            }
            highlight={alerts && alerts.length > 0}
          />
          <QuickLinkCard
            title="Generate Report"
            description="Create and send reports"
            href="/reports"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          />
        </div>
      </PageContent>
    </AppLayout>
  );
}

function QuickLinkCard({
  title,
  description,
  href,
  icon,
  highlight = false,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <a
      href={href}
      className={`panel p-4 flex items-center gap-4 hover:border-[var(--accent-primary)] transition-colors ${
        highlight ? "border-[var(--status-critical)]" : ""
      }`}
    >
      <div
        className={`p-3 rounded ${
          highlight
            ? "bg-[var(--status-critical-bg)] text-[var(--status-critical)]"
            : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
        }`}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
        <p className="text-sm text-[var(--text-muted)]">{description}</p>
      </div>
    </a>
  );
}
