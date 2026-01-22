"use client";

import { useState } from "react";
import {
  useLatestReadings,
  useDeviceTimeSeries,
  useDeviceStats,
  useAvailableDevices,
  useTimePeriodAverages,
  useAnomalyDetection,
  useGenerateReport,
  useFloodRiskPrediction,
  useWaterLevelChangeRate,
  useSmartAlerts,
} from "@/hooks/useWaterLevels";
import { DEFAULT_ALERT_CONFIG } from "@/lib/types";
import { SystemShell, MainGrid, SectionGrid } from "@/components/SystemShell";
import { CommandHeader } from "@/components/CommandHeader";
import { StatsGrid } from "@/components/StatsGrid";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";
import { LatestReadingsTable } from "@/components/LatestReadingsTable";
import { WaterLevelAlerts, AlertBanner } from "@/components/WaterLevelAlerts";
import { TimePeriodAveragesCard } from "@/components/TimePeriodAveragesCard";
import { WaterLevelReportCard } from "@/components/WaterLevelReportCard";
import { FloodRiskCard, FloodRiskBanner } from "@/components/FloodRiskCard";
import { WaterLevelSpeedIndicator } from "@/components/WaterLevelSpeedIndicator";
import DeviceControl from "@/components/DeviceControl";

// Threshold constants
const HIGH_THRESHOLD = 150;
const LOW_THRESHOLD = 10;

// Alert configuration
const ALERT_CONFIG = {
  ...DEFAULT_ALERT_CONFIG,
  highThreshold: HIGH_THRESHOLD,
  lowThreshold: LOW_THRESHOLD,
  telegramEnabled: !!process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN,
  telegramBotToken: process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID,
};

