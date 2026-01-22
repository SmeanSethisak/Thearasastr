"use client";

import { useState } from "react";
import {
  useLatestReadings,
  useAvailableDevices,
  useAnomalyDetection,
} from "@/hooks/useWaterLevels";
import { AppLayout, PageHeader, PageContent } from "@/components/AppLayout";
import { LatestReadingsTable } from "@/components/LatestReadingsTable";

const HIGH_THRESHOLD = 150;
const LOW_THRESHOLD = 10;

export default function ReadingsPage() {
  const { devices, loading: devicesLoading } = useAvailableDevices();
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  if (devices.length > 0 && !selectedDevice) {
    setSelectedDevice(devices[0]);
  }

  const { data: latestReadings, loading: latestLoading } = useLatestReadings();
  const [alerts] = useAnomalyDetection(
    selectedDevice,
    HIGH_THRESHOLD,
    LOW_THRESHOLD
  );

  return (
    <AppLayout alertCount={alerts?.length || 0}>
      <PageHeader
        title="Readings"
        description="View latest sensor readings from all devices"
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)]">
              Filter by Device:
            </span>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              disabled={devicesLoading}
              className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm rounded px-3 py-1.5 focus:outline-none focus:border-[var(--accent-primary)]"
            >
              <option value="">All Devices</option>
              {!devicesLoading &&
                devices.map((device) => (
                  <option key={device} value={device}>
                    {device}
                  </option>
                ))}
            </select>
          </div>
        }
      />

      <PageContent>
        {/* Device Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="panel p-4">
            <p className="text-xs text-[var(--text-muted)] uppercase mb-1">
              Total Devices
            </p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {devices.length}
            </p>
          </div>
          <div className="panel p-4">
            <p className="text-xs text-[var(--text-muted)] uppercase mb-1">
              Online
            </p>
            <p className="text-2xl font-bold text-[var(--status-nominal)]">
              {devices.length}
            </p>
          </div>
          <div className="panel p-4">
            <p className="text-xs text-[var(--text-muted)] uppercase mb-1">
              Latest Readings
            </p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {latestReadings?.length || 0}
            </p>
          </div>
          <div className="panel p-4">
            <p className="text-xs text-[var(--text-muted)] uppercase mb-1">
              Protocol
            </p>
            <p className="text-lg font-mono text-[var(--text-secondary)]">
              LoRa / RT
            </p>
          </div>
        </div>

        {/* Readings Table */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            Latest Sensor Readings
          </h2>
          <LatestReadingsTable
            readings={latestReadings}
            loading={latestLoading}
          />
        </div>
      </PageContent>
    </AppLayout>
  );
}
