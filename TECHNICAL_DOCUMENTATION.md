# 🌊 Theareasastr - Complete Technical Documentation

## Smart Water Level Monitoring & Flood Prevention System

**Version:** 1.0.0  
**Last Updated:** February 2, 2026  
**Repository Structure:** Node_1 (Hardware/Firmware) + thearea (Dashboard/Frontend)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Hardware Architecture](#2-hardware-architecture)
3. [Firmware Technical Specifications](#3-firmware-technical-specifications)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend & Database](#5-backend--database)
6. [API Reference](#6-api-reference)
7. [Data Flow & Pipeline](#7-data-flow--pipeline)
8. [Component Reference](#8-component-reference)
9. [Custom Hooks Reference](#9-custom-hooks-reference)
10. [Type Definitions](#10-type-definitions)
11. [Styling System](#11-styling-system)
12. [Configuration](#12-configuration)

---

## 1. System Overview

### 1.1 Purpose

Theareasastr is a comprehensive IoT-based water level monitoring system designed for flood prevention and irrigation management. The system collects real-time water level data from distributed sensor nodes, transmits data via LoRa wireless protocol, stores it in a cloud database, and presents it through a modern web dashboard with predictive analytics.

### 1.2 Technology Stack

| Layer                  | Technology                         |
| ---------------------- | ---------------------------------- |
| **Microcontroller**    | ESP32 (Espressif)                  |
| **Wireless Protocol**  | LoRa (SX1262 Module) @ 433MHz      |
| **Sensor**             | HC-SR04 Ultrasonic Distance Sensor |
| **Cloud Database**     | Supabase (PostgreSQL)              |
| **Real-time Sync**     | Supabase Realtime Subscriptions    |
| **Frontend Framework** | Next.js 16.1.4 (App Router)        |
| **UI Library**         | React 19.2.3                       |
| **Language**           | TypeScript 5.x                     |
| **Styling**            | Tailwind CSS 4.x                   |
| **Charts**             | Recharts 2.10.3                    |
| **Maps**               | Leaflet / React-Leaflet 5.0.0      |
| **Notifications**      | Telegram Bot API                   |

### 1.3 System Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           THEAREASASTR SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   Node_1     │    │   Node_2     │    │   Pump       │              │
│  │  (Sensor)    │    │  (Sensor)    │    │  Controller  │              │
│  │  ESP32+LoRa  │    │  ESP32+LoRa  │    │  ESP32+WiFi  │              │
│  │  Ultrasonic  │    │  Ultrasonic  │    │  Relay/LED   │              │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘              │
│         │                   │                   │                        │
│         │LoRa 433MHz        │LoRa 433MHz        │ WiFi                   │
│         ▼                   ▼                   ▼                        │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │                    Station (Gateway)                      │          │
│  │                    ESP32 + LoRa + WiFi                    │          │
│  │            Receives LoRa → Sends to Supabase              │          │
│  │                  Telegram Notifications                    │          │
│  └─────────────────────────┬────────────────────────────────┘          │
│                            │                                            │
│                            │ HTTPS / REST API                           │
│                            ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │                    SUPABASE CLOUD                         │          │
│  │  ┌─────────────┐  ┌───────────────┐  ┌────────────────┐  │          │
│  │  │water_levels │  │device_control │  │device_locations│  │          │
│  │  │   (data)    │  │  (commands)   │  │  (coordinates) │  │          │
│  │  └─────────────┘  └───────────────┘  └────────────────┘  │          │
│  │                     Realtime Subscriptions                │          │
│  └─────────────────────────┬────────────────────────────────┘          │
│                            │                                            │
│                            │ WebSocket / REST                           │
│                            ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │                 NEXT.JS DASHBOARD                         │          │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │          │
│  │  │  Dashboard  │  │  Analytics  │  │  Device Control │   │          │
│  │  │    Page     │  │    Page     │  │      Page       │   │          │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │          │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │          │
│  │  │   Alerts    │  │   Reports   │  │    Settings     │   │          │
│  │  │    Page     │  │    Page     │  │      Page       │   │          │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │          │
│  │                                                           │          │
│  │                  12 Custom React Hooks                    │          │
│  │                  11 UI Components                         │          │
│  │                  2 API Routes (Telegram, Alerts)          │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Hardware Architecture

### 2.1 Device List

| Device      | Role                | MCU   | Connectivity       | Sensors/Actuators  |
| ----------- | ------------------- | ----- | ------------------ | ------------------ |
| **Node_1**  | Water Level Sensor  | ESP32 | LoRa SX1262        | HC-SR04 Ultrasonic |
| **Node_2**  | Water Level Sensor  | ESP32 | LoRa SX1262        | HC-SR04 Ultrasonic |
| **Station** | Gateway/Hub         | ESP32 | LoRa SX1262 + WiFi | None (relay)       |
| **Pump**    | Actuator Controller | ESP32 | WiFi               | LED/Relay          |

### 2.2 Pin Configurations

#### LoRa Module (SX1262) - All Sensor Nodes & Station

| Pin  | Function     | GPIO    |
| ---- | ------------ | ------- |
| MOSI | SPI Data Out | GPIO 10 |
| MISO | SPI Data In  | GPIO 11 |
| SCK  | SPI Clock    | GPIO 9  |
| NSS  | Chip Select  | GPIO 8  |
| DIO1 | Interrupt    | GPIO 14 |
| NRST | Reset        | GPIO 12 |
| BUSY | Busy Signal  | GPIO 13 |

#### Ultrasonic Sensor (HC-SR04) - Node_1 & Node_2

| Pin  | Function | GPIO   |
| ---- | -------- | ------ |
| TRIG | Trigger  | GPIO 6 |
| ECHO | Echo     | GPIO 5 |

#### Pump Controller

| Pin       | Function       | GPIO   |
| --------- | -------------- | ------ |
| LED/Relay | Output Control | GPIO 4 |

### 2.3 LoRa Configuration

```cpp
// LoRa Parameters
Frequency:      433.0 MHz
Bandwidth:      500.0 kHz
Spreading Factor: 12
Coding Rate:    5
Sync Word:      0x34
TX Power:       22 dBm
Preamble:       10 symbols
```

### 2.4 Node Addressing

| Node    | Address | Role                        |
| ------- | ------- | --------------------------- |
| Node_1  | 1       | Sensor (Tank Height: 150cm) |
| Node_2  | 2       | Sensor (Tank Height: 118cm) |
| Station | 3       | Gateway                     |

### 2.5 Power Requirements

| Device          | Power Source | Estimated Consumption     |
| --------------- | ------------ | ------------------------- |
| Sensor Nodes    | 3.3V-5V DC   | ~80mA active, ~10mA sleep |
| Station         | 3.3V-5V DC   | ~150mA (WiFi+LoRa active) |
| Pump Controller | 3.3V-5V DC   | ~50mA + relay load        |

---

## 3. Firmware Technical Specifications

### 3.1 Node_1 & Node_2 (Sensor Nodes)

**Language:** C++ (Arduino Framework)

**Libraries Used:**

- `SPI.h` - SPI communication
- `RadioLib.h` - LoRa radio operations

**Firmware Flow:**

```
┌─────────────────┐
│     SETUP       │
├─────────────────┤
│ Initialize Serial│
│ Configure Pins  │
│ Initialize SPI  │
│ Initialize LoRa │
│ (433MHz/500kHz) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      LOOP       │◄──────────────┐
├─────────────────┤               │
│ Read Ultrasonic │               │
│ Calculate Level │               │
│ Format Packet   │               │
│ Send via LoRa   │               │
│ Delay 2-3 sec   │───────────────┘
└─────────────────┘
```

**Key Functions:**

```cpp
// Ultrasonic reading
float readUltrasonic() {
    // Trigger pulse
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    // Measure echo
    long duration = pulseIn(ECHO_PIN, HIGH, 30000);
    float distance = duration * 0.034 / 2;
    float waterLevel = TANK_HEIGHT_CM - distance;

    return waterLevel; // or distance depending on node
}

// LoRa transmission
void sendLoRa(String message) {
    String packet = String(NODE_ADDRESS) + "|" + message;
    radio.transmit(packet);
}
```

**Packet Format:**

```
[NODE_ADDRESS]|[WATER_LEVEL] cm
Example: "1|45.2 cm"
```

### 3.2 Station (Gateway)

**Language:** C++ (Arduino Framework)

**Libraries Used:**

- `SPI.h` - SPI communication
- `RadioLib.h` - LoRa radio operations
- `WiFi.h` - WiFi connectivity
- `WiFiClientSecure.h` - HTTPS client
- `UniversalTelegramBot.h` - Telegram integration
- `ESPSupabase.h` - Supabase database client

**Firmware Flow:**

```
┌─────────────────────┐
│       SETUP         │
├─────────────────────┤
│ Initialize Serial   │
│ Connect to WiFi     │
│ Initialize Telegram │
│ Send "Online" msg   │
│ Initialize LoRa RX  │
│ Initialize Supabase │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│        LOOP         │◄─────────────────┐
├─────────────────────┤                  │
│ Receive LoRa Packet │                  │
│ Parse Node ID       │                  │
│ Parse Water Level   │                  │
│ Build JSON Payload  │                  │
│ Insert to Supabase  │                  │
│ (Optional: Telegram)│                  │
│ Restart LoRa RX     │                  │
│ Delay 500ms         │──────────────────┘
└─────────────────────┘
```

**JSON Payload Format:**

```json
{
  "device_id": "node_1",
  "water_level": 45.2
}
```

### 3.3 Pump Controller

**Language:** C++ (Arduino Framework)

**Libraries Used:**

- `WiFi.h` - WiFi connectivity
- `HTTPClient.h` - HTTP requests
- `ArduinoJson.h` - JSON parsing

**Firmware Flow:**

```
┌─────────────────────┐
│       SETUP         │
├─────────────────────┤
│ Initialize Serial   │
│ Configure LED Pin   │
│ Connect to WiFi     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│        LOOP         │◄─────────────────┐
├─────────────────────┤                  │
│ Check timer (2 sec) │                  │
│ Query Supabase      │                  │
│ GET device_control  │                  │
│ Parse LED state     │                  │
│ Set GPIO accordingly│                  │
│ Delay 1 sec         │──────────────────┘
└─────────────────────┘
```

**Supabase Query:**

```
GET /rest/v1/device_control?select=led&limit=1
Headers:
  apikey: [SUPABASE_ANON_KEY]
  Authorization: Bearer [SUPABASE_ANON_KEY]
```

---

## 4. Frontend Architecture

### 4.1 Project Structure

```
thearea/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (metadata, Leaflet CSS)
│   ├── page.tsx                 # Dashboard page
│   ├── globals.css              # Global styles & CSS variables
│   ├── alerts/page.tsx          # Alerts management
│   ├── analytics/page.tsx       # Charts & historical data
│   ├── readings/page.tsx        # Raw sensor readings
│   ├── reports/page.tsx         # Report generation
│   ├── settings/page.tsx        # System settings & pump control
│   └── api/
│       ├── alerts/route.ts      # Alert checking API
│       └── telegram/route.ts    # Telegram notification API
├── components/                   # React components
│   ├── AppLayout.tsx            # Main layout wrapper
│   ├── Sidebar.tsx              # Navigation sidebar
│   ├── StatsGrid.tsx            # Statistics cards
│   ├── FloodRiskCard.tsx        # Flood prediction display
│   ├── WaterLevelSpeedIndicator.tsx  # Change rate display
│   ├── TimeSeriesChart.tsx      # Recharts line graph
│   ├── WaterLevelAlerts.tsx     # Alert list component
│   ├── WaterLevelReportCard.tsx # Report generator
│   ├── TimePeriodAveragesCard.tsx # Time averages display
│   ├── LatestReadingsTable.tsx  # Raw data table
│   ├── DeviceControl.tsx        # Pump control interface
│   ├── DeviceSelector.tsx       # Device dropdown
│   └── NodeMap.tsx              # Geographic visualization
├── hooks/
│   └── useWaterLevels.ts        # 12 custom data hooks
├── lib/
│   ├── supabase.ts              # Supabase client config
│   └── types.ts                 # TypeScript interfaces
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind/postcss configs
```

### 4.2 Page Routes

| Route        | Page      | Description                      |
| ------------ | --------- | -------------------------------- |
| `/`          | Dashboard | Overview, stats, risk assessment |
| `/analytics` | Analytics | Time series charts, trends       |
| `/alerts`    | Alerts    | Alert monitoring & management    |
| `/reports`   | Reports   | Report generation & export       |
| `/readings`  | Readings  | Raw sensor data table            |
| `/settings`  | Settings  | Pump control, configuration      |

### 4.3 Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@types/leaflet": "^1.9.21",
    "leaflet": "^1.9.4",
    "next": "16.1.4",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-leaflet": "^5.0.0",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## 5. Backend & Database

### 5.1 Supabase Configuration

**Project URL:** `https://yquejwdxlnwseenchhvz.supabase.co`

### 5.2 Database Schema

#### Table: `water_levels`

```sql
CREATE TABLE water_levels (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(255) NOT NULL,
  water_level DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for time-based queries
CREATE INDEX idx_water_levels_device_time
ON water_levels(device_id, created_at DESC);
```

| Column        | Type          | Description                        |
| ------------- | ------------- | ---------------------------------- |
| `id`          | SERIAL        | Auto-increment primary key         |
| `device_id`   | VARCHAR(255)  | Device identifier (e.g., "node_1") |
| `water_level` | DECIMAL(10,2) | Water level in centimeters         |
| `created_at`  | TIMESTAMPTZ   | Automatic timestamp                |

#### Table: `device_control`

```sql
CREATE TABLE device_control (
  id SERIAL PRIMARY KEY,
  led BOOLEAN DEFAULT FALSE,
  pump_mode VARCHAR(20) DEFAULT 'off',
  auto_enabled BOOLEAN DEFAULT FALSE
);

-- Initial row
INSERT INTO device_control (id, led) VALUES (1, false);
```

| Column         | Type        | Description                        |
| -------------- | ----------- | ---------------------------------- |
| `id`           | SERIAL      | Primary key (always 1)             |
| `led`          | BOOLEAN     | Pump state (true = on)             |
| `pump_mode`    | VARCHAR(20) | Mode: 'off', 'pump_in', 'pump_out' |
| `auto_enabled` | BOOLEAN     | Auto-control enabled               |

#### Table: `device_locations` (Optional)

```sql
CREATE TABLE device_locations (
  device_id VARCHAR(255) PRIMARY KEY,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  name VARCHAR(255)
);
```

### 5.3 Realtime Subscriptions

The system uses Supabase Realtime for:

- `water_levels` INSERT events → Live dashboard updates
- `device_control` UPDATE events → Pump status sync

---

## 6. API Reference

### 6.1 POST `/api/telegram`

Sends formatted water level reports to Telegram.

**Request:**

```typescript
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
  alerts: Array<{
    type: "high" | "low";
    currentLevel: number;
    threshold: number;
    timestamp: string;
    message: string;
  }>;
}
```

**Response:**

```json
{
  "success": true,
  "message": "Report sent to Telegram successfully",
  "telegramResponse": { ... }
}
```

### 6.2 POST `/api/alerts`

Checks current water levels and sends alerts if thresholds exceeded.

**Request:**

```json
{
  "deviceId": "node_1",
  "highThreshold": 150,
  "lowThreshold": 10
}
```

**Response:**

```json
{
  "alerts": [...],
  "currentLevel": 45.2,
  "changeRate": 0.15,
  "riskStatus": "safe",
  "timestamp": "2026-02-02T10:30:00Z"
}
```

### 6.3 GET `/api/alerts`

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "telegramConfigured": true,
  "timestamp": "2026-02-02T10:30:00Z"
}
```

---

## 7. Data Flow & Pipeline

### 7.1 Data Acquisition Flow

```
[Ultrasonic Sensor] → [ESP32 Node] → [LoRa Transmission]
                                           │
                                           ▼
                          [Station ESP32] (LoRa Receive)
                                           │
                                           ▼
                            [Parse & Format JSON]
                                           │
                                           ▼
                         [Supabase REST API Insert]
                                           │
                                           ▼
                        [PostgreSQL water_levels table]
                                           │
              ┌────────────────────────────┼────────────────────────────┐
              │                            │                            │
              ▼                            ▼                            ▼
    [Realtime Subscription]    [REST API Queries]         [Alert Webhooks]
              │                            │                            │
              ▼                            ▼                            ▼
    [Live Dashboard Update]    [Historical Charts]      [Telegram Notifications]
```

### 7.2 Command Flow (Pump Control)

```
[Dashboard UI] → [DeviceControl Component]
                          │
                          ▼
            [Supabase UPDATE device_control]
                          │
                          ▼
            [Realtime Subscription Trigger]
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
[Dashboard Status Update]      [ESP32 Pump Controller]
                                          │
                                          ▼
                               [HTTP GET (polling 2s)]
                                          │
                                          ▼
                               [Parse LED state]
                                          │
                                          ▼
                               [Set GPIO Output]
```

### 7.3 Refresh Intervals

| Data Type             | Refresh Rate | Method             |
| --------------------- | ------------ | ------------------ |
| Latest Readings       | 30 seconds   | Polling + Realtime |
| Device Stats          | 30 seconds   | Polling            |
| Flood Risk Prediction | 30 seconds   | Polling            |
| Change Rate           | 30 seconds   | Polling            |
| Anomaly Detection     | 60 seconds   | Polling            |
| Smart Alerts          | 30 seconds   | Polling            |
| Pump Control          | 2 seconds    | ESP32 Polling      |

---

## 8. Component Reference

### 8.1 Layout Components

#### `AppLayout`

Main application wrapper with sidebar integration.

```tsx
<AppLayout alertCount={number}>{children}</AppLayout>
```

#### `PageHeader`

Page title and action buttons.

```tsx
<PageHeader
  title="Dashboard"
  description="Optional description"
  actions={<ReactNode />}
/>
```

#### `PageContent`

Content container with max-width constraint.

```tsx
<PageContent className="optional-classes">{children}</PageContent>
```

#### `Sidebar`

Navigation menu with alert badge.

### 8.2 Data Display Components

#### `StatsGrid`

Four-column statistics display.

```tsx
<StatsGrid stats={WaterLevelStats | null} loading={boolean} />
```

#### `FloodRiskCard`

Full flood risk assessment panel.

```tsx
<FloodRiskCard
  prediction={FloodRiskPrediction | null}
  loading={boolean}
  error={string | null}
/>
```

#### `FloodRiskBanner`

Compact alert banner for page headers.

#### `WaterLevelSpeedIndicator`

Rate of change display with trend visualization.

#### `TimeSeriesChart`

Recharts-based time series visualization.

```tsx
<TimeSeriesChart
  data={WaterLevelReading[]}
  loading={boolean}
  deviceId={string}
  highThreshold={number}
  lowThreshold={number}
/>
```

#### `TimePeriodAveragesCard`

1h/6h/12h/24h average comparison.

#### `WaterLevelAlerts`

Alert list with severity indicators.

#### `LatestReadingsTable`

Tabular display of recent readings.

#### `WaterLevelReportCard`

Report generator with Telegram/export buttons.

### 8.3 Control Components

#### `DeviceControl`

Pump control interface with status display.

```tsx
<DeviceControl
  currentWaterLevel={number}
  highThreshold={number}
  lowThreshold={number}
/>
```

#### `DeviceSelector`

Device selection dropdown.

---

## 9. Custom Hooks Reference

### 9.1 Data Fetching Hooks

| Hook                                   | Purpose                   | Returns                       |
| -------------------------------------- | ------------------------- | ----------------------------- |
| `useLatestReadings()`                  | Latest reading per device | `{ data, loading, error }`    |
| `useDeviceTimeSeries(deviceId, hours)` | Historical data           | `{ data, loading, error }`    |
| `useDeviceStats(deviceId, hours)`      | Min/max/avg stats         | `[stats, loading, error]`     |
| `useAvailableDevices()`                | List of device IDs        | `{ devices, loading, error }` |
| `useTimePeriodAverages(deviceId)`      | 1h/6h/12h/24h avgs        | `[averages, loading, error]`  |
| `useDeviceNodes()`                     | Devices with locations    | `{ nodes, loading, error }`   |

### 9.2 Analysis Hooks

| Hook                                       | Purpose                  | Returns                          |
| ------------------------------------------ | ------------------------ | -------------------------------- |
| `useAnomalyDetection(deviceId, high, low)` | Threshold alerts         | `[alerts, loading, error]`       |
| `useWaterLevelChangeRate(deviceId)`        | cm/min calculation       | `[changeRate, loading, error]`   |
| `useFloodRiskPrediction(deviceId)`         | Risk assessment          | `[prediction, loading, error]`   |
| `useSmartAlerts(deviceId, config)`         | Smart alerts w/ cooldown | `[alerts, loading, error, send]` |

### 9.3 Report & Realtime Hooks

| Hook                                 | Purpose            | Returns                        |
| ------------------------------------ | ------------------ | ------------------------------ |
| `useGenerateReport(deviceId, hours)` | Full report data   | `[report, loading, error]`     |
| `useRealTimeWaterLevels(deviceId)`   | Live subscriptions | `{ latestReading, connected }` |

---

## 10. Type Definitions

### 10.1 Core Types

```typescript
// Water Level Reading
interface WaterLevelReading {
  id: number;
  device_id: string;
  water_level: number;
  created_at: string;
}

// Statistics
interface WaterLevelStats {
  latest: number;
  max: number;
  min: number;
  average: number;
  timestamp: string;
}

// Time Period Averages
interface TimePeriodAverages {
  last1hour: number;
  last6hours: number;
  last12hours: number;
  last24hours: number;
}

// Flood Risk
type FloodRiskLevel = "safe" | "warning" | "critical";

interface FloodRiskPrediction {
  level: FloodRiskLevel;
  currentLevel: number;
  changeRate: number;
  predictedLevel30min: number;
  predictedLevel60min: number;
  confidence: number;
  timestamp: string;
  factors: string[];
}

// Change Rate
interface WaterLevelChangeRate {
  currentLevel: number;
  previousLevel: number;
  changeRate: number;
  trend: "rising" | "falling" | "stable";
  trendStrength: "slow" | "moderate" | "fast" | "rapid";
  calculatedAt: string;
  timeDeltaMinutes: number;
}

// Alert Configuration
interface AlertConfig {
  highThreshold: number;
  lowThreshold: number;
  criticalRiseRate: number;
  warningRiseRate: number;
  cooldownMinutes: number;
  telegramEnabled: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
}

// Alert Notification
interface AlertNotification {
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
```

### 10.2 Default Thresholds

```typescript
const DEFAULT_ALERT_CONFIG: AlertConfig = {
  highThreshold: 150, // cm
  lowThreshold: 10, // cm
  criticalRiseRate: 2.0, // cm/min
  warningRiseRate: 0.5, // cm/min
  cooldownMinutes: 5,
  telegramEnabled: false,
};

const RISK_THRESHOLDS = {
  criticalLevel: 180, // cm
  warningLevel: 150, // cm
  criticalRiseRate: 2.0, // cm/min
  warningRiseRate: 0.5, // cm/min
};
```

---

## 11. Styling System

### 11.1 CSS Variables (Dark Theme)

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0e14;
  --bg-secondary: #0d1117;
  --bg-tertiary: #161b22;
  --bg-panel: #1c2128;
  --bg-elevated: #21262d;

  /* Borders */
  --border-primary: #30363d;
  --border-secondary: #21262d;

  /* Text */
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --text-muted: #6e7681;

  /* Status Colors */
  --status-nominal: #238636;
  --status-warning: #d29922;
  --status-critical: #f85149;
  --status-info: #58a6ff;

  /* Accent */
  --accent-primary: #58a6ff;
}
```

### 11.2 Utility Classes

| Class                  | Purpose                              |
| ---------------------- | ------------------------------------ |
| `.panel`               | Container with border and background |
| `.panel-header`        | Section header styling               |
| `.status-dot`          | Animated status indicator            |
| `.control-btn`         | Interactive button styling           |
| `.metric-value`        | Large numeric display                |
| `.metric-label`        | Small uppercase label                |
| `.data-table`          | Styled data table                    |
| `.hover-lift-sm/md/lg` | Elevation on hover                   |

---

## 12. Configuration

### 12.1 Environment Variables

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Telegram (Optional)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your-bot-token
NEXT_PUBLIC_TELEGRAM_CHAT_ID=your-chat-id
```

### 12.2 Firmware Configuration

Located in each `.ino` file:

- WiFi credentials (SSID, password)
- Supabase URL and API key
- Telegram bot token and chat ID
- Node addresses
- Tank height values

---

## Summary Statistics

| Category              | Count |
| --------------------- | ----- |
| ESP32 Firmware Files  | 4     |
| React Components      | 11    |
| Custom Hooks          | 12    |
| API Routes            | 2     |
| TypeScript Interfaces | 10+   |
| Database Tables       | 3     |
| Dashboard Pages       | 6     |

---

_Documentation generated for Theareasastr Smart Water Level Monitoring System v1.0.0_
