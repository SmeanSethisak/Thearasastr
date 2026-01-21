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

  // Derive pump mode from LED state: LED true = pump_in, LED false = pump_out/off
  const pumpMode: PumpMode = deviceState?.led ? "pump_in" : "off";

  // Fetch the current device state from Supabase
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

  // Set pump mode by updating LED state
  // Pump In = LED true, Pump Out/Stop = LED false
  const setPumpModeAction = async (mode: PumpMode) => {
    if (updating || !deviceState) return;

    const newLedState = mode === "pump_in"; // pump_in = true, pump_out/off = false
    
    // Optimistic update
    setDeviceState((prev) => prev ? { ...prev, led: newLedState } : null);
    setUpdating(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("device_control")
        .update({ led: newLedState })
        .eq("id", 1);

      if (updateError) throw updateError;
    } catch (err) {
      // Revert on error
      setDeviceState((prev) => prev ? { ...prev, led: !newLedState } : null);
      setError(err instanceof Error ? err.message : "Failed to update pump");
    } finally {
      setUpdating(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDeviceState();
  }, [fetchDeviceState]);

  // Set up real-time subscription for live updates
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

  // Get status display config
  const getStatusConfig = () => {
    if (deviceState?.led) {
      return {
        bg: "bg-blue-100",
        ring: "bg-blue-500",
        shadow: "shadow-blue-500/50",
        text: "text-blue-800",
        badge: "bg-blue-100 text-blue-800",
        icon: "💧",
        label: "PUMPING IN",
        description: "Adding water to irrigation system",
      };
    }
    return {
      bg: "bg-gray-100",
      ring: "bg-gray-400",
      shadow: "shadow-gray-400/50",
      text: "text-gray-600",
      badge: "bg-gray-100 text-gray-600",
      icon: "⏸️",
      label: "STANDBY",
      description: "Pump system inactive",
    };
  };

  const status = getStatusConfig();
  const isActive = deviceState?.led === true;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            🚰 Irrigation Pump Control
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            ESP32-based water pump controller
          </p>
        </div>
        <span className="text-xs text-gray-400">
          Polls every 2s
        </span>
      </div>

      {/* Status Display */}
      <div className={`${status.bg} rounded-lg p-4 mb-6`}>
        <div className="flex items-center gap-4">
          {/* Animated Status Indicator */}
          <div className="relative">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${status.bg}`}
            >
              {isActive && (
                <div
                  className={`absolute inset-0 rounded-full ${status.ring} animate-ping opacity-25`}
                ></div>
              )}
              <div
                className={`w-10 h-10 rounded-full ${status.ring} ${status.shadow} shadow-lg flex items-center justify-center`}
              >
                <span className="text-xl">{status.icon}</span>
              </div>
            </div>
          </div>

          {/* Status Text */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${status.badge}`}
              >
                {isActive && (
                  <span className={`w-2 h-2 ${status.ring} rounded-full animate-pulse`}></span>
                )}
                {status.label}
              </span>
            </div>
            <p className={`${status.text} text-sm`}>{status.description}</p>
          </div>
        </div>

        {/* Current Water Level Display (if available) */}
        {currentWaterLevel !== undefined && (
          <div className="mt-4 pt-4 border-t border-gray-200/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Current Water Level:</span>
              <span className="font-semibold text-gray-900">
                {currentWaterLevel.toFixed(1)} cm
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <span>Low: {lowThreshold} cm</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentWaterLevel > highThreshold
                      ? "bg-red-500"
                      : currentWaterLevel < lowThreshold
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, (currentWaterLevel / (highThreshold * 1.2)) * 100))}%`,
                  }}
                />
              </div>
              <span>High: {highThreshold} cm</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setPumpModeAction("pump_in")}
          disabled={updating}
          className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 flex flex-col items-center gap-1 ${
            deviceState?.led
              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
              : updating
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
          }`}
        >
          <span className="text-xl">💧</span>
          <span className="text-xs">Pump In (ON)</span>
        </button>

        <button
          onClick={() => setPumpModeAction("off")}
          disabled={updating}
          className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 flex flex-col items-center gap-1 ${
            !deviceState?.led
              ? "bg-gray-500 text-white shadow-lg shadow-gray-500/30"
              : updating
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <span className="text-xl">⏹️</span>
          <span className="text-xs">Stop (OFF)</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 text-center">⚠️ {error}</p>
          <button
            onClick={fetchDeviceState}
            className="mt-2 w-full text-sm text-red-600 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {updating && (
        <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-sm">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Updating pump...
        </div>
      )}
    </div>
  );
}
