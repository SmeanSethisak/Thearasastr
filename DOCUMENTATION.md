# 🌊 Smart Water Level Monitor & Irrigation Control System

## Complete System Documentation

A comprehensive real-time water level monitoring and irrigation control system built with Next.js, Supabase, and ESP32 IoT devices. The system provides flood risk prediction, automated alerts, and irrigation pump control.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Hooks & Data Management](#hooks--data-management)
5. [API Endpoints](#api-endpoints)
6. [Types & Interfaces](#types--interfaces)
7. [Features](#features)
8. [Configuration](#configuration)
9. [Database Schema](#database-schema)

---

## 🎯 System Overview

This system is designed to:
- **Monitor water levels** in real-time from multiple ESP32 sensor nodes
- **Predict flood risks** using trend analysis and configurable thresholds
- **Control irrigation pumps** to manage water flow in/out of the system
- **Send automated alerts** via Telegram when dangerous conditions are detected
- **Generate reports** with statistics and historical analysis

### Technology Stack
- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime Subscriptions
- **IoT**: ESP32 microcontrollers with water level sensors
- **Notifications**: Telegram Bot API

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Page.tsx  │  │  Components │  │    Custom Hooks         │  │
│  │  (Dashboard)│  │  (11 total) │  │  (useWaterLevels.ts)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                         API Routes                               │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐   │
│  │  /api/telegram      │  │  /api/alerts                    │   │
│  │  (Send reports)     │  │  (Check & send alerts)          │   │
│  └─────────────────────┘  └─────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                         Supabase                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐   │
│  │  water_levels   │  │ device_control  │  │ device_locations│  │
│  │  (sensor data)  │  │ (pump control)  │  │ (coordinates)   │  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      ESP32 IoT Devices                           │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │  Water Level    │  │  Irrigation     │                       │
│  │  Sensors        │  │  Pump Control   │                       │
│  └─────────────────┘  └─────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Components

### 1. **DeviceControl** (`components/DeviceControl.tsx`)
**Irrigation Pump Control System**

Controls the water pump for the irrigation system with the following features:
- **Pump In**: Adds water to the irrigation system (💧)
- **Pump Out**: Drains water from the irrigation system (🚿)
- **Stop**: Stops the pump (⏹️)
- **Auto Mode**: Automatically controls the pump based on water level thresholds

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentWaterLevel` | `number` | - | Current water level in cm |
| `highThreshold` | `number` | `150` | Upper threshold for auto drain |
| `lowThreshold` | `number` | `10` | Lower threshold for auto fill |

**Features:**
- Real-time status indicator with animated states
- Visual water level progress bar
- Auto-mode toggle with threshold-based control
- Optimistic UI updates with error rollback
- Real-time sync via Supabase subscriptions

---

### 2. **FloodRiskCard** (`components/FloodRiskCard.tsx`)
**Flood Risk Prediction Display**

Displays flood risk assessment with:
- Risk level indicator (Safe ✅ / Warning ⚠️ / Critical 🚨)
- Current water level
- Change rate (cm/min)
- Predicted levels (30 min & 60 min)
- Confidence percentage
- Risk factors list

**Exports:**
- `FloodRiskCard` - Full card component
- `FloodRiskBanner` - Compact banner for page header

---

### 3. **WaterLevelSpeedIndicator** (`components/WaterLevelSpeedIndicator.tsx`)
**Water Level Change Rate Display**

Shows water level change velocity with:
- Trend direction (Rising ↑ / Falling ↓ / Stable →)
- Trend strength (Slow/Moderate/Fast/Rapid)
- Current vs previous level comparison
- Visual strength indicator dots

**Exports:**
- `WaterLevelSpeedIndicator` - Full card component
- `SpeedIndicatorBadge` - Compact inline badge
- `SpeedIndicatorLarge` - Large header display

---

### 4. **StatsGrid** (`components/StatsGrid.tsx`)
**Statistics Summary Cards**

Displays 4 key metrics:
- 💧 Latest Reading
- 📈 Maximum (24h)
- 📉 Minimum (24h)
- 📊 Average (24h)

---

### 5. **TimeSeriesChart** (`components/TimeSeriesChart.tsx`)
**Water Level Trend Chart**

Interactive line chart using Recharts showing:
- Historical water level data
- Configurable time ranges (24h, 7d, 30d)
- Tooltips with exact values
- Responsive design

---

### 6. **WaterLevelAlerts** (`components/WaterLevelAlerts.tsx`)
**Alert Display System**

Shows abnormal water level readings:
- High level alerts (🔴)
- Low level alerts (🔵)
- Alert count summary
- Scrollable alert list

**Exports:**
- `WaterLevelAlerts` - Full alert list
- `AlertBanner` - Compact page-top banner

---

### 7. **TimePeriodAveragesCard** (`components/TimePeriodAveragesCard.tsx`)
**Time-Based Average Display**

Shows average water levels for:
- 🕐 Last 1 Hour
- 🕕 Last 6 Hours
- 🕛 Last 12 Hours
- 📅 Last 24 Hours

---

### 8. **WaterLevelReportCard** (`components/WaterLevelReportCard.tsx`)
**Comprehensive Report Generator**

Features:
- Statistics summary
- Time period averages
- Alerts summary
- **Export options:**
  - 📤 Send to Telegram
  - 📥 Download as TXT file
  - 🖨️ Print report

---

### 9. **LatestReadingsTable** (`components/LatestReadingsTable.tsx`)
**Recent Readings Table**

Displays latest readings from all devices:
- Device ID
- Water level (cm)
- Timestamp

---

### 10. **DeviceSelector** (`components/DeviceSelector.tsx`)
**Device Selection Dropdown**

Dropdown component to select which monitoring device to view.

---

### 11. **NodeMap** (`components/NodeMap.tsx`)
**Geographic Node Display**

Map visualization for device locations (if configured).

---

## 🪝 Hooks & Data Management

### `useWaterLevels.ts`

Central data management with 12 custom hooks:

| Hook | Purpose | Returns |
|------|---------|---------|
| `useLatestReadings()` | Latest readings from all devices | `{ data, loading, error }` |
| `useDeviceTimeSeries(deviceId, hours)` | Historical data for charts | `{ data, loading, error }` |
| `useDeviceStats(deviceId, hours)` | Statistics (min/max/avg) | `[stats, loading, error]` |
| `useAvailableDevices()` | List of all device IDs | `{ devices, loading, error }` |
| `useTimePeriodAverages(deviceId)` | Averages for 1h/6h/12h/24h | `[averages, loading, error]` |
| `useAnomalyDetection(deviceId, high, low)` | Threshold-based alerts | `[alerts, loading, error]` |
| `useGenerateReport(deviceId, hours)` | Full report generation | `[report, loading, error]` |
| `useWaterLevelChangeRate(deviceId)` | Rate of change (cm/min) | `[changeRate, loading, error]` |
| `useFloodRiskPrediction(deviceId)` | Flood risk analysis | `[prediction, loading, error]` |
| `useSmartAlerts(deviceId, config)` | Smart alerts with cooldown | `[alerts, loading, error, send]` |
| `useDeviceNodes()` | Device locations & status | `{ nodes, loading, error }` |
| `useRealTimeWaterLevels(deviceId)` | Real-time subscription | `{ latestReading, connected }` |

---

## 🔌 API Endpoints

### `POST /api/telegram`
Sends water level reports to Telegram.

**Request Body:**
```json
{
  "deviceId": "string",
  "period": "string",
  "generatedAt": "ISO timestamp",
  "latest": 0,
  "max": 0,
  "min": 0,
  "average": 0,
  "timePeriodAverages": {
    "last1hour": 0,
    "last6hours": 0,
    "last12hours": 0,
    "last24hours": 0
  },
  "alerts": []
}
```

---

### `POST /api/alerts`
Checks water levels and sends Telegram alerts if thresholds are exceeded.

**Request Body:**
```json
{
  "deviceId": "string",
  "highThreshold": 150,
  "lowThreshold": 10
}
```

**Response:**
```json
{
  "alerts": [],
  "currentLevel": 0,
  "changeRate": 0,
  "riskStatus": "safe|warning|critical",
  "timestamp": "ISO timestamp"
}
```

---

## 📝 Types & Interfaces

### Core Types (`lib/types.ts`)

```typescript
// Flood Risk Levels
type FloodRiskLevel = "safe" | "warning" | "critical";

// Flood Risk Prediction
interface FloodRiskPrediction {
  level: FloodRiskLevel;
  currentLevel: number;
  changeRate: number;        // cm/min
  predictedLevel30min: number;
  predictedLevel60min: number;
  confidence: number;        // 0-100
  timestamp: string;
  factors: string[];
}

// Water Level Change Rate
interface WaterLevelChangeRate {
  currentLevel: number;
  previousLevel: number;
  changeRate: number;        // cm/min
  trend: "rising" | "falling" | "stable";
  trendStrength: "slow" | "moderate" | "fast" | "rapid";
  calculatedAt: string;
  timeDeltaMinutes: number;
}

// Alert Configuration
interface AlertConfig {
  highThreshold: number;
  lowThreshold: number;
  criticalRiseRate: number;  // cm/min
  warningRiseRate: number;   // cm/min
  cooldownMinutes: number;
  telegramEnabled: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
}
```

### Default Thresholds

| Threshold | Value | Description |
|-----------|-------|-------------|
| `criticalLevel` | 180 cm | Critical flood risk |
| `warningLevel` | 150 cm | Warning flood risk |
| `criticalRiseRate` | 2.0 cm/min | Rapid rise danger |
| `warningRiseRate` | 0.5 cm/min | Moderate rise concern |
| `highThreshold` | 150 cm | Too much water |
| `lowThreshold` | 10 cm | Too little water |

---

## ✨ Features

### 1. Real-Time Monitoring
- Live water level updates via Supabase Realtime
- Auto-refresh every 30 seconds
- Instant device state synchronization

### 2. Flood Risk Prediction
- Trend analysis based on historical data
- Linear extrapolation for 30/60 minute predictions
- Multi-factor risk assessment
- Confidence scoring based on data quality

### 3. Irrigation Pump Control
- **Manual Mode**: Direct pump control (In/Out/Stop)
- **Auto Mode**: Threshold-based automatic control
  - Water > highThreshold → Pump Out
  - Water < lowThreshold → Pump In
- Real-time status with animated indicators
- ESP32 integration (polls every 2 seconds)

### 4. Smart Alert System
- Threshold-based alerts (high/low levels)
- Rate-based alerts (rapid rise detection)
- Cooldown system to prevent alert spam
- Telegram notifications with formatted messages

### 5. Reporting
- Comprehensive statistics reports
- Multiple export formats (Telegram, TXT, Print)
- Time period comparisons
- Alert history

---

## ⚙️ Configuration

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Telegram (Optional)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token
NEXT_PUBLIC_TELEGRAM_CHAT_ID=your_chat_id
```

---

## 🗄️ Database Schema

### `water_levels` Table
```sql
CREATE TABLE water_levels (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(255) NOT NULL,
  water_level DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `device_control` Table
```sql
CREATE TABLE device_control (
  id SERIAL PRIMARY KEY,
  led BOOLEAN DEFAULT FALSE,
  pump_mode VARCHAR(20) DEFAULT 'off',
  auto_enabled BOOLEAN DEFAULT FALSE
);
```

### `device_locations` Table (Optional)
```sql
CREATE TABLE device_locations (
  device_id VARCHAR(255) PRIMARY KEY,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  name VARCHAR(255)
);
```

---

## 🚀 Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Set up Supabase tables
5. Run development server: `npm run dev`
6. Configure ESP32 devices to send data to Supabase

---

## 📊 System Summary

| Category | Count | Description |
|----------|-------|-------------|
| Components | 11 | UI components for dashboard |
| Custom Hooks | 12 | Data fetching & state management |
| API Routes | 2 | Telegram & Alerts endpoints |
| Types | 8+ | TypeScript interfaces |
| Database Tables | 3 | Supabase PostgreSQL |

---

## 🔧 ESP32 Integration

The system expects ESP32 devices to:
1. **Send water level readings** to `water_levels` table
2. **Poll `device_control` table** every 2 seconds for pump commands
3. **Update pump status** based on `led` and `pump_mode` fields

---

*Built with ❤️ for smart water management and flood prevention*
