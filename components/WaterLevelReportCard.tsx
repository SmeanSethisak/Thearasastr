"use client";

import { useState } from "react";
import { WaterLevelReport } from "@/hooks/useWaterLevels";

interface WaterLevelReportCardProps {
  report: WaterLevelReport | null;
  loading: boolean;
  error: string | null;
  onGenerateReport?: () => void;
}

export function WaterLevelReportCard({
  report,
  loading,
  error,
}: WaterLevelReportCardProps) {
  const [sendingToTelegram, setSendingToTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSendToTelegram = async () => {
    if (!report) return;

    setSendingToTelegram(true);
    setTelegramStatus(null);

    try {
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });

      const data = await response.json();

      if (response.ok) {
        setTelegramStatus({
          type: "success",
          message: "Report transmitted successfully",
        });
      } else {
        setTelegramStatus({
          type: "error",
          message: data.error || "Transmission failed",
        });
      }
    } catch (err) {
      setTelegramStatus({
        type: "error",
        message: "Network error — transmission failed",
      });
    } finally {
      setSendingToTelegram(false);
      setTimeout(() => setTelegramStatus(null), 3000);
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;

    const reportText = generateReportText(report);
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `water-level-report-${report.deviceId}-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="panel">
        <div className="panel-header">REPORT GENERATOR</div>
        <div className="p-4">
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-[var(--bg-tertiary)] animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <div className="panel-header flex items-center gap-3">
          <span className="status-dot critical" />
          <span>REPORT GENERATOR — ERROR</span>
        </div>
        <div className="p-4">
          <p className="text-[var(--status-critical)] text-sm font-mono">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="panel">
        <div className="panel-header">REPORT GENERATOR</div>
        <div className="p-4">
          <p className="text-[var(--text-muted)] text-sm font-mono">
            INSUFFICIENT DATA FOR REPORT
          </p>
        </div>
      </div>
    );
  }

  const highAlerts = report.alerts.filter((a) => a.type === "high");
  const lowAlerts = report.alerts.filter((a) => a.type === "low");

  return (
    <div className="panel">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="status-dot nominal" />
          <span>REPORT GENERATOR</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSendToTelegram}
            disabled={sendingToTelegram}
            className="control-btn text-[10px] py-1 px-3 flex items-center gap-1.5"
          >
            {sendingToTelegram ? (
              <>
                <div className="w-2 h-2 border border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                SENDING
              </>
            ) : (
              <>TRANSMIT</>
            )}
          </button>
          <button
            onClick={handleDownloadReport}
            className="control-btn text-[10px] py-1 px-3"
          >
            EXPORT
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Telegram Status */}
        {telegramStatus && (
          <div
            className="mb-4 p-2 border text-xs font-mono"
            style={{
              borderColor:
                telegramStatus.type === "success"
                  ? "var(--status-nominal)"
                  : "var(--status-critical)",
              backgroundColor:
                telegramStatus.type === "success"
                  ? "var(--status-nominal-bg)"
                  : "var(--status-critical-bg)",
              color:
                telegramStatus.type === "success"
                  ? "var(--status-nominal)"
                  : "var(--status-critical)",
            }}
          >
            {telegramStatus.type === "success" ? "✓" : "✗"}{" "}
            {telegramStatus.message}
          </div>
        )}

        {/* Report Header */}
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] p-3 mb-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[var(--text-muted)]">NODE:</span>
              <span className="ml-2 font-mono text-[var(--accent-primary)]">
                {report.deviceId}
              </span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">PERIOD:</span>
              <span className="ml-2 font-mono text-[var(--text-primary)]">
                {report.period}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[var(--text-muted)]">GENERATED:</span>
              <span className="ml-2 font-mono text-[var(--text-primary)]">
                {new Date(report.generatedAt).toLocaleString("en-US", {
                  hour12: false,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="mb-4">
          <p className="metric-label mb-2">STATISTICS SUMMARY</p>
          <div className="grid grid-cols-4 gap-2">
            <StatBox label="LATEST" value={report.latest} />
            <StatBox label="MAX" value={report.max} status="critical" />
            <StatBox label="MIN" value={report.min} status="info" />
            <StatBox label="AVG" value={report.average} />
          </div>
        </div>

        {/* Time Period Averages */}
        <div className="mb-4">
          <p className="metric-label mb-2">TIME PERIOD AVERAGES</p>
          <div className="grid grid-cols-4 gap-2">
            <AvgBox label="1H" value={report.timePeriodAverages.last1hour} />
            <AvgBox label="6H" value={report.timePeriodAverages.last6hours} />
            <AvgBox label="12H" value={report.timePeriodAverages.last12hours} />
            <AvgBox label="24H" value={report.timePeriodAverages.last24hours} />
          </div>
        </div>

        {/* Alerts Summary */}
        <div>
          <p className="metric-label mb-2">ALERTS SUMMARY</p>
          {report.alerts.length === 0 ? (
            <div className="bg-[var(--status-nominal-bg)] border border-[var(--status-nominal)] p-3">
              <p className="text-[var(--status-nominal)] text-xs font-mono">
                ✓ NO ANOMALIES DETECTED
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-3">
                {highAlerts.length > 0 && (
                  <span className="text-xs font-mono px-2 py-1 bg-[var(--status-critical-bg)] text-[var(--status-critical)] border border-[var(--status-critical)]">
                    {highAlerts.length} HIGH
                  </span>
                )}
                {lowAlerts.length > 0 && (
                  <span className="text-xs font-mono px-2 py-1 bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning)]">
                    {lowAlerts.length} LOW
                  </span>
                )}
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {report.alerts.slice(0, 5).map((alert, i) => (
                  <div
                    key={i}
                    className="text-[10px] p-2 font-mono border-l-2"
                    style={{
                      borderLeftColor:
                        alert.type === "high"
                          ? "var(--status-critical)"
                          : "var(--status-warning)",
                      backgroundColor:
                        alert.type === "high"
                          ? "var(--status-critical-bg)"
                          : "var(--status-warning-bg)",
                      color:
                        alert.type === "high"
                          ? "var(--status-critical)"
                          : "var(--status-warning)",
                    }}
                  >
                    [{alert.type.toUpperCase()}] {alert.currentLevel.toFixed(1)}
                    cm @{" "}
                    {new Date(alert.timestamp).toLocaleTimeString("en-US", {
                      hour12: false,
                    })}
                  </div>
                ))}
                {report.alerts.length > 5 && (
                  <p className="text-[var(--text-muted)] text-[10px] font-mono">
                    +{report.alerts.length - 5} MORE ENTRIES
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  status,
}: {
  label: string;
  value: number;
  status?: "critical" | "info";
}) {
  const color =
    status === "critical"
      ? "var(--status-critical)"
      : status === "info"
      ? "var(--status-info)"
      : "var(--text-primary)";
  return (
    <div className="bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] p-2 text-center">
      <p className="text-[9px] text-[var(--text-muted)] mb-1">{label}</p>
      <p className="font-mono text-sm font-semibold" style={{ color }}>
        {value.toFixed(1)}
      </p>
    </div>
  );
}

function AvgBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] p-2 text-center">
      <p className="text-[9px] text-[var(--text-muted)] mb-1">{label}</p>
      <p className="font-mono text-sm font-semibold text-[var(--text-primary)]">
        {value > 0 ? value.toFixed(1) : "—"}
      </p>
    </div>
  );
}

function generateReportText(report: WaterLevelReport): string {
  const lines = [
    "════════════════════════════════════════════════════════════",
    "              HYDRO-MON WATER LEVEL REPORT",
    "════════════════════════════════════════════════════════════",
    "",
    `NODE ID:      ${report.deviceId}`,
    `PERIOD:       ${report.period}`,
    `GENERATED:    ${new Date(report.generatedAt).toLocaleString()}`,
    "",
    "────────────────────────────────────────────────────────────",
    "                    STATISTICS SUMMARY",
    "────────────────────────────────────────────────────────────",
    "",
    `  LATEST:     ${report.latest.toFixed(1)} cm`,
    `  MAXIMUM:    ${report.max.toFixed(1)} cm`,
    `  MINIMUM:    ${report.min.toFixed(1)} cm`,
    `  AVERAGE:    ${report.average.toFixed(1)} cm`,
    "",
    "────────────────────────────────────────────────────────────",
    "                  TIME PERIOD AVERAGES",
    "────────────────────────────────────────────────────────────",
    "",
    `  1 HOUR:     ${
      report.timePeriodAverages.last1hour > 0
        ? report.timePeriodAverages.last1hour.toFixed(1) + " cm"
        : "N/A"
    }`,
    `  6 HOURS:    ${
      report.timePeriodAverages.last6hours > 0
        ? report.timePeriodAverages.last6hours.toFixed(1) + " cm"
        : "N/A"
    }`,
    `  12 HOURS:   ${
      report.timePeriodAverages.last12hours > 0
        ? report.timePeriodAverages.last12hours.toFixed(1) + " cm"
        : "N/A"
    }`,
    `  24 HOURS:   ${
      report.timePeriodAverages.last24hours > 0
        ? report.timePeriodAverages.last24hours.toFixed(1) + " cm"
        : "N/A"
    }`,
    "",
    "────────────────────────────────────────────────────────────",
    "                    ALERTS SUMMARY",
    "────────────────────────────────────────────────────────────",
    "",
  ];

  if (report.alerts.length === 0) {
    lines.push("  [OK] No anomalies detected");
  } else {
    const highAlerts = report.alerts.filter((a) => a.type === "high");
    const lowAlerts = report.alerts.filter((a) => a.type === "low");

    lines.push(`  TOTAL:      ${report.alerts.length}`);
    lines.push(`  HIGH:       ${highAlerts.length}`);
    lines.push(`  LOW:        ${lowAlerts.length}`);
    lines.push("");
    report.alerts.forEach((alert, i) => {
      lines.push(
        `  ${i + 1}. [${alert.type.toUpperCase()}] ${alert.currentLevel.toFixed(
          1
        )}cm`
      );
      lines.push(`     ${new Date(alert.timestamp).toLocaleString()}`);
    });
  }

  lines.push("");
  lines.push("════════════════════════════════════════════════════════════");
  lines.push("                     END OF REPORT");
  lines.push("════════════════════════════════════════════════════════════");

  return lines.join("\n");
}
