"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  FloodRiskLevel,
  FloodRiskPrediction,
  WaterLevelChangeRate,
  AlertNotification,
  AlertConfig,
  DEFAULT_ALERT_CONFIG,
  RISK_THRESHOLDS,
} from "@/lib/types";

export interface WaterLevelReading {
  id: number;
  device_id: string;
  water_level: number;
  created_at: string;
}

export interface WaterLevelStats {
  latest: number;
  max: number;
  min: number;
  average: number;
  timestamp: string;
}

export interface TimePeriodAverages {
  last1hour: number;
  last6hours: number;
  last12hours: number;
  last24hours: number;
}

export interface AnomalyAlert {
  type: "high" | "low";
  currentLevel: number;
  threshold: number;
  timestamp: string;
  message: string;
}

export interface WaterLevelReport {
  deviceId: string;
  generatedAt: string;
  period: string;
  latest: number;
  max: number;
  min: number;
  average: number;
  timePeriodAverages: TimePeriodAverages;
  alerts: AnomalyAlert[];
}

// Device node with location for map display
export interface DeviceNode {
  deviceId: string;
  latitude: number;
  longitude: number;
  name?: string;
  latestReading?: number;
  lastUpdated?: string;
  riskLevel: FloodRiskLevel;
}

// Default coordinates for devices (can be overridden by database)
// These are placeholder coordinates - update with actual device locations
const DEFAULT_DEVICE_LOCATIONS: Record<string, { lat: number; lng: number; name?: string }> = {
  // Add your device locations here, example:
  // "device_001": { lat: 13.7563, lng: 100.5018, name: "Bangkok Station 1" },
};

