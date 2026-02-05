"use client";

import { useEffect, useState } from "react";

interface CommandHeaderProps {
  systemName?: string;
  deviceCount?: number;
  onlineCount?: number;
  selectedDevice?: string;
  onDeviceChange?: (device: string) => void;
  devices?: string[];
  devicesLoading?: boolean;
}

export function CommandHeader({
  systemName = "HYDRO-MON",
  deviceCount = 0,
  onlineCount = 0,
  selectedDevice,
  onDeviceChange,
  devices = [],
  devicesLoading = false,
}: CommandHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] sticky top-0 z-50">
      {/* Primary Header Bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: System Identity */}
        <div className="flex items-center gap-6">
          {/* System Logo/Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--accent-primary)] rounded flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[var(--bg-primary)]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider text-[var(--text-primary)]">
                {systemName}
              </h1>
              <p className="text-[10px] text-[var(--text-muted)] tracking-wide uppercase">
                Water Level Command Center
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-[var(--border-primary)]" />

          {/* System Status Indicator */}
          <div className="flex items-center gap-2">
            <span className="status-dot nominal" />
            <span className="text-xs font-medium text-[var(--status-nominal)] uppercase tracking-wide">
              System Online
            </span>
          </div>
        </div>

        {/* Center: Node Selector */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Active Node
          </span>
          {devicesLoading ? (
            <div className="w-40 h-8 bg-[var(--bg-tertiary)] animate-pulse rounded" />
          ) : (
            <select
              value={selectedDevice}
              onChange={(e) => onDeviceChange?.(e.target.value)}
              className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] px-3 py-1.5 text-sm font-mono rounded focus:border-[var(--accent-primary)] focus:outline-none min-w-[160px]"
            >
              {devices.map((device) => (
                <option key={device} value={device}>
                  {device}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right: Time & Status */}
        <div className="flex items-center gap-6">
          {/* Node Summary */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)] uppercase tracking-wide">
                Nodes
              </span>
              <span className="font-mono font-bold text-[var(--text-primary)]">
                {onlineCount}/{deviceCount}
              </span>
            </div>
            <div className="h-4 w-px bg-[var(--border-primary)]" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--status-nominal)]" />
              <span className="text-[var(--status-nominal)] font-medium">
                {onlineCount} Online
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-[var(--border-primary)]" />

          {/* Timestamp */}
          <div className="text-right">
            <div className="font-mono text-lg font-bold text-[var(--text-primary)] tabular-nums">
              {formatTime(currentTime)}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Status Bar */}
      <div className="px-4 py-1.5 bg-[var(--bg-tertiary)] border-t border-[var(--border-secondary)] flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-6">
          <span className="text-[var(--text-muted)]">
            POLL RATE:{" "}
            <span className="font-mono text-[var(--text-secondary)]">
              5000ms
            </span>
          </span>
          <span className="text-[var(--text-muted)]">
            PROTOCOL:{" "}
            <span className="font-mono text-[var(--text-secondary)]">
              LORA/SUPABASE
            </span>
          </span>
          <span className="text-[var(--text-muted)]">
            REGION:{" "}
            <span className="font-mono text-[var(--text-secondary)]">
              TH-CENTRAL
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-nominal)] animate-pulse" />
          <span className="text-[var(--text-muted)]">
            REAL-TIME SYNC ACTIVE
          </span>
        </div>
      </div>
    </header>
  );
}
