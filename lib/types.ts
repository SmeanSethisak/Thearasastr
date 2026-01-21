// Flood Risk Levels
export type FloodRiskLevel = "safe" | "warning" | "critical";

export interface FloodRiskPrediction {
  level: FloodRiskLevel;
  currentLevel: number;
  changeRate: number; // cm/min
  predictedLevel30min: number;
  predictedLevel60min: number;
  confidence: number; // 0-100
  timestamp: string;
  factors: string[];
}

// Water Level Change Rate
export interface WaterLevelChangeRate {
  currentLevel: number;
  previousLevel: number;
  changeRate: number; // cm/min
  trend: "rising" | "falling" | "stable";
  trendStrength: "slow" | "moderate" | "fast" | "rapid";
  calculatedAt: string;
  timeDeltaMinutes: number;
}

// Alert Configuration
export interface AlertConfig {
  highThreshold: number;
  lowThreshold: number;
  criticalRiseRate: number; // cm/min
  warningRiseRate: number; // cm/min
  cooldownMinutes: number;
  telegramEnabled: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
}

// Alert Notification
export interface AlertNotification {
  id: string;
  deviceId: string;
  type: "high_level" | "low_level" | "rapid_rise" | "critical_risk";
  severity: "warning" | "critical";
  currentLevel: number;
  changeRate: number;
  riskStatus: FloodRiskLevel;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  notificationSent: boolean;
}

// Telegram Alert Message
export interface TelegramAlertPayload {
  nodeId: string;
  currentLevel: number;
  risingSpeed: number;
  riskStatus: FloodRiskLevel;
  timestamp: string;
  alertType: string;
}

// Default thresholds
export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  highThreshold: 150,
  lowThreshold: 10,
  criticalRiseRate: 2.0, // cm/min - very fast rise
  warningRiseRate: 0.5, // cm/min - moderate rise
  cooldownMinutes: 5,
  telegramEnabled: false,
};

// Risk level thresholds
export const RISK_THRESHOLDS = {
  criticalLevel: 180, // cm
  warningLevel: 150, // cm
  criticalRiseRate: 2.0, // cm/min
  warningRiseRate: 0.5, // cm/min
};
