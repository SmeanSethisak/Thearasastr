import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Risk thresholds
const RISK_THRESHOLDS = {
  criticalLevel: 180,
  warningLevel: 150,
  criticalRiseRate: 2.0,
  warningRiseRate: 0.5,
};

// Alert cooldown tracking (in production, use Redis or database)
const alertCooldowns = new Map<string, number>();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

interface AlertPayload {
  nodeId: string;
  currentLevel: number;
  risingSpeed: number;
  riskStatus: "safe" | "warning" | "critical";
  timestamp: string;
  alertType: string;
  message: string;
  threshold?: number;
  trend?: "rising" | "falling" | "stable";
}

// Generate a visual bar using Unicode blocks
function generateLevelBar(current: number, max: number = 200): string {
  const percentage = Math.min((current / max) * 100, 100);
  const filledBlocks = Math.round(percentage / 10);
  const emptyBlocks = 10 - filledBlocks;
  return (
    "█".repeat(Math.max(0, filledBlocks)) + "░".repeat(Math.max(0, emptyBlocks))
  );
}

// Get urgency indicator based on risk
function getUrgencyBanner(
  riskStatus: "safe" | "warning" | "critical",
  alertType: string
): string {
  if (riskStatus === "critical") {
    return `
🚨🚨🚨 <b>CRITICAL ALERT</b> 🚨🚨🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
  if (riskStatus === "warning") {
    return `
⚠️⚠️ <b>WARNING ALERT</b> ⚠️⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
  return `
📢 <b>NOTICE</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// Get action recommendations based on alert type and severity
function getRecommendations(
  riskStatus: "safe" | "warning" | "critical",
  alertType: string
): string[] {
  const recommendations: string[] = [];

  if (riskStatus === "critical") {
    recommendations.push(
      "🏃 Consider immediate evacuation if in flood-prone area"
    );
    recommendations.push("📞 Alert local emergency services if needed");
    recommendations.push("🔌 Secure electrical equipment");
  } else if (riskStatus === "warning") {
    recommendations.push("👀 Monitor water levels closely");
    recommendations.push("📦 Prepare emergency supplies");
    recommendations.push("🚗 Plan evacuation routes");
  }

  if (alertType.includes("Rapid")) {
    recommendations.push("⏰ Water rising quickly - act fast");
  }

  if (alertType.includes("Low")) {
    recommendations.push("🔍 Check sensor functionality");
    recommendations.push("💧 Possible drought conditions");
  }

  return recommendations;
}

async function sendTelegramAlert(payload: AlertPayload): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("Telegram not configured");
    return false;
  }

  const riskConfig = {
    safe: { emoji: "✅", color: "🟢", label: "SAFE" },
    warning: { emoji: "⚠️", color: "🟡", label: "WARNING" },
    critical: { emoji: "🚨", color: "🔴", label: "CRITICAL" },
  };

  const risk = riskConfig[payload.riskStatus];
  const levelBar = generateLevelBar(payload.currentLevel);
  const speedIndicator =
    payload.risingSpeed >= 0
      ? `📈 +${payload.risingSpeed.toFixed(2)}`
      : `📉 ${payload.risingSpeed.toFixed(2)}`;

  const trendEmoji =
    payload.risingSpeed > 0.5
      ? "⬆️⬆️"
      : payload.risingSpeed > 0
      ? "⬆️"
      : payload.risingSpeed < -0.5
      ? "⬇️⬇️"
      : payload.risingSpeed < 0
      ? "⬇️"
      : "➡️";

  const recommendations = getRecommendations(
    payload.riskStatus,
    payload.alertType
  );
  const urgencyBanner = getUrgencyBanner(payload.riskStatus, payload.alertType);

  const message = `
${urgencyBanner}

<b>🌊 WATER LEVEL ALERT</b>

<b>📍 Location:</b> <code>${payload.nodeId}</code>
<b>🕐 Time:</b> ${new Date(payload.timestamp).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
<b>📊 CURRENT READINGS</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━

💧 <b>Water Level:</b> ${payload.currentLevel.toFixed(1)} cm
<pre>${levelBar} ${((payload.currentLevel / 200) * 100).toFixed(0)}%</pre>

${speedIndicator} cm/min ${trendEmoji}
${risk.color} <b>Status:</b> ${risk.label}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
<b>⚡ ALERT DETAILS</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━

<b>Type:</b> ${payload.alertType}
<b>Message:</b> ${payload.message}
${payload.threshold ? `<b>Threshold:</b> ${payload.threshold} cm` : ""}

${
  recommendations.length > 0
    ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━
<b>📋 RECOMMENDED ACTIONS</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${recommendations.map((r) => `• ${r}`).join("\n")}`
    : ""
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
<i>🌊 Smart Water Level Monitor</i>
<i>Stay safe and prepared!</i>
  `.trim();

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Failed to send Telegram alert:", error);
    return false;
  }
}

function shouldSendAlert(alertKey: string): boolean {
  const lastSent = alertCooldowns.get(alertKey) || 0;
  const now = Date.now();

  if (now - lastSent > COOLDOWN_MS) {
    alertCooldowns.set(alertKey, now);
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, highThreshold = 150, lowThreshold = 10 } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: "deviceId is required" },
        { status: 400 }
      );
    }

    // Fetch recent readings
    const thirtyMinutesAgo = new Date(
      Date.now() - 30 * 60 * 1000
    ).toISOString();
    const { data: readings, error } = await supabase
      .from("water_levels")
      .select("water_level, created_at")
      .eq("device_id", deviceId)
      .gte("created_at", thirtyMinutesAgo)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!readings || readings.length < 2) {
      return NextResponse.json({ alerts: [], message: "Insufficient data" });
    }

    const latest = readings[0];
    const currentLevel = latest.water_level;
    const previous = readings[Math.min(readings.length - 1, 5)];

    const timeDelta =
      (new Date(latest.created_at).getTime() -
        new Date(previous.created_at).getTime()) /
      (1000 * 60);
    const changeRate =
      timeDelta > 0 ? (currentLevel - previous.water_level) / timeDelta : 0;

    // Determine risk status
    let riskStatus: "safe" | "warning" | "critical" = "safe";
    if (
      currentLevel >= RISK_THRESHOLDS.criticalLevel ||
      changeRate >= RISK_THRESHOLDS.criticalRiseRate
    ) {
      riskStatus = "critical";
    } else if (
      currentLevel >= RISK_THRESHOLDS.warningLevel ||
      changeRate >= RISK_THRESHOLDS.warningRiseRate
    ) {
      riskStatus = "warning";
    }

    const sentAlerts: AlertPayload[] = [];

    // Check high level
    if (currentLevel > highThreshold) {
      const alertKey = `high_${deviceId}`;
      if (shouldSendAlert(alertKey)) {
        const payload: AlertPayload = {
          nodeId: deviceId,
          currentLevel,
          risingSpeed: Math.round(changeRate * 100) / 100,
          riskStatus,
          timestamp: latest.created_at,
          alertType: "🔺 High Water Level",
          message: `Water level (${currentLevel.toFixed(
            1
          )}cm) exceeds safe threshold (${highThreshold}cm)`,
          threshold: highThreshold,
          trend:
            changeRate > 0 ? "rising" : changeRate < 0 ? "falling" : "stable",
        };
        await sendTelegramAlert(payload);
        sentAlerts.push(payload);
      }
    }

    // Check low level
    if (currentLevel < lowThreshold) {
      const alertKey = `low_${deviceId}`;
      if (shouldSendAlert(alertKey)) {
        const payload: AlertPayload = {
          nodeId: deviceId,
          currentLevel,
          risingSpeed: Math.round(changeRate * 100) / 100,
          riskStatus,
          timestamp: latest.created_at,
          alertType: "🔻 Low Water Level",
          message: `Water level (${currentLevel.toFixed(
            1
          )}cm) dropped below minimum threshold (${lowThreshold}cm)`,
          threshold: lowThreshold,
          trend:
            changeRate > 0 ? "rising" : changeRate < 0 ? "falling" : "stable",
        };
        await sendTelegramAlert(payload);
        sentAlerts.push(payload);
      }
    }

    // Check rapid rise
    if (changeRate >= RISK_THRESHOLDS.warningRiseRate) {
      const alertKey = `rise_${deviceId}`;
      if (shouldSendAlert(alertKey)) {
        const payload: AlertPayload = {
          nodeId: deviceId,
          currentLevel,
          risingSpeed: Math.round(changeRate * 100) / 100,
          riskStatus,
          timestamp: latest.created_at,
          alertType: "⚡ Rapid Water Rise",
          message: `Water rising rapidly at ${changeRate.toFixed(
            2
          )} cm/min - potential flood risk!`,
          trend: "rising",
        };
        await sendTelegramAlert(payload);
        sentAlerts.push(payload);
      }
    }

    // Check critical risk
    if (riskStatus === "critical") {
      const alertKey = `critical_${deviceId}`;
      if (shouldSendAlert(alertKey)) {
        const payload: AlertPayload = {
          nodeId: deviceId,
          currentLevel,
          risingSpeed: Math.round(changeRate * 100) / 100,
          riskStatus,
          timestamp: latest.created_at,
          alertType: "🚨 CRITICAL FLOOD RISK",
          message:
            "IMMEDIATE ATTENTION REQUIRED! Critical flood conditions detected. Take protective action now!",
          trend:
            changeRate > 0 ? "rising" : changeRate < 0 ? "falling" : "stable",
        };
        await sendTelegramAlert(payload);
        sentAlerts.push(payload);
      }
    }

    return NextResponse.json({
      alerts: sentAlerts,
      currentLevel,
      changeRate: Math.round(changeRate * 100) / 100,
      riskStatus,
      timestamp: latest.created_at,
    });
  } catch (error) {
    console.error("Alert check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    telegramConfigured: !!(
      process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID
    ),
    timestamp: new Date().toISOString(),
  });
}