// Fetch all device nodes with their locations and latest readings
export const useDeviceNodes = () => {
  const [nodes, setNodes] = useState<DeviceNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeviceNodes = async () => {
      try {
        setLoading(true);

        // Fetch latest readings for all devices
        const { data: readings, error: err } = await supabase
          .from("water_levels")
          .select("device_id, water_level, created_at")
          .order("created_at", { ascending: false });

        if (err) throw err;

        // Group by device_id and get latest reading for each
        const deviceMap = new Map<string, { level: number; timestamp: string }>();
        readings?.forEach((reading) => {
          if (!deviceMap.has(reading.device_id)) {
            deviceMap.set(reading.device_id, {
              level: reading.water_level,
              timestamp: reading.created_at,
            });
          }
        });

        // Try to fetch device locations from database if available
        let deviceLocations: Record<string, { lat: number; lng: number; name?: string }> = {};
        
        try {
          const { data: locations } = await supabase
            .from("device_locations")
            .select("device_id, latitude, longitude, name");
          
          if (locations) {
            locations.forEach((loc) => {
              deviceLocations[loc.device_id] = {
                lat: loc.latitude,
                lng: loc.longitude,
                name: loc.name,
              };
            });
          }
        } catch {
          // device_locations table doesn't exist, use defaults
          deviceLocations = DEFAULT_DEVICE_LOCATIONS;
        }

        // Create device nodes with locations
        const deviceNodes: DeviceNode[] = [];
        let index = 0;
        
        deviceMap.forEach((data, deviceId) => {
          // Determine risk level based on water level
          let riskLevel: FloodRiskLevel = "safe";
          if (data.level >= RISK_THRESHOLDS.criticalLevel) {
            riskLevel = "critical";
          } else if (data.level >= RISK_THRESHOLDS.warningLevel) {
            riskLevel = "warning";
          }

          // Use location from database or defaults, or generate placeholder
          const location = deviceLocations[deviceId] || {
            // Generate placeholder coordinates (spread around a center point)
            // Replace this with your actual default center coordinates
            lat: 13.7563 + (index * 0.01),
            lng: 100.5018 + (index * 0.01),
            name: `Node ${deviceId}`,
          };

          deviceNodes.push({
            deviceId,
            latitude: location.lat,
            longitude: location.lng,
            name: location.name || deviceId,
            latestReading: data.level,
            lastUpdated: data.timestamp,
            riskLevel,
          });
          
          index++;
        });

        setNodes(deviceNodes);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch device nodes");
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceNodes();
    const interval = setInterval(fetchDeviceNodes, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { nodes, loading, error };
};

// Fetch latest readings for all devices
export const useLatestReadings = () => {
  const [data, setData] = useState<WaterLevelReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoading(true);
        const { data: readings, error: err } = await supabase
          .from("water_levels")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (err) throw err;

        // Group by device_id and get latest for each
        const latestByDevice = new Map<string, WaterLevelReading>();
        readings?.forEach((reading) => {
          if (!latestByDevice.has(reading.device_id)) {
            latestByDevice.set(reading.device_id, reading);
          }
        });

        setData(Array.from(latestByDevice.values()));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
};

// Fetch time series data for a specific device
export const useDeviceTimeSeries = (deviceId: string, hours: number = 24) => {
  const [data, setData] = useState<WaterLevelReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) return;

    const fetchTimeSeries = async () => {
      try {
        setLoading(true);
        const since = new Date(
          Date.now() - hours * 60 * 60 * 1000
        ).toISOString();

        const { data: readings, error: err } = await supabase
          .from("water_levels")
          .select("*")
          .eq("device_id", deviceId)
          .gte("created_at", since)
          .order("created_at", { ascending: true });

        if (err) throw err;

        setData(readings || []);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch time series"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSeries();
  }, [deviceId, hours]);

  return { data, loading, error };
};

// Fetch statistics for a device
export const useDeviceStats = (
  deviceId: string,
  hours: number = 24
): [WaterLevelStats | null, boolean, string | null] => {
  const [stats, setStats] = useState<WaterLevelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const since = new Date(
          Date.now() - hours * 60 * 60 * 1000
        ).toISOString();

        const { data: readings, error: err } = await supabase
          .from("water_levels")
          .select("water_level, created_at")
          .eq("device_id", deviceId)
          .gte("created_at", since)
          .order("created_at", { ascending: false });

        if (err) throw err;

        if (!readings || readings.length === 0) {
          setStats(null);
          return;
        }

        const levels = readings.map((r) => r.water_level);
        const latest = readings[0].water_level;
        const max = Math.max(...levels);
        const min = Math.min(...levels);
        const average = levels.reduce((a, b) => a + b, 0) / levels.length;

        setStats({
          latest,
          max,
          min,
          average: Math.round(average * 10) / 10,
          timestamp: readings[0].created_at,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [deviceId, hours]);

  return [stats, loading, error];
};

// Fetch all available devices
export const useAvailableDevices = () => {
  const [devices, setDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const { data: readings, error: err } = await supabase
          .from("water_levels")
          .select("device_id")
          .order("created_at", { ascending: false });

        if (err) throw err;

        const uniqueDevices = Array.from(
          new Set(readings?.map((r) => r.device_id) || [])
        ).sort();

        setDevices(uniqueDevices);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch devices"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  return { devices, loading, error };
};

// Calculate averages for different time periods
export const useTimePeriodAverages = (
  deviceId: string,
  referenceTime?: Date
): [TimePeriodAverages | null, boolean, string | null] => {
  const [averages, setAverages] = useState<TimePeriodAverages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) return;

    const fetchAverages = async () => {
      try {
        setLoading(true);
        const now = referenceTime || new Date();

        // Define time windows
        const periods = {
          last1hour: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          last6hours: new Date(now.getTime() - 6 * 60 * 60 * 1000),
          last12hours: new Date(now.getTime() - 12 * 60 * 60 * 1000),
          last24hours: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        };

        const results: TimePeriodAverages = {
          last1hour: 0,
          last6hours: 0,
          last12hours: 0,
          last24hours: 0,
        };

        // Fetch data for the longest period
        const { data: readings, error: err } = await supabase
          .from("water_levels")
          .select("water_level, created_at")
          .eq("device_id", deviceId)
          .gte("created_at", periods.last24hours.toISOString())
          .order("created_at", { ascending: false });

        if (err) throw err;

        if (!readings || readings.length === 0) {
          setAverages(results);
          return;
        }

        // Calculate averages for each period
        Object.entries(periods).forEach(([key, periodDate]) => {
          const periodReadings = readings.filter(
            (r) => new Date(r.created_at) >= periodDate
          );
          if (periodReadings.length > 0) {
            const avg =
              periodReadings.reduce((sum, r) => sum + r.water_level, 0) /
              periodReadings.length;
            results[key as keyof TimePeriodAverages] =
              Math.round(avg * 10) / 10;
          }
        });

        setAverages(results);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch time period averages"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAverages();
  }, [deviceId, referenceTime]);

  return [averages, loading, error];
};

// Detect anomalies based on thresholds
export const useAnomalyDetection = (
  deviceId: string,
  highThreshold: number = 150,
  lowThreshold: number = 10
): [AnomalyAlert[], boolean, string | null] => {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) return;

    const fetchAnomalies = async () => {
      try {
        setLoading(true);
        const oneHourAgo = new Date(
          Date.now() - 1 * 60 * 60 * 1000
        ).toISOString();

        const { data: readings, error: err } = await supabase
          .from("water_levels")
          .select("water_level, created_at")
          .eq("device_id", deviceId)
          .gte("created_at", oneHourAgo)
          .order("created_at", { ascending: false });

        if (err) throw err;

        const detectedAlerts: AnomalyAlert[] = [];

        readings?.forEach((reading) => {
          if (reading.water_level > highThreshold) {
            detectedAlerts.push({
              type: "high",
              currentLevel: reading.water_level,
              threshold: highThreshold,
              timestamp: reading.created_at,
              message: `Water level too HIGH: ${reading.water_level}cm (threshold: ${highThreshold}cm)`,
            });
          } else if (reading.water_level < lowThreshold) {
            detectedAlerts.push({
              type: "low",
              currentLevel: reading.water_level,
              threshold: lowThreshold,
              timestamp: reading.created_at,
              message: `Water level too LOW: ${reading.water_level}cm (threshold: ${lowThreshold}cm)`,
            });
          }
        });

        setAlerts(detectedAlerts);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to detect anomalies"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [deviceId, highThreshold, lowThreshold]);

  return [alerts, loading, error];
};

// Generate comprehensive report
export const useGenerateReport = (
  deviceId: string,
  hoursBack: number = 24
): [WaterLevelReport | null, boolean, string | null] => {
  const [report, setReport] = useState<WaterLevelReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) return;

    const generateReport = async () => {
      try {
        setLoading(true);
        const since = new Date(
          Date.now() - hoursBack * 60 * 60 * 1000
        ).toISOString();
        const now = new Date();

        // Fetch all data for the period
        const { data: readings, error: err } = await supabase
          .from("water_levels")
          .select("water_level, created_at")
          .eq("device_id", deviceId)
          .gte("created_at", since)
          .order("created_at", { ascending: true });

        if (err) throw err;

        if (!readings || readings.length === 0) {
          setReport(null);
          return;
        }

        const levels = readings.map((r) => r.water_level);
        const latest = levels[levels.length - 1];
        const max = Math.max(...levels);
        const min = Math.min(...levels);
        const average =
          Math.round((levels.reduce((a, b) => a + b, 0) / levels.length) * 10) /
          10;

        // Calculate time period averages
        const periods = {
          last1hour: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          last6hours: new Date(now.getTime() - 6 * 60 * 60 * 1000),
          last12hours: new Date(now.getTime() - 12 * 60 * 60 * 1000),
          last24hours: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        };

        const timePeriodAverages: TimePeriodAverages = {
          last1hour: 0,
          last6hours: 0,
          last12hours: 0,
          last24hours: 0,
        };

        Object.entries(periods).forEach(([key, periodDate]) => {
          const periodReadings = readings.filter(
            (r) => new Date(r.created_at) >= periodDate
          );
          if (periodReadings.length > 0) {
            const avg =
              periodReadings.reduce((sum, r) => sum + r.water_level, 0) /
              periodReadings.length;
            timePeriodAverages[key as keyof TimePeriodAverages] =
              Math.round(avg * 10) / 10;
          }
        });

        // Detect alerts in this dataset
        const highThreshold = 150;
        const lowThreshold = 10;
        const detectedAlerts: AnomalyAlert[] = [];

        readings.forEach((reading) => {
          if (reading.water_level > highThreshold) {
            detectedAlerts.push({
              type: "high",
              currentLevel: reading.water_level,
              threshold: highThreshold,
              timestamp: reading.created_at,
              message: `Water level too HIGH: ${reading.water_level}cm`,
            });
          } else if (reading.water_level < lowThreshold) {
            detectedAlerts.push({
              type: "low",
              currentLevel: reading.water_level,
              threshold: lowThreshold,
              timestamp: reading.created_at,
              message: `Water level too LOW: ${reading.water_level}cm`,
            });
          }
        });

        setReport({
          deviceId,
          generatedAt: now.toISOString(),
          period: `Last ${hoursBack} hours`,
          latest,
          max,
          min,
          average,
          timePeriodAverages,
          alerts: detectedAlerts,
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate report"
        );
      } finally {
        setLoading(false);
      }
    };

    generateReport();
  }, [deviceId, hoursBack]);

  return [report, loading, error];
};

// Calculate water level change rate (cm/min)
export const useWaterLevelChangeRate = (
  deviceId: string
): [WaterLevelChangeRate | null, boolean, string | null] => {
  const [changeRate, setChangeRate] = useState<WaterLevelChangeRate | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) return;

    const calculateChangeRate = async () => {
      try {
        setLoading(true);
        // Get recent readings (last 30 minutes) for accurate rate calculation
        const thirtyMinutesAgo = new Date(
          Date.now() - 30 * 60 * 1000
        ).toISOString();

        const { data: readings, error: err } = await supabase
          .from("water_levels")
          .select("water_level, created_at")
          .eq("device_id", deviceId)
          .gte("created_at", thirtyMinutesAgo)
          .order("created_at", { ascending: false })
          .limit(10);

        if (err) throw err;

        if (!readings || readings.length < 2) {
          setChangeRate(null);
          setError(null);
          return;
        }

        const latest = readings[0];
        const previous = readings[readings.length - 1];

        const timeDeltaMs =
          new Date(latest.created_at).getTime() -
          new Date(previous.created_at).getTime();
        const timeDeltaMinutes = timeDeltaMs / (1000 * 60);

        if (timeDeltaMinutes === 0) {
          setChangeRate(null);
          return;
        }

        const levelChange = latest.water_level - previous.water_level;
        const rate = levelChange / timeDeltaMinutes;
        const roundedRate = Math.round(rate * 100) / 100; // ±0.1 cm/min accuracy

        // Determine trend
        let trend: "rising" | "falling" | "stable";
        if (Math.abs(roundedRate) < 0.05) {
          trend = "stable";
        } else if (roundedRate > 0) {
          trend = "rising";
        } else {
          trend = "falling";
        }

        // Determine trend strength
        let trendStrength: "slow" | "moderate" | "fast" | "rapid";
        const absRate = Math.abs(roundedRate);
        if (absRate < 0.1) {
          trendStrength = "slow";
        } else if (absRate < 0.5) {
          trendStrength = "moderate";
        } else if (absRate < 2.0) {
          trendStrength = "fast";
        } else {
          trendStrength = "rapid";
        }

        setChangeRate({
          currentLevel: latest.water_level,
          previousLevel: previous.water_level,
          changeRate: roundedRate,
          trend,
          trendStrength,
          calculatedAt: new Date().toISOString(),
          timeDeltaMinutes: Math.round(timeDeltaMinutes * 10) / 10,
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to calculate change rate"
        );
      } finally {
        setLoading(false);
      }
    };

    calculateChangeRate();
    const interval = setInterval(calculateChangeRate, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [deviceId]);

  return [changeRate, loading, error];
};

// Flood Risk Prediction System
export const useFloodRiskPrediction = (
  deviceId: string
): [FloodRiskPrediction | null, boolean, string | null] => {
  const [prediction, setPrediction] = useState<FloodRiskPrediction | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) return;

    const predictFloodRisk = async () => {
      try {
        setLoading(true);
        // Get readings from last 2 hours for trend analysis
        const twoHoursAgo = new Date(
          Date.now() - 2 * 60 * 60 * 1000
        ).toISOString();

        const { data: readings, error: err } = await supabase
          .from("water_levels")
          .select("water_level, created_at")
          .eq("device_id", deviceId)
          .gte("created_at", twoHoursAgo)
          .order("created_at", { ascending: true });

        if (err) throw err;

        if (!readings || readings.length < 2) {
          setPrediction(null);
          setError(null);
          return;
        }

        const currentLevel = readings[readings.length - 1].water_level;

        // Calculate average change rate over recent readings
        let totalChange = 0;
        let totalTime = 0;
        for (let i = 1; i < readings.length; i++) {
          const levelChange =
            readings[i].water_level - readings[i - 1].water_level;
          const timeChange =
            (new Date(readings[i].created_at).getTime() -
              new Date(readings[i - 1].created_at).getTime()) /
            (1000 * 60);
          totalChange += levelChange;
          totalTime += timeChange;
        }

        const changeRate = totalTime > 0 ? totalChange / totalTime : 0;
        const roundedRate = Math.round(changeRate * 100) / 100;

        // Predict future levels (linear extrapolation)
        const predictedLevel30min = currentLevel + roundedRate * 30;
        const predictedLevel60min = currentLevel + roundedRate * 60;

        // Determine risk level based on multiple factors
        const factors: string[] = [];
        let riskLevel: FloodRiskLevel = "safe";

        // Factor 1: Current level
        if (currentLevel >= RISK_THRESHOLDS.criticalLevel) {
          riskLevel = "critical";
          factors.push(
            `Current level (${currentLevel}cm) exceeds critical threshold`
          );
        } else if (currentLevel >= RISK_THRESHOLDS.warningLevel) {
          riskLevel = "warning";
          factors.push(
            `Current level (${currentLevel}cm) exceeds warning threshold`
          );
        }

        // Factor 2: Rate of change
        if (roundedRate >= RISK_THRESHOLDS.criticalRiseRate) {
          riskLevel = "critical";
          factors.push(`Rapid rise rate (${roundedRate.toFixed(2)} cm/min)`);
        } else if (
          roundedRate >= RISK_THRESHOLDS.warningRiseRate &&
          riskLevel !== "critical"
        ) {
          if (riskLevel === "safe") riskLevel = "warning";
          factors.push(`Moderate rise rate (${roundedRate.toFixed(2)} cm/min)`);
        }

        // Factor 3: Predicted levels
        if (
          predictedLevel30min >= RISK_THRESHOLDS.criticalLevel &&
          riskLevel !== "critical"
        ) {
          riskLevel = "critical";
          factors.push(`Predicted to reach critical level in 30 minutes`);
        } else if (
          predictedLevel30min >= RISK_THRESHOLDS.warningLevel &&
          riskLevel === "safe"
        ) {
          riskLevel = "warning";
          factors.push(`Predicted to reach warning level in 30 minutes`);
        }

        if (factors.length === 0) {
          factors.push("All parameters within safe limits");
        }

        // Calculate confidence based on data quality
        const dataPoints = readings.length;
        const confidence = Math.min(100, Math.round((dataPoints / 20) * 100));

        setPrediction({
          level: riskLevel,
          currentLevel,
          changeRate: roundedRate,
          predictedLevel30min: Math.round(predictedLevel30min * 10) / 10,
          predictedLevel60min: Math.round(predictedLevel60min * 10) / 10,
          confidence,
          timestamp: new Date().toISOString(),
          factors,
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to predict flood risk"
        );
      } finally {
        setLoading(false);
      }
    };

    predictFloodRisk();
    // Update prediction every 30 seconds (reduced from 2 seconds to prevent UI flickering)
    const interval = setInterval(predictFloodRisk, 30000);
    return () => clearInterval(interval);
  }, [deviceId]);

  return [prediction, loading, error];
};

