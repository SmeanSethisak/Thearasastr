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
          message: "Report sent to Telegram successfully!",
        });
      } else {
        setTelegramStatus({
          type: "error",
          message: data.error || "Failed to send report",
        });
      }
    } catch (err) {
      setTelegramStatus({
        type: "error",
        message: "Failed to send report to Telegram",
      });
    } finally {
      setSendingToTelegram(false);
      // Clear status after 3 seconds
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

  const handlePrintReport = () => {
    if (!report) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Water Level Report - ${report.deviceId}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #1e40af; }
              h2 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
              .stat { margin: 10px 0; }
              .alert-high { color: #dc2626; background: #fef2f2; padding: 8px; border-radius: 4px; margin: 4px 0; }
              .alert-low { color: #2563eb; background: #eff6ff; padding: 8px; border-radius: 4px; margin: 4px 0; }
              table { border-collapse: collapse; width: 100%; margin: 16px 0; }
              th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
              th { background: #f9fafb; }
            </style>
          </head>
          <body>
            ${generateReportHTML(report)}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm">Error generating report: {error}</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Water Level Report
        </h3>
        <p className="text-gray-500">No data available for report</p>
      </div>
    );
  }

  const highAlerts = report.alerts.filter((a) => a.type === "high");
  const lowAlerts = report.alerts.filter((a) => a.type === "low");

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          📋 Water Level Report
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleSendToTelegram}
            disabled={sendingToTelegram}
            className="px-3 py-1.5 text-sm bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingToTelegram ? (
              <>
                <span className="animate-spin">⏳</span> Sending...
              </>
            ) : (
              <>📤 Telegram</>
            )}
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
          >
            📥 Download
          </button>
          <button
            onClick={handlePrintReport}
            className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-1"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Telegram Status Message */}
      {telegramStatus && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            telegramStatus.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {telegramStatus.type === "success" ? "✅" : "❌"}{" "}
          {telegramStatus.message}
        </div>
      )}

      {/* Report Header */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Device ID:</span>
            <span className="ml-2 font-medium text-gray-900">
              {report.deviceId}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Period:</span>
            <span className="ml-2 font-medium text-gray-900">
              {report.period}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Generated:</span>
            <span className="ml-2 font-medium text-gray-900">
              {new Date(report.generatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          📊 Statistics Summary
        </h4>
        <div className="grid grid-cols-4 gap-3">
          <StatBox label="Latest" value={report.latest} color="blue" />
          <StatBox label="Maximum" value={report.max} color="red" />
          <StatBox label="Minimum" value={report.min} color="green" />
          <StatBox label="Average" value={report.average} color="purple" />
        </div>
      </div>

      {/* Time Period Averages */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          🕐 Time Period Averages
        </h4>
        <div className="grid grid-cols-4 gap-3">
          <AverageBox
            label="1 Hour"
            value={report.timePeriodAverages.last1hour}
          />
          <AverageBox
            label="6 Hours"
            value={report.timePeriodAverages.last6hours}
          />
          <AverageBox
            label="12 Hours"
            value={report.timePeriodAverages.last12hours}
          />
          <AverageBox
            label="24 Hours"
            value={report.timePeriodAverages.last24hours}
          />
        </div>
      </div>

      {/* Alerts Summary */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          ⚠️ Alerts Summary
        </h4>
        {report.alerts.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
            ✅ No abnormal readings detected during this period
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-4">
              {highAlerts.length > 0 && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  🔴 {highAlerts.length} High Level Alert
                  {highAlerts.length > 1 ? "s" : ""}
                </span>
              )}
              {lowAlerts.length > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  🔵 {lowAlerts.length} Low Level Alert
                  {lowAlerts.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="max-h-32 overflow-y-auto mt-2 space-y-1">
              {report.alerts.slice(0, 5).map((alert, i) => (
                <div
                  key={i}
                  className={`text-xs p-2 rounded ${
                    alert.type === "high"
                      ? "bg-red-50 text-red-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {alert.message} - {new Date(alert.timestamp).toLocaleString()}
                </div>
              ))}
              {report.alerts.length > 5 && (
                <p className="text-gray-500 text-xs">
                  +{report.alerts.length - 5} more alerts
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    red: "bg-red-50 text-red-700 border-red-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-3 text-center`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-bold">{value.toFixed(1)}</div>
      <div className="text-xs">cm</div>
    </div>
  );
}

function AverageBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-gray-900">
        {value > 0 ? value.toFixed(1) : "—"}
      </div>
      {value > 0 && <div className="text-xs text-gray-500">cm</div>}
    </div>
  );
}

function generateReportText(report: WaterLevelReport): string {
  const lines = [
    "═══════════════════════════════════════════════════════════",
    "              WATER LEVEL MONITORING REPORT",
    "═══════════════════════════════════════════════════════════",
    "",
    `Device ID:    ${report.deviceId}`,
    `Period:       ${report.period}`,
    `Generated:    ${new Date(report.generatedAt).toLocaleString()}`,
    "",
    "───────────────────────────────────────────────────────────",
    "                    STATISTICS SUMMARY",
    "───────────────────────────────────────────────────────────",
    "",
    `  Latest Reading:   ${report.latest.toFixed(1)} cm`,
    `  Maximum:          ${report.max.toFixed(1)} cm`,
    `  Minimum:          ${report.min.toFixed(1)} cm`,
    `  Average:          ${report.average.toFixed(1)} cm`,
    "",
    "───────────────────────────────────────────────────────────",
    "                  TIME PERIOD AVERAGES",
    "───────────────────────────────────────────────────────────",
    "",
    `  Last 1 Hour:      ${
      report.timePeriodAverages.last1hour > 0
        ? report.timePeriodAverages.last1hour.toFixed(1) + " cm"
        : "No data"
    }`,
    `  Last 6 Hours:     ${
      report.timePeriodAverages.last6hours > 0
        ? report.timePeriodAverages.last6hours.toFixed(1) + " cm"
        : "No data"
    }`,
    `  Last 12 Hours:    ${
      report.timePeriodAverages.last12hours > 0
        ? report.timePeriodAverages.last12hours.toFixed(1) + " cm"
        : "No data"
    }`,
    `  Last 24 Hours:    ${
      report.timePeriodAverages.last24hours > 0
        ? report.timePeriodAverages.last24hours.toFixed(1) + " cm"
        : "No data"
    }`,
    "",
    "───────────────────────────────────────────────────────────",
    "                    ALERTS SUMMARY",
    "───────────────────────────────────────────────────────────",
    "",
  ];

  if (report.alerts.length === 0) {
    lines.push("  ✓ No abnormal readings detected during this period");
  } else {
    const highAlerts = report.alerts.filter((a) => a.type === "high");
    const lowAlerts = report.alerts.filter((a) => a.type === "low");

    lines.push(`  Total Alerts: ${report.alerts.length}`);
    lines.push(`  High Level Alerts: ${highAlerts.length}`);
    lines.push(`  Low Level Alerts: ${lowAlerts.length}`);
    lines.push("");
    lines.push("  Alert Details:");
    report.alerts.forEach((alert, i) => {
      lines.push(
        `    ${i + 1}. [${alert.type.toUpperCase()}] ${alert.message}`
      );
      lines.push(`       Time: ${new Date(alert.timestamp).toLocaleString()}`);
    });
  }

  lines.push("");
  lines.push("═══════════════════════════════════════════════════════════");
  lines.push("                    END OF REPORT");
  lines.push("═══════════════════════════════════════════════════════════");

  return lines.join("\n");
}

function generateReportHTML(report: WaterLevelReport): string {
  const highAlerts = report.alerts.filter((a) => a.type === "high");
  const lowAlerts = report.alerts.filter((a) => a.type === "low");

  return `
    <h1>🌊 Water Level Monitoring Report</h1>
    
    <h2>Report Information</h2>
    <p><strong>Device ID:</strong> ${report.deviceId}</p>
    <p><strong>Period:</strong> ${report.period}</p>
    <p><strong>Generated:</strong> ${new Date(
      report.generatedAt
    ).toLocaleString()}</p>
    
    <h2>Statistics Summary</h2>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Latest Reading</td><td>${report.latest.toFixed(1)} cm</td></tr>
      <tr><td>Maximum</td><td>${report.max.toFixed(1)} cm</td></tr>
      <tr><td>Minimum</td><td>${report.min.toFixed(1)} cm</td></tr>
      <tr><td>Average</td><td>${report.average.toFixed(1)} cm</td></tr>
    </table>
    
    <h2>Time Period Averages</h2>
    <table>
      <tr><th>Period</th><th>Average</th></tr>
      <tr><td>Last 1 Hour</td><td>${
        report.timePeriodAverages.last1hour > 0
          ? report.timePeriodAverages.last1hour.toFixed(1) + " cm"
          : "No data"
      }</td></tr>
      <tr><td>Last 6 Hours</td><td>${
        report.timePeriodAverages.last6hours > 0
          ? report.timePeriodAverages.last6hours.toFixed(1) + " cm"
          : "No data"
      }</td></tr>
      <tr><td>Last 12 Hours</td><td>${
        report.timePeriodAverages.last12hours > 0
          ? report.timePeriodAverages.last12hours.toFixed(1) + " cm"
          : "No data"
      }</td></tr>
      <tr><td>Last 24 Hours</td><td>${
        report.timePeriodAverages.last24hours > 0
          ? report.timePeriodAverages.last24hours.toFixed(1) + " cm"
          : "No data"
      }</td></tr>
    </table>
    
    <h2>Alerts Summary</h2>
    ${
      report.alerts.length === 0
        ? '<p style="color: green;">✅ No abnormal readings detected during this period</p>'
        : `
        <p><strong>Total Alerts:</strong> ${report.alerts.length} (${
            highAlerts.length
          } high, ${lowAlerts.length} low)</p>
        ${report.alerts
          .map(
            (alert) => `
          <div class="alert-${alert.type}">
            <strong>${alert.type === "high" ? "🔴 HIGH" : "🔵 LOW"}:</strong> ${
              alert.message
            }<br>
            <small>Time: ${new Date(alert.timestamp).toLocaleString()}</small>
          </div>
        `
          )
          .join("")}
      `
    }
  `;
}
