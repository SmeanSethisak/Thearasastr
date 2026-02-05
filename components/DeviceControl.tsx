"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type PumpMode = "off" | "pump_in" | "pump_out";

interface DeviceState {
  id: number;
  led: boolean;
}

interface IrrigationControlProps {
  currentWaterLevel?: number;
  highThreshold?: number;
  lowThreshold?: number;
}

export default function DeviceControl({
  currentWaterLevel,
  highThreshold = 150,
  lowThreshold = 10,
}: IrrigationControlProps = {}) {
  const [deviceState, setDeviceState] = useState<DeviceState | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pumpMode: PumpMode = deviceState?.led ? "pump_in" : "off";

  const fetchDeviceState = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("device_control")
        .select("id, led")
        .eq("id", 1)
        .single();

      if (fetchError) throw fetchError;
      setDeviceState(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch device state"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const setPumpModeAction = async (mode: PumpMode) => {
    if (updating || !deviceState) return;

    const newLedState = mode === "pump_in";
    setDeviceState((prev) => (prev ? { ...prev, led: newLedState } : null));
    setUpdating(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("device_control")
        .update({ led: newLedState })
        .eq("id", 1);

      if (updateError) throw updateError;
    } catch (err) {
      setDeviceState((prev) => (prev ? { ...prev, led: !newLedState } : null));
      setError(err instanceof Error ? err.message : "Failed to update pump");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchDeviceState();
  }, [fetchDeviceState]);

  useEffect(() => {
    const channel = supabase
      .channel("device_control_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "device_control",
          filter: "id=eq.1",
        },
        (payload) => {
          setDeviceState(payload.new as DeviceState);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isActive = deviceState?.led === true;

  if (loading) {
    return (
      <div className="panel">
        <div className="panel-header">SYSTEM CONTROL — IRRIGATION PUMP</div>
        <div className="p-4">
          <div className="h-32 bg-[var(--bg-tertiary)] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`status-dot ${isActive ? "nominal" : "warning"}`} />
          <span>SYSTEM CONTROL — IRRIGATION PUMP</span>
        </div>
        <span className="text-[var(--text-muted)] font-mono text-[10px]">
          ESP32 CONTROLLER
        </span>
      </div>

      <div className="p-4">
        {/* Status Display */}
        <div
          className="border p-4 mb-4"
          style={{
            borderColor: isActive
              ? "var(--status-nominal)"
              : "var(--border-primary)",
            backgroundColor: isActive
              ? "var(--status-nominal-bg)"
              : "var(--bg-tertiary)",
          }}
        >
          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="relative">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isActive
                    ? "var(--status-nominal)"
                    : "var(--bg-elevated)",
                  boxShadow: isActive
                    ? "0 0 20px var(--status-nominal)"
                    : "none",
                }}
              >
                <span className="text-xl">{isActive ? "▶" : "■"}</span>
              </div>
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-30"
                  style={{ backgroundColor: "var(--status-nominal)" }}
                />
              )}
            </div>

            {/* Status Text */}
            <div className="flex-1">
              <p
                className="text-lg font-bold tracking-wider"
                style={{
                  color: isActive
                    ? "var(--status-nominal)"
                    : "var(--text-secondary)",
                }}
              >
                {isActive ? "ACTIVE" : "STANDBY"}
              </p>
              <p className="text-[var(--text-muted)] text-xs">
                {isActive
                  ? "Pump system engaged — adding water"
                  : "Pump system idle"}
              </p>
            </div>
          </div>

          {/* Water Level Gauge */}
          {currentWaterLevel !== undefined && (
            <div className="mt-4 pt-4 border-t border-[var(--border-secondary)]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="metric-label">WATER LEVEL</span>
                <span className="font-mono font-semibold text-[var(--text-primary)]">
                  {currentWaterLevel.toFixed(1)} cm
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--text-muted)] font-mono w-8">
                  {lowThreshold}
                </span>
                <div className="flex-1 h-2 bg-[var(--bg-secondary)] relative">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          (currentWaterLevel / (highThreshold * 1.2)) * 100
                        )
                      )}%`,
                      backgroundColor:
                        currentWaterLevel > highThreshold
                          ? "var(--status-critical)"
                          : currentWaterLevel < lowThreshold
                          ? "var(--status-warning)"
                          : "var(--status-nominal)",
                    }}
                  />
                  {/* Threshold markers */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-[var(--status-warning)]"
                    style={{
                      left: `${(lowThreshold / (highThreshold * 1.2)) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-px bg-[var(--status-critical)]"
                    style={{
                      left: `${(highThreshold / (highThreshold * 1.2)) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono w-8 text-right">
                  {highThreshold}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPumpModeAction("pump_in")}
            disabled={updating}
            className={`control-btn flex flex-col items-center gap-2 py-4 ${
              isActive ? "active" : ""
            }`}
            style={
              isActive
                ? {
                    backgroundColor: "var(--status-nominal)",
                    borderColor: "var(--status-nominal)",
                    color: "var(--bg-primary)",
                  }
                : {}
            }
          >
            <span className="text-xl">▶</span>
            <span className="text-xs font-semibold tracking-wide">
              ENGAGE PUMP
            </span>
          </button>

          <button
            onClick={() => setPumpModeAction("off")}
            disabled={updating}
            className={`control-btn flex flex-col items-center gap-2 py-4 ${
              !isActive ? "active" : ""
            }`}
            style={
              !isActive
                ? {
                    backgroundColor: "var(--bg-elevated)",
                    borderColor: "var(--text-muted)",
                  }
                : {}
            }
          >
            <span className="text-xl">■</span>
            <span className="text-xs font-semibold tracking-wide">
              DISENGAGE
            </span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 border border-[var(--status-critical)] bg-[var(--status-critical-bg)]">
            <p className="text-[var(--status-critical)] text-xs font-mono">
              {error}
            </p>
            <button
              onClick={fetchDeviceState}
              className="mt-2 text-xs text-[var(--accent-primary)] hover:underline"
            >
              RETRY CONNECTION
            </button>
          </div>
        )}

        {/* Updating Indicator */}
        {updating && (
          <div className="mt-4 flex items-center justify-center gap-2 text-[var(--text-muted)] text-xs">
            <div className="w-3 h-3 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
            <span className="font-mono">TRANSMITTING COMMAND...</span>
          </div>
        )}
      </div>
    </div>
  );
}
