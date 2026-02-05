"use client";

import { useState } from "react";
import {
  useAvailableDevices,
  useGenerateReport,
  useAnomalyDetection,
} from "@/hooks/useWaterLevels";
import { AppLayout, PageHeader, PageContent } from "@/components/AppLayout";
import { WaterLevelReportCard } from "@/components/WaterLevelReportCard";

const HIGH_THRESHOLD = 150;
const LOW_THRESHOLD = 10;

export default function ReportsPage() {
  const { devices, loading: devicesLoading } = useAvailableDevices();
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [reportPeriod, setReportPeriod] = useState<24 | 48 | 168>(24);

  if (devices.length > 0 && !selectedDevice) {
    setSelectedDevice(devices[0]);
  }

  const [report, reportLoading, reportError] = useGenerateReport(
    selectedDevice,
    reportPeriod
  );
  const [alerts] = useAnomalyDetection(
    selectedDevice,
    HIGH_THRESHOLD,
    LOW_THRESHOLD
  );

  return (
    <AppLayout alertCount={alerts?.length || 0}>
      <PageHeader
        title="Reports"
        description="Generate and export water level reports"
        actions={
          <div className="flex items-center gap-4">
            {/* Report Period Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Period:</span>
              {[
                { value: 24, label: "24H" },
                { value: 48, label: "48H" },
                { value: 168, label: "7D" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setReportPeriod(option.value as 24 | 48 | 168)}
                  className={`control-btn text-xs py-1.5 px-3 ${
                    reportPeriod === option.value ? "active" : ""
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Generator */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Generate Report
            </h2>
            <WaterLevelReportCard
              report={report}
              loading={reportLoading}
              error={reportError}
            />
          </div>

          {/* Report Info */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Report Information
            </h2>
            <div className="panel p-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                  What's Included
                </h3>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-[var(--status-nominal)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Current water level statistics
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-[var(--status-nominal)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Maximum, minimum, and average levels
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-[var(--status-nominal)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Time period trend analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-[var(--status-nominal)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Alert summary and details
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[var(--border-secondary)]">
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                  Export Options
                </h3>
                <p className="text-sm text-[var(--text-muted)] mb-3">
                  Reports can be sent directly to Telegram for instant
                  notifications.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="status-dot nominal" />
                  <span className="text-[var(--text-secondary)]">
                    Telegram integration available
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
