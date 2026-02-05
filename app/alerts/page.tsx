"use client";

import { useState } from "react";
import {
  useAvailableDevices,
  useAnomalyDetection,
  useSmartAlerts,
} from "@/hooks/useWaterLevels";
import { DEFAULT_ALERT_CONFIG } from "@/lib/types";
import { AppLayout, PageHeader, PageContent } from "@/components/AppLayout";
import { WaterLevelAlerts } from "@/components/WaterLevelAlerts";

const HIGH_THRESHOLD = 150;
const LOW_THRESHOLD = 10;

const ALERT_CONFIG = {
  ...DEFAULT_ALERT_CONFIG,
  highThreshold: HIGH_THRESHOLD,
  lowThreshold: LOW_THRESHOLD,
  telegramEnabled: !!process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN,
  telegramBotToken: process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID,
};

export default function AlertsPage() {
  const { devices, loading: devicesLoading } = useAvailableDevices();
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  if (devices.length > 0 && !selectedDevice) {
    setSelectedDevice(devices[0]);
  }

  const [alerts, alertsLoading, alertsError] = useAnomalyDetection(
    selectedDevice,
    HIGH_THRESHOLD,
    LOW_THRESHOLD
  );
  const [smartAlerts, smartAlertsLoading] = useSmartAlerts(
    selectedDevice,
    ALERT_CONFIG
  );

  const highAlerts = alerts?.filter((a) => a.type === "high") || [];
  const lowAlerts = alerts?.filter((a) => a.type === "low") || [];

  return (
    <AppLayout alertCount={alerts?.length || 0}>
      <PageHeader
        title="Alerts"
        description="Monitor and manage water level alerts"
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
        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="panel p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded bg-[var(--status-critical-bg)]">
                <svg
                  className="w-6 h-6 text-[var(--status-critical)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--status-critical)]">
                  {highAlerts.length}
                </p>
                <p className="text-xs text-[var(--text-muted)] uppercase">
                  High Level Alerts
                </p>
              </div>
            </div>
          </div>

          <div className="panel p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded bg-[var(--status-warning-bg)]">
                <svg
                  className="w-6 h-6 text-[var(--status-warning)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--status-warning)]">
                  {lowAlerts.length}
                </p>
                <p className="text-xs text-[var(--text-muted)] uppercase">
                  Low Level Alerts
                </p>
              </div>
            </div>
          </div>

          <div className="panel p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded bg-[var(--status-info-bg)]">
                <svg
                  className="w-6 h-6 text-[var(--status-info)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {alerts?.length || 0}
                </p>
                <p className="text-xs text-[var(--text-muted)] uppercase">
                  Total Alerts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Anomaly Alerts */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            Anomaly Detection Alerts
          </h2>
          <WaterLevelAlerts
            alerts={alerts}
            loading={alertsLoading}
            error={alertsError}
            highThreshold={HIGH_THRESHOLD}
            lowThreshold={LOW_THRESHOLD}
          />
        </div>

        {/* Smart Alerts */}
        {smartAlerts.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Smart Alert Notifications
            </h2>
            <div className="panel">
              <div className="panel-header flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="status-dot critical" />
                  <span>ACTIVE SMART ALERTS</span>
                </div>
                <span className="text-[var(--text-muted)] font-mono text-[10px]">
                  {smartAlerts.length} ACTIVE
                </span>
              </div>
              <div className="p-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
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
                          {new Date(alert.timestamp).toLocaleTimeString(
                            "en-US",
                            {
                              hour12: false,
                            }
                          )}
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
          </div>
        )}
      </PageContent>
    </AppLayout>
  );
}
