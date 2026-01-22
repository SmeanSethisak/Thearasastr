"use client";

import { useState } from "react";
import {
  useAvailableDevices,
  useDeviceStats,
  useAnomalyDetection,
} from "@/hooks/useWaterLevels";
import { AppLayout, PageHeader, PageContent } from "@/components/AppLayout";
import DeviceControl from "@/components/DeviceControl";

const HIGH_THRESHOLD = 150;
const LOW_THRESHOLD = 10;

export default function SettingsPage() {
  const { devices, loading: devicesLoading } = useAvailableDevices();
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  if (devices.length > 0 && !selectedDevice) {
    setSelectedDevice(devices[0]);
  }

  const [stats] = useDeviceStats(selectedDevice, 24);
  const [alerts] = useAnomalyDetection(
    selectedDevice,
    HIGH_THRESHOLD,
    LOW_THRESHOLD
  );

  return (
    <AppLayout alertCount={alerts?.length || 0}>
      <PageHeader
        title="Settings"
        description="System configuration and device controls"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Control */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Device Control
            </h2>
            <DeviceControl
              currentWaterLevel={stats?.latest}
              highThreshold={HIGH_THRESHOLD}
              lowThreshold={LOW_THRESHOLD}
            />
          </div>

          {/* System Configuration */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              System Configuration
            </h2>
            <div className="panel">
              <div className="panel-header">THRESHOLD SETTINGS</div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-secondary)]">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">
                      High Water Level Threshold
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Triggers critical alerts when exceeded
                    </p>
                  </div>
                  <span className="font-mono text-[var(--status-critical)]">
                    {HIGH_THRESHOLD} cm
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-secondary)]">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">
                      Low Water Level Threshold
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Triggers warning alerts when below
                    </p>
                  </div>
                  <span className="font-mono text-[var(--status-warning)]">
                    {LOW_THRESHOLD} cm
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">
                      Active Devices
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Number of connected sensor nodes
                    </p>
                  </div>
                  <span className="font-mono text-[var(--text-primary)]">
                    {devices.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="panel mt-4">
              <div className="panel-header">NOTIFICATION SETTINGS</div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-secondary)]">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">
                      Telegram Notifications
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Send alerts to Telegram
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="status-dot nominal" />
                    <span className="text-xs text-[var(--status-nominal)]">
                      Configured
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">
                      Real-time Updates
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Live data from Supabase
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="status-dot nominal" />
                    <span className="text-xs text-[var(--status-nominal)]">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            System Information
          </h2>
          <div className="panel">
            <div className="panel-header">SYSTEM DETAILS</div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="metric-label">VERSION</span>
                  <p className="font-mono text-[var(--text-primary)] mt-1">
                    1.0.0
                  </p>
                </div>
                <div>
                  <span className="metric-label">PROTOCOL</span>
                  <p className="font-mono text-[var(--text-primary)] mt-1">
                    LoRa / Supabase RT
                  </p>
                </div>
                <div>
                  <span className="metric-label">DATA REFRESH</span>
                  <p className="font-mono text-[var(--text-primary)] mt-1">
                    Real-time
                  </p>
                </div>
                <div>
                  <span className="metric-label">STATUS</span>
                  <p className="font-mono text-[var(--status-nominal)] mt-1">
                    Operational
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </AppLayout>
  );
}
