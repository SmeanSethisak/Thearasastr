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
}

async function sendTelegramAlert(payload: AlertPayload): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("Telegram not configured");
    return false;
  }

  const riskEmoji = {
    safe: "✅",
    warning: "⚠️",
    critical: "🚨",
  };

  const message = `
🌊 *Water Level Alert*
━━━━━━━━━━━━━━━━━━
📍 *Node ID:* ${payload.nodeId}
💧 *Current Level:* ${payload.currentLevel.toFixed(1)} cm
📈 *Rising Speed:* ${
    payload.risingSpeed >= 0 ? "+" : ""
  }${payload.risingSpeed.toFixed(2)} cm/min
${
  riskEmoji[payload.riskStatus]
} *Risk Status:* ${payload.riskStatus.toUpperCase()}
🕐 *Time:* ${new Date(payload.timestamp).toLocaleString()}
━━━━━━━━━━━━━━━━━━
⚡ *Alert Type:* ${payload.alertType}
📝 ${payload.message}
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
          parse_mode: "Markdown",
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
          alertType: "High Water Level",
          message: `Water level (${currentLevel.toFixed(
            1
          )}cm) exceeds threshold (${highThreshold}cm)`,
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
          alertType: "Low Water Level",
          message: `Water level (${currentLevel.toFixed(
            1
          )}cm) below threshold (${lowThreshold}cm)`,
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
          alertType: "Rapid Water Rise",
          message: `Water rising at ${changeRate.toFixed(2)} cm/min`,
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
          alertType: "CRITICAL FLOOD RISK",
          message:
            "Immediate attention required! Critical flood conditions detected.",
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
