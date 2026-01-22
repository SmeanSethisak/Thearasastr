import { NextRequest, NextResponse } from "next/server";

// Telegram credentials from environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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
  chartImageUrl?: string; // Optional chart image URL
}

// Generate a visual bar using Unicode blocks
function generateBar(value: number, maxValue: number, barLength: number = 10): string {
  const filledBlocks = Math.round((value / maxValue) * barLength);
  const emptyBlocks = barLength - filledBlocks;
  return "█".repeat(Math.max(0, filledBlocks)) + "░".repeat(Math.max(0, emptyBlocks));
}

// Get trend arrow based on change
function getTrendArrow(current: number, average: number): string {
  const diff = current - average;
  const percentChange = (diff / average) * 100;
  
  if (percentChange > 10) return "📈 ↑↑";
  if (percentChange > 5) return "📈 ↑";
  if (percentChange < -10) return "📉 ↓↓";
  if (percentChange < -5) return "📉 ↓";
  return "➡️ →";
}

// Get risk level emoji and text
function getRiskIndicator(level: number): { emoji: string; text: string; color: string } {
  if (level >= 180) return { emoji: "🔴", text: "CRITICAL", color: "🚨" };
  if (level >= 150) return { emoji: "🟠", text: "HIGH", color: "⚠️" };
  if (level >= 100) return { emoji: "🟡", text: "MODERATE", color: "⚡" };
  if (level >= 50) return { emoji: "🟢", text: "NORMAL", color: "✅" };
  return { emoji: "🔵", text: "LOW", color: "💧" };
}

// Format time period label
function formatPeriodLabel(hours: number): string {
  if (hours === 1) return "1h";
  if (hours === 6) return "6h";
  if (hours === 12) return "12h";
  return "24h";
}

export async function POST(request: NextRequest) {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json(
        {
          error:
            "Telegram credentials not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.",
        },
        { status: 500 }
      );
    }

    const report: ReportPayload = await request.json();

    if (!report.deviceId) {
      return NextResponse.json(
        { error: "Report data is required" },
        { status: 400 }
      );
    }

    const highAlerts = report.alerts.filter((a) => a.type === "high").length;
    const lowAlerts = report.alerts.filter((a) => a.type === "low").length;
    const risk = getRiskIndicator(report.latest);
    const trend = getTrendArrow(report.latest, report.average);
    
    // Calculate the max value for bar charts
    const maxLevel = Math.max(report.max, 200);
    
    // Build time period mini chart
    const periods = [
      { label: "1h", value: report.timePeriodAverages.last1hour },
      { label: "6h", value: report.timePeriodAverages.last6hours },
      { label: "12h", value: report.timePeriodAverages.last12hours },
      { label: "24h", value: report.timePeriodAverages.last24hours },
    ];

    const periodChart = periods
      .map((p) => {
        if (p.value <= 0) return `${p.label}: No data`;
        return `${p.label}: ${generateBar(p.value, maxLevel, 8)} ${p.value.toFixed(1)}cm`;
      })
      .join("\n");

    // Format the report message for Telegram using HTML
    const message = `
<b>📋 WATER LEVEL REPORT</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━

<b>📍 Device:</b> <code>${report.deviceId}</code>
<b>📅 Period:</b> ${report.period}
<b>🕐 Generated:</b> ${new Date(report.generatedAt).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
<b>${risk.color} CURRENT STATUS: ${risk.text}</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━

💧 <b>Latest:</b> ${report.latest.toFixed(1)} cm ${trend}
${risk.emoji} Risk Level: ${risk.text}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
<b>📊 STATISTICS OVERVIEW</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━

<pre>
┌─────────┬──────────┬────────────┐
│ Metric  │  Value   │    Bar     │
├─────────┼──────────┼────────────┤
│ Maximum │ ${report.max.toFixed(1).padStart(6)}cm │ ${generateBar(report.max, maxLevel, 8)} │
│ Average │ ${report.average.toFixed(1).padStart(6)}cm │ ${generateBar(report.average, maxLevel, 8)} │
│ Minimum │ ${report.min.toFixed(1).padStart(6)}cm │ ${generateBar(report.min, maxLevel, 8)} │
│ Current │ ${report.latest.toFixed(1).padStart(6)}cm │ ${generateBar(report.latest, maxLevel, 8)} │
└─────────┴──────────┴────────────┘
</pre>

━━━━━━━━━━━━━━━━━━━━━━━━━━━
<b>🕐 TIME PERIOD TRENDS</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━

<pre>
${periodChart}
</pre>

━━━━━━━━━━━━━━━━━━━━━━━━━━━
<b>⚠️ ALERTS SUMMARY</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${
  report.alerts.length === 0
    ? "✅ <b>All Clear!</b> No abnormal readings detected."
    : `🔴 High Level Alerts: <b>${highAlerts}</b>
🔵 Low Level Alerts: <b>${lowAlerts}</b>
📊 Total: <b>${report.alerts.length}</b> alert(s)

${report.alerts.slice(0, 3).map((alert) => 
  `  ${alert.type === "high" ? "🔺" : "🔻"} ${alert.currentLevel.toFixed(1)}cm at ${new Date(alert.timestamp).toLocaleTimeString()}`
).join("\n")}${report.alerts.length > 3 ? `\n  ... and ${report.alerts.length - 3} more` : ""}`
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
<i>🌊 Smart Water Level Monitor</i>
<i>Generated: ${new Date().toISOString()}</i>
    `.trim();

    // Send the text message first
    const textResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    if (!textResponse.ok) {
      const errorData = await textResponse.json();
      console.error("Telegram API error:", errorData);
      return NextResponse.json(
        { error: "Failed to send to Telegram", details: errorData },
        { status: 500 }
      );
    }

    const textResult = await textResponse.json();

    // If a chart image URL is provided, send it as a photo
    let photoResult = null;
    if (report.chartImageUrl) {
      try {
        const photoResponse = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              photo: report.chartImageUrl,
              caption: `📈 Water Level Chart - ${report.deviceId}\n📅 ${report.period}`,
              parse_mode: "HTML",
            }),
          }
        );
        
        if (photoResponse.ok) {
          photoResult = await photoResponse.json();
        }
      } catch (photoError) {
        console.error("Failed to send chart photo:", photoError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Report sent to Telegram successfully",
      telegramResponse: textResult,
      photoResponse: photoResult,
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
    telegramConfigured: !!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID),
    timestamp: new Date().toISOString(),
  });
}