// Smart Alert Notification System
export const useSmartAlerts = (
  deviceId: string,
  config: AlertConfig = DEFAULT_ALERT_CONFIG
): [AlertNotification[], boolean, string | null, () => Promise<void>] => {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastAlertTimeRef = useRef<Map<string, number>>(new Map());

  const checkAndGenerateAlerts = useCallback(async () => {
    if (!deviceId) return;

    try {
      setLoading(true);
      const thirtyMinutesAgo = new Date(
        Date.now() - 30 * 60 * 1000
      ).toISOString();

      const { data: readings, error: err } = await supabase
        .from("water_levels")
        .select("water_level, created_at")
        .eq("device_id", deviceId)
        .gte("created_at", thirtyMinutesAgo)
        .order("created_at", { ascending: false });

      if (err) throw err;

      if (!readings || readings.length < 2) {
        setAlerts([]);
        return;
      }

      const newAlerts: AlertNotification[] = [];
      const now = Date.now();
      const cooldownMs = config.cooldownMinutes * 60 * 1000;

      const latest = readings[0];
      const currentLevel = latest.water_level;

      // Calculate change rate
      const previous = readings[Math.min(readings.length - 1, 5)];
      const timeDelta =
        (new Date(latest.created_at).getTime() -
          new Date(previous.created_at).getTime()) /
        (1000 * 60);
      const changeRate =
        timeDelta > 0 ? (currentLevel - previous.water_level) / timeDelta : 0;

      // Determine risk status
      let riskStatus: FloodRiskLevel = "safe";
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

      // Check for high level alert
      if (currentLevel > config.highThreshold) {
        const alertKey = `high_level_${deviceId}`;
        const lastAlert = lastAlertTimeRef.current.get(alertKey) || 0;

        if (now - lastAlert > cooldownMs) {
          const severity =
            currentLevel >= RISK_THRESHOLDS.criticalLevel
              ? "critical"
              : "warning";
          newAlerts.push({
            id: `${alertKey}_${now}`,
            deviceId,
            type: "high_level",
            severity,
            currentLevel,
            changeRate: Math.round(changeRate * 100) / 100,
            riskStatus,
            message: `⚠️ High water level: ${currentLevel.toFixed(
              1
            )}cm (threshold: ${config.highThreshold}cm)`,
            timestamp: latest.created_at,
            acknowledged: false,
            notificationSent: false,
          });
          lastAlertTimeRef.current.set(alertKey, now);
        }
      }

      // Check for low level alert
      if (currentLevel < config.lowThreshold) {
        const alertKey = `low_level_${deviceId}`;
        const lastAlert = lastAlertTimeRef.current.get(alertKey) || 0;

        if (now - lastAlert > cooldownMs) {
          newAlerts.push({
            id: `${alertKey}_${now}`,
            deviceId,
            type: "low_level",
            severity: "warning",
            currentLevel,
            changeRate: Math.round(changeRate * 100) / 100,
            riskStatus,
            message: `⚠️ Low water level: ${currentLevel.toFixed(
              1
            )}cm (threshold: ${config.lowThreshold}cm)`,
            timestamp: latest.created_at,
            acknowledged: false,
            notificationSent: false,
          });
          lastAlertTimeRef.current.set(alertKey, now);
        }
      }

      // Check for rapid rise alert
      if (changeRate >= config.warningRiseRate) {
        const alertKey = `rapid_rise_${deviceId}`;
        const lastAlert = lastAlertTimeRef.current.get(alertKey) || 0;

        if (now - lastAlert > cooldownMs) {
          const severity =
            changeRate >= config.criticalRiseRate ? "critical" : "warning";
          newAlerts.push({
            id: `${alertKey}_${now}`,
            deviceId,
            type: "rapid_rise",
            severity,
            currentLevel,
            changeRate: Math.round(changeRate * 100) / 100,
            riskStatus,
            message: `🚨 Rapid water rise: ${changeRate.toFixed(2)} cm/min`,
            timestamp: latest.created_at,
            acknowledged: false,
            notificationSent: false,
          });
          lastAlertTimeRef.current.set(alertKey, now);
        }
      }

      // Check for critical risk alert
      if (riskStatus === "critical") {
        const alertKey = `critical_risk_${deviceId}`;
        const lastAlert = lastAlertTimeRef.current.get(alertKey) || 0;

        if (now - lastAlert > cooldownMs) {
          newAlerts.push({
            id: `${alertKey}_${now}`,
            deviceId,
            type: "critical_risk",
            severity: "critical",
            currentLevel,
            changeRate: Math.round(changeRate * 100) / 100,
            riskStatus,
            message: `🔴 CRITICAL FLOOD RISK - Immediate attention required!`,
            timestamp: latest.created_at,
            acknowledged: false,
            notificationSent: false,
          });
          lastAlertTimeRef.current.set(alertKey, now);
        }
      }

      setAlerts(newAlerts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check alerts");
    } finally {
      setLoading(false);
    }
  }, [deviceId, config]);

  // Send Telegram notification
  const sendTelegramAlert = useCallback(async () => {
    if (
      !config.telegramEnabled ||
      !config.telegramBotToken ||
      !config.telegramChatId
    ) {
      return;
    }

    for (const alert of alerts) {
      if (alert.notificationSent) continue;

      try {
        const message = `
🌊 *Water Level Alert*
━━━━━━━━━━━━━━━━━━
📍 *Node ID:* ${alert.deviceId}
💧 *Current Level:* ${alert.currentLevel.toFixed(1)} cm
📈 *Rising Speed:* ${alert.changeRate.toFixed(2)} cm/min
⚠️ *Risk Status:* ${alert.riskStatus.toUpperCase()}
🕐 *Time:* ${new Date(alert.timestamp).toLocaleString()}
━━━━━━━━━━━━━━━━━━
${alert.message}
        `.trim();

        const response = await fetch(
          `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: config.telegramChatId,
              text: message,
              parse_mode: "Markdown",
            }),
          }
        );

        if (response.ok) {
          alert.notificationSent = true;
        }
      } catch (err) {
        console.error("Failed to send Telegram alert:", err);
      }
    }
  }, [alerts, config]);

  useEffect(() => {
    checkAndGenerateAlerts();
    const interval = setInterval(checkAndGenerateAlerts, 30000); // Check every 30 seconds (reduced from 5 seconds)
    return () => clearInterval(interval);
  }, [checkAndGenerateAlerts]);

  // Auto-send Telegram alerts when new alerts are generated
  useEffect(() => {
    if (alerts.length > 0 && config.telegramEnabled) {
      sendTelegramAlert();
    }
  }, [alerts, config.telegramEnabled, sendTelegramAlert]);

  return [alerts, loading, error, sendTelegramAlert];
};

// Real-time subscription for water level updates
export const useRealTimeWaterLevels = (deviceId: string) => {
  const [latestReading, setLatestReading] = useState<WaterLevelReading | null>(
    null
  );
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!deviceId) return;

    const channel = supabase
      .channel(`water_levels_${deviceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "water_levels",
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          setLatestReading(payload.new as WaterLevelReading);
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deviceId]);

  return { latestReading, connected };
};
