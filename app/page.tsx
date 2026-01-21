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
import { StatsGrid } from "@/components/StatsGrid";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";
import { LatestReadingsTable } from "@/components/LatestReadingsTable";
import { DeviceSelector } from "@/components/DeviceSelector";
import { WaterLevelAlerts, AlertBanner } from "@/components/WaterLevelAlerts";
import { TimePeriodAveragesCard } from "@/components/TimePeriodAveragesCard";
import { WaterLevelReportCard } from "@/components/WaterLevelReportCard";
import { FloodRiskCard, FloodRiskBanner } from "@/components/FloodRiskCard";
import {
  WaterLevelSpeedIndicator,
  SpeedIndicatorLarge,
} from "@/components/WaterLevelSpeedIndicator";
import DeviceControl from "@/components/DeviceControl";

// Threshold constants for abnormal water levels
const HIGH_THRESHOLD = 150; // cm - water level too high
const LOW_THRESHOLD = 10; // cm - water level too low

// Alert configuration with Telegram support
const ALERT_CONFIG = {
  ...DEFAULT_ALERT_CONFIG,
  highThreshold: HIGH_THRESHOLD,
  lowThreshold: LOW_THRESHOLD,
  // Set these environment variables to enable Telegram notifications
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

  // New hooks for flood risk prediction and water level speed
  const [floodRisk, floodRiskLoading, floodRiskError] =
    useFloodRiskPrediction(selectedDevice);
  const [changeRate, changeRateLoading, changeRateError] =
    useWaterLevelChangeRate(selectedDevice);
  const [smartAlerts, smartAlertsLoading] = useSmartAlerts(
    selectedDevice,
    ALERT_CONFIG
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Flood Risk Banner - Shows when risk is warning or critical */}
      <FloodRiskBanner prediction={floodRisk} loading={floodRiskLoading} />

      {/* Alert Banner - Shows at top when there are abnormal readings */}
      <AlertBanner alerts={alerts} loading={alertsLoading} />

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🌊 Smart Water Level Monitor
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Real-time flood risk prediction & monitoring system
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Water Level Speed Indicator in Header */}
              <div className="hidden md:block">
                <SpeedIndicatorLarge
                  changeRate={changeRate}
                  loading={changeRateLoading}
                />
              </div>
              <DeviceSelector
                devices={devices}
                selectedDevice={selectedDevice}
                onDeviceChange={setSelectedDevice}
                loading={devicesLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Irrigation Pump Control Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🚰 Irrigation System Control
          </h2>
          <DeviceControl 
            currentWaterLevel={stats?.latest}
            highThreshold={HIGH_THRESHOLD}
            lowThreshold={LOW_THRESHOLD}
          />
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setTimeRange(24)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 24
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-blue-500"
            }`}
          >
            24 Hours
          </button>
          <button
            onClick={() => setTimeRange(7)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 7
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-blue-500"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 30
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-blue-500"
            }`}
          >
            30 Days
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Statistics
          </h2>
          <StatsGrid stats={stats} loading={statsLoading} />
          {statsError && (
            <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              Error: {statsError}
            </div>
          )}
        </div>

        {/* Flood Risk & Water Level Speed Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Flood Risk Prediction */}
          <FloodRiskCard
            prediction={floodRisk}
            loading={floodRiskLoading}
            error={floodRiskError}
          />

          {/* Water Level Speed Indicator */}
          <WaterLevelSpeedIndicator
            changeRate={changeRate}
            loading={changeRateLoading}
            error={changeRateError}
          />
        </div>

        {/* Alerts and Time Period Averages Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Water Level Alerts */}
          <WaterLevelAlerts
            alerts={alerts}
            loading={alertsLoading}
            error={alertsError}
            highThreshold={HIGH_THRESHOLD}
            lowThreshold={LOW_THRESHOLD}
          />

          {/* Time Period Averages */}
          <TimePeriodAveragesCard
            averages={timePeriodAverages}
            loading={averagesLoading}
            error={averagesError}
          />
        </div>

        {/* Smart Alerts Notification Panel */}
        {smartAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔔 Smart Alert Notifications
            </h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-3">
                {smartAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.severity === "critical"
                        ? "bg-red-50 border-red-300"
                        : "bg-yellow-50 border-yellow-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p
                          className={`font-medium ${
                            alert.severity === "critical"
                              ? "text-red-800"
                              : "text-yellow-800"
                          }`}
                        >
                          {alert.message}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          Level: {alert.currentLevel.toFixed(1)} cm • Rate:{" "}
                          {alert.changeRate >= 0 ? "+" : ""}
                          {alert.changeRate.toFixed(2)} cm/min • Risk:{" "}
                          {alert.riskStatus.toUpperCase()}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.severity === "critical"
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {ALERT_CONFIG.telegramEnabled && (
                <p className="text-green-600 text-sm mt-4 flex items-center gap-2">
                  <span>✅</span> Telegram notifications enabled
                </p>
              )}
              {!ALERT_CONFIG.telegramEnabled && (
                <p className="text-gray-500 text-sm mt-4 flex items-center gap-2">
                  <span>ℹ️</span> Set NEXT_PUBLIC_TELEGRAM_BOT_TOKEN and
                  NEXT_PUBLIC_TELEGRAM_CHAT_ID to enable Telegram alerts
                </p>
              )}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <TimeSeriesChart
              data={timeSeries}
              loading={timeSeriesLoading}
              deviceId={selectedDevice || "Select a device"}
            />
          </div>

          {/* Latest Readings Sidebar */}
          <div>
            <LatestReadingsTable
              readings={latestReadings}
              loading={latestLoading}
            />
          </div>
        </div>

        {/* Water Level Report Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 Generated Report
          </h2>
          <WaterLevelReportCard
            report={report}
            loading={reportLoading}
            error={reportError}
          />
        </div>

        {/* Footer Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="mb-2">
            <strong>💡 Smart Monitoring Features:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>
              <strong>Flood Risk Prediction:</strong> Analyzes trends to predict
              risk levels (Safe/Warning/Critical)
            </li>
            <li>
              <strong>Rising Speed Indicator:</strong> Shows water level change
              rate in cm/min with trend analysis
            </li>
            <li>
              <strong>Smart Alerts:</strong> Automatic notifications with
              cooldown to prevent spam
            </li>
            <li>
              <strong>Thresholds:</strong> High &gt;{HIGH_THRESHOLD}cm, Low &lt;
              {LOW_THRESHOLD}cm
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
