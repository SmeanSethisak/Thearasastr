"use client";

import { useState } from "react";

interface DeviceSelectorProps {
  devices: string[];
  selectedDevice: string;
  onDeviceChange: (deviceId: string) => void;
  loading: boolean;
}

export function DeviceSelector({
  devices,
  selectedDevice,
  onDeviceChange,
  loading,
}: DeviceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return <div className="bg-gray-200 rounded-lg h-12 animate-pulse w-48" />;
  }

  if (!devices || devices.length === 0) {
    return <div className="text-gray-500">No devices available</div>;
  }

  return (
    <div className="relative inline-block w-full md:w-64">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex justify-between items-center hover:border-blue-500 transition-colors"
      >
        <span className="font-medium text-gray-900">
          {selectedDevice || "Select Device"}
        </span>
        <span
          className={`text-gray-600 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {devices.map((device) => (
            <button
              key={device}
              onClick={() => {
                onDeviceChange(device);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                selectedDevice === device
                  ? "bg-blue-100 text-blue-900 font-medium"
                  : "text-gray-900"
              }`}
            >
              {device}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
