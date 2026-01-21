import { NextRequest, NextResponse } from "next/server";

// Telegram credentials
const TELEGRAM_BOT_TOKEN = "8015480427:AAELtB46xxEj98YU9KvGO0x9FnBvVB3awNk";
const TELEGRAM_CHAT_ID = "1166166830";

interface ReportPayload {
  deviceId: string;
  period: string;
  generatedAt: string;
  latest: number;
  max: number;
  min: number;
  average: number;
  timePeriodAverages: {
    last1hour: number;
    last6hours: number;
    last12hours: number;
    last24hours: number;
  };
  alerts: {
    type: "high" | "low";
    currentLevel: number;
    threshold: number;
    timestamp: string;
    message: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const report: ReportPayload = await request.json();

    if (!report.deviceId) {
      return NextResponse.json(
        { error: "Report data is required" },
        { status: 400 }
      );
    }

    const highAlerts = report.alerts.filter((a) => a.type === "high").length;
    const lowAlerts = report.alerts.filter((a) => a.type === "low").length;

    // Format the report message for Telegram
    const message = `
📋 *WATER LEVEL REPORT*
━━━━━━━━━━━━━━━━━━━━━━━

📍 *Device ID:* \`${report.deviceId}\`
📅 *Period:* ${report.period}
🕐 *Generated:* ${new Date(report.generatedAt).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━
📊 *STATISTICS SUMMARY*
━━━━━━━━━━━━━━━━━━━━━━━

💧 Latest Reading: *${report.latest.toFixed(1)} cm*
📈 Maximum: *${report.max.toFixed(1)} cm*
📉 Minimum: *${report.min.toFixed(1)} cm*
📊 Average: *${report.average.toFixed(1)} cm*

━━━━━━━━━━━━━━━━━━━━━━━
🕐 *TIME PERIOD AVERAGES*
━━━━━━━━━━━━━━━━━━━━━━━

• Last 1 Hour: ${
      report.timePeriodAverages.last1hour > 0
        ? report.timePeriodAverages.last1hour.toFixed(1) + " cm"
        : "No data"
    }
• Last 6 Hours: ${
      report.timePeriodAverages.last6hours > 0
        ? report.timePeriodAverages.last6hours.toFixed(1) + " cm"
        : "No data"
    }
• Last 12 Hours: ${
      report.timePeriodAverages.last12hours > 0
        ? report.timePeriodAverages.last12hours.toFixed(1) + " cm"
        : "No data"
    }
• Last 24 Hours: ${
      report.timePeriodAverages.last24hours > 0
        ? report.timePeriodAverages.last24hours.toFixed(1) + " cm"
        : "No data"
    }

━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *ALERTS SUMMARY*
━━━━━━━━━━━━━━━━━━━━━━━

${
  report.alerts.length === 0
    ? "✅ No abnormal readings detected"
    : `🔴 High Level Alerts: ${highAlerts}
🔵 Low Level Alerts: ${lowAlerts}
📝 Total: ${report.alerts.length} alert(s)`
}

━━━━━━━━━━━━━━━━━━━━━━━
🌊 Smart Water Level Monitor
    `.trim();

    // Send to Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Telegram API error:", errorData);
      return NextResponse.json(
        { error: "Failed to send to Telegram", details: errorData },
        { status: 500 }
      );
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      message: "Report sent to Telegram successfully",
      telegramResponse: result,
    });
  } catch (error) {
    console.error("Send report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    telegramConfigured: true,
    timestamp: new Date().toISOString(),
  });
}