export default function Home() {
  const { devices, loading: devicesLoading } = useAvailableDevices();
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [timeRange, setTimeRange] = useState<24 | 7 | 30>(24);

  // Set default device when devices load
  if (devices.length > 0 && !selectedDevice) {
    setSelectedDevice(devices[0]);
  }

  // Fetch data for all views
  const { data: latestReadings, loading: latestLoading } = useLatestReadings();
  const { data: timeSeries, loading: timeSeriesLoading } = useDeviceTimeSeries(
    selectedDevice,
    timeRange
  );
  const [stats, statsLoading, statsError] = useDeviceStats(
    selectedDevice,
    timeRange
  );

  // Hooks for alerts, averages, and reports
  const [timePeriodAverages, averagesLoading, averagesError] =
    useTimePeriodAverages(selectedDevice);
  const [alerts, alertsLoading, alertsError] = useAnomalyDetection(
    selectedDevice,
    HIGH_THRESHOLD,
    LOW_THRESHOLD
  );
  const [report, reportLoading, reportError] = useGenerateReport(
    selectedDevice,
    24
  );

  // Hooks for flood risk prediction and water level speed
  const [floodRisk, floodRiskLoading, floodRiskError] =
    useFloodRiskPrediction(selectedDevice);
  const [changeRate, changeRateLoading, changeRateError] =
    useWaterLevelChangeRate(selectedDevice);
  const [smartAlerts, smartAlertsLoading] = useSmartAlerts(
    selectedDevice,
    ALERT_CONFIG
  );

  return (
    <SystemShell>
      {/* Critical Alerts Banner */}
      <FloodRiskBanner prediction={floodRisk} loading={floodRiskLoading} />
      <AlertBanner alerts={alerts} loading={alertsLoading} />

      {/* Command Header */}
      <CommandHeader
        systemName="HYDRO-MON"
        deviceCount={devices.length}
        onlineCount={devices.length}
        selectedDevice={selectedDevice}
        onDeviceChange={setSelectedDevice}
        devices={devices}
        devicesLoading={devicesLoading}
      />

      {/* Main Grid Content */}
      <MainGrid>
        {/* Time Range Selector */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mr-2">
            Time Range
          </span>
          {[
            { value: 24, label: "24H" },
            { value: 7, label: "7D" },
            { value: 30, label: "30D" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value as 24 | 7 | 30)}
              className={`control-btn text-xs py-1.5 px-4 ${
                timeRange === option.value ? "active" : ""
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Primary Metrics Row */}
        <div className="mb-4">
          <StatsGrid stats={stats} loading={statsLoading} />
          {statsError && (
            <div className="mt-2 p-3 border border-[var(--status-critical)] bg-[var(--status-critical-bg)]">
              <p className="text-[var(--status-critical)] text-xs font-mono">
                ERROR: {statsError}
              </p>
            </div>
          )}
        </div>

        {/* Main Dashboard Grid - 3 columns on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column - Telemetry & Monitoring (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Telemetry Chart */}
            <TimeSeriesChart
              data={timeSeries}
              loading={timeSeriesLoading}
              deviceId={selectedDevice || "—"}
              highThreshold={HIGH_THRESHOLD}
              lowThreshold={LOW_THRESHOLD}
            />

            {/* Risk Assessment & Rate Monitor Row */}
            <SectionGrid cols={2}>
              <FloodRiskCard
                prediction={floodRisk}
                loading={floodRiskLoading}
                error={floodRiskError}
              />
              <WaterLevelSpeedIndicator
                changeRate={changeRate}
                loading={changeRateLoading}
                error={changeRateError}
              />
            </SectionGrid>

            {/* Alerts & Time Period Analysis Row */}
            <SectionGrid cols={2}>
              <WaterLevelAlerts
                alerts={alerts}
                loading={alertsLoading}
                error={alertsError}
                highThreshold={HIGH_THRESHOLD}
                lowThreshold={LOW_THRESHOLD}
              />
              <TimePeriodAveragesCard
                averages={timePeriodAverages}
                loading={averagesLoading}
                error={averagesError}
              />
            </SectionGrid>
          </div>

          {/* Right Column - Control & Logs (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* System Control Panel */}
            <DeviceControl
              currentWaterLevel={stats?.latest}
              highThreshold={HIGH_THRESHOLD}
              lowThreshold={LOW_THRESHOLD}
            />

            {/* System Log - Latest Readings */}
            <LatestReadingsTable
              readings={latestReadings}
              loading={latestLoading}
            />

            {/* Report Generator */}
            <WaterLevelReportCard
              report={report}
              loading={reportLoading}
              error={reportError}
            />
          </div>
        </div>

        {/* Smart Alerts Panel - Full Width */}
        {smartAlerts.length > 0 && (
          <div className="mt-4 panel">
            <div className="panel-header flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="status-dot critical" />
                <span>SMART ALERT NOTIFICATIONS</span>
              </div>
              <span className="text-[var(--text-muted)] font-mono text-[10px]">
                {smartAlerts.length} ACTIVE
              </span>
            </div>
            <div className="p-4">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {smartAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="border-l-2 p-3"
                    style={{
                      borderLeftColor:
                        alert.severity === "critical"
                          ? "var(--status-critical)"
                          : "var(--status-warning)",
                      backgroundColor:
                        alert.severity === "critical"
                          ? "var(--status-critical-bg)"
                          : "var(--status-warning-bg)",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5"
                            style={{
                              color:
                                alert.severity === "critical"
                                  ? "var(--status-critical)"
                                  : "var(--status-warning)",
                              backgroundColor:
                                alert.severity === "critical"
                                  ? "var(--status-critical)30"
                                  : "var(--status-warning)30",
                            }}
                          >
                            {alert.severity}
                          </span>
                          <span className="font-mono text-xs text-[var(--text-secondary)]">
                            {alert.currentLevel.toFixed(1)}cm
                          </span>
                          <span className="font-mono text-xs text-[var(--text-muted)]">
                            Δ {alert.changeRate >= 0 ? "+" : ""}
                            {alert.changeRate.toFixed(2)} cm/min
                          </span>
                        </div>
                        <p className="text-[var(--text-secondary)] text-xs">
                          {alert.message}
                        </p>
                      </div>
                      <span className="text-[var(--text-muted)] text-[10px] font-mono whitespace-nowrap ml-4">
                        {new Date(alert.timestamp).toLocaleTimeString("en-US", {
                          hour12: false,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {ALERT_CONFIG.telegramEnabled && (
                <div className="mt-3 pt-3 border-t border-[var(--border-secondary)] flex items-center gap-2">
                  <span className="status-dot nominal" />
                  <span className="text-[var(--status-nominal)] text-xs">
                    TELEGRAM NOTIFICATIONS ACTIVE
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Information Footer */}
        <div className="mt-4 panel">
          <div className="panel-header">SYSTEM INFORMATION</div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="metric-label">HIGH THRESHOLD</span>
                <p className="font-mono text-[var(--status-critical)] mt-1">
                  {HIGH_THRESHOLD} cm
                </p>
              </div>
              <div>
                <span className="metric-label">LOW THRESHOLD</span>
                <p className="font-mono text-[var(--status-warning)] mt-1">
                  {LOW_THRESHOLD} cm
                </p>
              </div>
              <div>
                <span className="metric-label">ACTIVE NODES</span>
                <p className="font-mono text-[var(--text-primary)] mt-1">
                  {devices.length}
                </p>
              </div>
              <div>
                <span className="metric-label">PROTOCOL</span>
                <p className="font-mono text-[var(--text-primary)] mt-1">
                  LoRa / Supabase RT
                </p>
              </div>
            </div>
          </div>
        </div>
      </MainGrid>
    </SystemShell>
  );
}
