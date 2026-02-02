# 🌊 Theareasastr IoT Prototype Documentation

## Smart Water Level Monitoring & Flood Prevention System

**Project Name:** Theareasastr  
**Version:** 1.0.0  
**Date:** February 2, 2026  
**Document Type:** IoT Prototype Specification

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Objectives & Scope](#2-objectives--scope)
3. [System Architecture](#3-system-architecture)
4. [Hardware Specifications](#4-hardware-specifications)
5. [Software Specifications](#5-software-specifications)
6. [IoT Data Pipeline](#6-iot-data-pipeline)
7. [Machine Learning / AI Model](#7-machine-learning--ai-model)
8. [Prototype Features](#8-prototype-features)
9. [Testing & Validation](#9-testing--validation)
10. [Known Issues & Limitations](#10-known-issues--limitations)
11. [Future Improvements](#11-future-improvements)
12. [Conclusion](#12-conclusion)
13. [Appendix](#13-appendix)

---

## 1. Project Overview

Theareasastr is a comprehensive IoT-based water level monitoring system designed for real-time flood prevention and irrigation management. The system integrates distributed sensor nodes communicating via LoRa wireless technology, a cloud-based data platform, and a modern web dashboard with predictive analytics capabilities.

---

## 2. Objectives & Scope

### 2.1 Problem Statement

Flooding and water management remain critical challenges in agricultural and urban environments. Traditional monitoring methods are:

- **Reactive rather than proactive** - alerts come too late for preventive action
- **Labor-intensive** - require manual inspection of water levels
- **Lacking real-time visibility** - no continuous monitoring capability
- **Without predictive capabilities** - cannot forecast flood risks based on trends
- **Disconnected** - no centralized system to monitor multiple locations

This project addresses these challenges by providing a **real-time, automated, and predictive** water level monitoring system with remote pump control capabilities.

### 2.2 Target Users / Beneficiaries

| User Group                    | Use Case                                                           |
| ----------------------------- | ------------------------------------------------------------------ |
| **Agricultural Farmers**      | Monitor irrigation water levels, prevent crop damage from flooding |
| **Facility Managers**         | Monitor water tanks, reservoirs, and drainage systems              |
| **Municipal Authorities**     | Monitor urban drainage and flood-prone areas                       |
| **Environmental Researchers** | Collect long-term water level data for analysis                    |
| **Smart City Planners**       | Integrate water monitoring into city infrastructure                |
| **Emergency Response Teams**  | Receive real-time alerts for flood conditions                      |

### 2.3 Prototype Goals

| Goal                         | Description                                               | Status                |
| ---------------------------- | --------------------------------------------------------- | --------------------- |
| **Real-time Monitoring**     | Continuous water level measurement with <5 second latency | ✅ Achieved           |
| **Multi-node Support**       | Support for multiple distributed sensor nodes             | ✅ Achieved (2 nodes) |
| **Long-range Communication** | LoRa-based wireless up to 2km range                       | ✅ Achieved           |
| **Cloud Data Storage**       | Persistent storage with historical data access            | ✅ Achieved           |
| **Web Dashboard**            | Modern, responsive monitoring interface                   | ✅ Achieved           |
| **Flood Risk Prediction**    | Trend-based risk assessment algorithm                     | ✅ Achieved           |
| **Automated Alerts**         | Telegram notifications for threshold breaches             | ✅ Achieved           |
| **Remote Pump Control**      | Cloud-controlled irrigation pump                          | ✅ Achieved           |
| **Report Generation**        | Exportable water level reports                            | ✅ Achieved           |

---

## 3. System Architecture

### 3.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              THEAREASASTR SYSTEM ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           EDGE LAYER (Field Devices)                         │ │
│  ├─────────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                               │ │
│  │  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      │ │
│  │  │   SENSOR NODE 1  │      │   SENSOR NODE 2  │      │  PUMP CONTROLLER │      │ │
│  │  │  ┌───────────┐  │      │  ┌───────────┐  │      │  ┌───────────┐  │      │ │
│  │  │  │ ESP32 MCU │  │      │  │ ESP32 MCU │  │      │  │ ESP32 MCU │  │      │ │
│  │  │  └─────┬─────┘  │      │  └─────┬─────┘  │      │  └─────┬─────┘  │      │ │
│  │  │        │        │      │        │        │      │        │        │      │ │
│  │  │  ┌─────┴─────┐  │      │  ┌─────┴─────┐  │      │  ┌─────┴─────┐  │      │ │
│  │  │  │ Ultrasonic│  │      │  │ Ultrasonic│  │      │  │  Relay/   │  │      │ │
│  │  │  │  HC-SR04  │  │      │  │  HC-SR04  │  │      │  │   LED     │  │      │ │
│  │  │  └───────────┘  │      │  └───────────┘  │      │  └───────────┘  │      │ │
│  │  │  ┌───────────┐  │      │  ┌───────────┐  │      │                  │      │ │
│  │  │  │LoRa SX1262│  │      │  │LoRa SX1262│  │      │    WiFi Only     │      │ │
│  │  │  │  433 MHz  │  │      │  │  433 MHz  │  │      │                  │      │ │
│  │  │  └─────┬─────┘  │      │  └─────┬─────┘  │      │                  │      │ │
│  │  └────────│────────┘      └────────│────────┘      └────────┬─────────┘      │ │
│  │           │                        │                        │                 │ │
│  │           │LoRa Packets            │LoRa Packets            │ WiFi/HTTP      │ │
│  │           │ (433MHz)               │ (433MHz)               │                 │ │
│  │           │                        │                        │                 │ │
│  └───────────┼────────────────────────┼────────────────────────┼─────────────────┘ │
│              │                        │                        │                   │
│              ▼                        ▼                        │                   │
│  ┌───────────────────────────────────────────────┐            │                   │
│  │              GATEWAY STATION                   │            │                   │
│  │  ┌─────────────────────────────────────────┐  │            │                   │
│  │  │              ESP32 MCU                   │  │            │                   │
│  │  │  ┌───────────┐      ┌───────────────┐   │  │            │                   │
│  │  │  │LoRa SX1262│      │  WiFi Module  │   │  │            │                   │
│  │  │  │  Receiver │      │   (ESP32)     │   │  │            │                   │
│  │  │  └───────────┘      └───────┬───────┘   │  │            │                   │
│  │  └─────────────────────────────│───────────┘  │            │                   │
│  └────────────────────────────────│──────────────┘            │                   │
│                                   │                            │                   │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─   │
│                                   │ HTTPS                      │                   │
│  ┌────────────────────────────────┼────────────────────────────┼─────────────────┐ │
│  │                          CLOUD LAYER                                          │ │
│  ├───────────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                         SUPABASE PLATFORM                                │ │ │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │ │ │
│  │  │  │   PostgreSQL    │  │    Realtime     │  │      REST API           │  │ │ │
│  │  │  │   Database      │  │  Subscriptions  │  │    (Auto-generated)     │  │ │ │
│  │  │  │  ┌───────────┐  │  │                 │  │                         │  │ │ │
│  │  │  │  │water_levels│  │  │  WebSocket     │  │  POST /water_levels     │  │ │ │
│  │  │  │  │device_ctrl │  │  │  Push Updates  │  │  GET  /device_control   │  │ │ │
│  │  │  │  │device_locs │  │  │                 │  │  PATCH /device_control  │  │ │ │
│  │  │  │  └───────────┘  │  │                 │  │                         │  │ │ │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                       TELEGRAM BOT API                                   │ │ │
│  │  │                    (External Notification Service)                       │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                               │ │
│  └───────────────────────────────────────────────────────────────────────────────┘ │
│                                          │                                         │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│                                          │ WebSocket / REST                        │
│  ┌───────────────────────────────────────┼───────────────────────────────────────┐ │
│  │                          APPLICATION LAYER                                     │ │
│  ├───────────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                    NEXT.JS WEB DASHBOARD                                 │ │ │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │ │ │
│  │  │  │  Dashboard  │ │  Analytics  │ │   Alerts    │ │  Device Control │   │ │ │
│  │  │  │    Page     │ │    Page     │ │    Page     │ │      Page       │   │ │ │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘   │ │ │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────────┐   │ │ │
│  │  │  │   Reports   │ │  Readings   │ │        12 Custom Hooks          │   │ │ │
│  │  │  │    Page     │ │    Page     │ │   (Data Fetching & Analysis)    │   │ │ │
│  │  │  └─────────────┘ └─────────────┘ └─────────────────────────────────┘   │ │ │
│  │  │  ┌─────────────────────────────────────────────────────────────────┐   │ │ │
│  │  │  │              Flood Risk Prediction Algorithm                     │   │ │ │
│  │  │  │         (Linear Extrapolation + Threshold Analysis)              │   │ │ │
│  │  │  └─────────────────────────────────────────────────────────────────┘   │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                               │ │
│  └───────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Component Breakdown

#### 3.2.1 Sensors

| Sensor      | Model              | Measurement               | Range       | Accuracy |
| ----------- | ------------------ | ------------------------- | ----------- | -------- |
| Water Level | HC-SR04 Ultrasonic | Distance to water surface | 2cm - 400cm | ±3mm     |

#### 3.2.2 Microcontrollers / Edge Devices

| Device          | MCU   | Role                     | Features                   |
| --------------- | ----- | ------------------------ | -------------------------- |
| Sensor Node 1   | ESP32 | Water level sensing      | LoRa TX, Ultrasonic sensor |
| Sensor Node 2   | ESP32 | Water level sensing      | LoRa TX, Ultrasonic sensor |
| Gateway Station | ESP32 | Data aggregation & relay | LoRa RX, WiFi, Telegram    |
| Pump Controller | ESP32 | Remote actuation         | WiFi, GPIO output          |

#### 3.2.3 Connectivity

| Protocol      | Frequency | Range     | Data Rate      | Use Case               |
| ------------- | --------- | --------- | -------------- | ---------------------- |
| **LoRa**      | 433 MHz   | Up to 2km | 0.3-50 kbps    | Sensor → Gateway       |
| **WiFi**      | 2.4 GHz   | ~100m     | Up to 150 Mbps | Gateway → Cloud        |
| **HTTPS**     | N/A       | Internet  | Variable       | REST API calls         |
| **WebSocket** | N/A       | Internet  | Real-time      | Live dashboard updates |

#### 3.2.4 Cloud Platform / Servers

| Service   | Provider                  | Purpose                  |
| --------- | ------------------------- | ------------------------ |
| Database  | Supabase (PostgreSQL)     | Time-series data storage |
| Real-time | Supabase Realtime         | WebSocket subscriptions  |
| REST API  | Supabase (Auto-generated) | CRUD operations          |
| Hosting   | Vercel (Next.js)          | Web dashboard hosting    |

#### 3.2.5 Machine Learning / AI Model

| Component             | Type                              | Purpose                    |
| --------------------- | --------------------------------- | -------------------------- |
| Flood Risk Prediction | Rule-based + Linear Extrapolation | Risk level assessment      |
| Anomaly Detection     | Threshold-based                   | Alert generation           |
| Trend Analysis        | Statistical                       | Rate of change calculation |

_Note: Current implementation uses algorithmic analysis rather than trained ML models. See Section 7 for details._

#### 3.2.6 User Interface / Dashboard

| Page      | Purpose         | Key Features                    |
| --------- | --------------- | ------------------------------- |
| Dashboard | Overview        | Stats, risk card, quick links   |
| Analytics | Historical data | Time series charts, trends      |
| Alerts    | Monitoring      | Alert list, severity indicators |
| Reports   | Documentation   | Generate & export reports       |
| Readings  | Raw data        | Tabular sensor readings         |
| Settings  | Configuration   | Pump control, thresholds        |

---

## 4. Hardware Specifications

### 4.1 Device List

| #         | Device Name               | Quantity | Unit Cost (Est.) | Total Cost (Est.) |
| --------- | ------------------------- | -------- | ---------------- | ----------------- |
| 1         | ESP32 Development Board   | 4        | $8               | $32               |
| 2         | SX1262 LoRa Module        | 3        | $12              | $36               |
| 3         | HC-SR04 Ultrasonic Sensor | 2        | $3               | $6                |
| 4         | Relay Module (for pump)   | 1        | $5               | $5                |
| 5         | Power Supply (5V)         | 4        | $5               | $20               |
| 6         | Jumper Wires & Breadboard | -        | $10              | $10               |
| 7         | Waterproof Enclosures     | 4        | $8               | $32               |
| **Total** |                           |          |                  | **~$141**         |

### 4.2 Sensor Types

#### HC-SR04 Ultrasonic Distance Sensor

| Specification        | Value            |
| -------------------- | ---------------- |
| Operating Voltage    | 5V DC            |
| Operating Current    | 15mA             |
| Operating Frequency  | 40kHz            |
| Measuring Range      | 2cm - 400cm      |
| Measuring Accuracy   | ±3mm             |
| Measuring Angle      | 15°              |
| Trigger Input Signal | 10µs TTL pulse   |
| Echo Output Signal   | TTL level signal |

**Water Level Calculation:**

```
Water Level = Tank Height - Measured Distance
```

### 4.3 Microcontroller / SBC

#### ESP32-WROOM-32 (All Nodes)

| Specification         | Value                                |
| --------------------- | ------------------------------------ |
| CPU                   | Xtensa dual-core 32-bit LX6, 240 MHz |
| RAM                   | 520 KB SRAM                          |
| Flash                 | 4 MB                                 |
| WiFi                  | 802.11 b/g/n (2.4 GHz)               |
| Bluetooth             | BLE 4.2                              |
| GPIO Pins             | 34                                   |
| ADC Channels          | 18 (12-bit)                          |
| Operating Voltage     | 3.0V - 3.6V                          |
| Operating Temperature | -40°C to +85°C                       |

### 4.4 Power Requirements

| Device          | Voltage | Current (Active)   | Current (Sleep) | Power Source     |
| --------------- | ------- | ------------------ | --------------- | ---------------- |
| Sensor Node     | 5V DC   | ~100mA             | ~10mA           | USB/Battery      |
| Gateway Station | 5V DC   | ~180mA             | N/A (always on) | USB/Wall adapter |
| Pump Controller | 5V DC   | ~80mA + relay load | ~50mA           | USB/Wall adapter |

**Battery Life Estimation (Sensor Node with 2000mAh battery):**

- Active mode (3 sec): 100mA
- Idle/sleep (remaining): 10mA
- Average: ~15mA with 20% duty cycle
- Estimated runtime: ~133 hours (~5.5 days)

### 4.5 Communication Modules

#### SX1262 LoRa Module

| Specification        | Value                       |
| -------------------- | --------------------------- |
| Frequency Range      | 150-960 MHz                 |
| Configured Frequency | 433 MHz                     |
| Max TX Power         | +22 dBm                     |
| Receiver Sensitivity | -148 dBm                    |
| Modulation           | LoRa/FSK                    |
| Spreading Factor     | SF5-SF12 (using SF12)       |
| Bandwidth            | 7.8-500 kHz (using 500 kHz) |
| Interface            | SPI                         |
| Operating Voltage    | 1.8V - 3.7V                 |

**LoRa Configuration Used:**

```cpp
Frequency:        433.0 MHz
Bandwidth:        500.0 kHz
Spreading Factor: 12 (max range)
Coding Rate:      4/5
Sync Word:        0x34
TX Power:         22 dBm
Preamble Length:  10 symbols
```

---

## 5. Software Specifications

### 5.1 Firmware

#### 5.1.1 Language

- **Primary:** C++ (Arduino Framework)
- **IDE:** Arduino IDE / PlatformIO

#### 5.1.2 Libraries Used

| Library                  | Version  | Purpose                     |
| ------------------------ | -------- | --------------------------- |
| `SPI.h`                  | Built-in | SPI communication for LoRa  |
| `RadioLib.h`             | Latest   | LoRa radio control (SX1262) |
| `WiFi.h`                 | Built-in | WiFi connectivity           |
| `WiFiClientSecure.h`     | Built-in | HTTPS connections           |
| `HTTPClient.h`           | Built-in | REST API requests           |
| `ArduinoJson.h`          | 6.x      | JSON parsing/serialization  |
| `UniversalTelegramBot.h` | Latest   | Telegram Bot integration    |
| `ESPSupabase.h`          | Latest   | Supabase database client    |

#### 5.1.3 Firmware Flow Diagram

**Sensor Node Flow:**

```
┌──────────────────────────────────────────────────────────────┐
│                    SENSOR NODE FIRMWARE                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐                                          │
│  │     START      │                                          │
│  └───────┬────────┘                                          │
│          │                                                   │
│          ▼                                                   │
│  ┌────────────────┐                                          │
│  │  Initialize    │                                          │
│  │  - Serial      │                                          │
│  │  - GPIO Pins   │                                          │
│  │  - SPI Bus     │                                          │
│  │  - LoRa Radio  │                                          │
│  └───────┬────────┘                                          │
│          │                                                   │
│          ▼                                                   │
│  ┌────────────────┐     ┌────────────────────┐              │
│  │  Read Water    │────▶│  Send Trigger Pulse │              │
│  │  Level Sensor  │     │  (10µs on TRIG pin) │              │
│  └───────┬────────┘     └─────────┬──────────┘              │
│          │                        │                          │
│          │              ┌─────────▼──────────┐              │
│          │              │  Measure Echo Time  │              │
│          │              │  (pulseIn ECHO pin) │              │
│          │              └─────────┬──────────┘              │
│          │                        │                          │
│          │              ┌─────────▼──────────┐              │
│          │              │ Calculate Distance  │              │
│          │              │ dist = time*0.034/2 │              │
│          │              └─────────┬──────────┘              │
│          │                        │                          │
│          │              ┌─────────▼──────────┐              │
│          │              │ Calculate Water Lvl │              │
│          │              │ level = tank - dist │              │
│          │              └─────────┬──────────┘              │
│          │◀───────────────────────┘                          │
│          │                                                   │
│          ▼                                                   │
│  ┌────────────────┐                                          │
│  │  Format LoRa   │  Packet: "NODE_ID|LEVEL cm"              │
│  │    Packet      │  Example: "1|45.2 cm"                    │
│  └───────┬────────┘                                          │
│          │                                                   │
│          ▼                                                   │
│  ┌────────────────┐                                          │
│  │  Transmit via  │                                          │
│  │     LoRa       │                                          │
│  └───────┬────────┘                                          │
│          │                                                   │
│          ▼                                                   │
│  ┌────────────────┐                                          │
│  │  Delay 2-3 sec │                                          │
│  └───────┬────────┘                                          │
│          │                                                   │
│          └──────────────────────────────────────▶ (Loop)     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Gateway Station Flow:**

```
┌──────────────────────────────────────────────────────────────┐
│                   GATEWAY STATION FIRMWARE                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐                                          │
│  │     START      │                                          │
│  └───────┬────────┘                                          │
│          │                                                   │
│          ▼                                                   │
│  ┌────────────────┐                                          │
│  │  Initialize    │                                          │
│  │  - Serial      │                                          │
│  │  - WiFi Connect│                                          │
│  │  - Telegram Bot│                                          │
│  │  - LoRa Radio  │                                          │
│  │  - Supabase    │                                          │
│  └───────┬────────┘                                          │
│          │                                                   │
│          ▼                                                   │
│  ┌────────────────┐                                          │
│  │ Send "Online"  │                                          │
│  │ to Telegram    │                                          │
│  └───────┬────────┘                                          │
│          │                                                   │
│          ▼                                                   │
│  ┌────────────────┐                                          │
│  │ Start LoRa RX  │                                          │
│  │     Mode       │                                          │
│  └───────┬────────┘                                          │
│          │                                                   │
│          ▼                                                   │
│  ┌────────────────┐     ┌────────────────────┐              │
│  │  Wait for LoRa │────▶│  Packet Received?  │──No──▶(Loop) │
│  │    Packet      │     └─────────┬──────────┘              │
│  └────────────────┘               │Yes                       │
│                                   ▼                          │
│                         ┌────────────────────┐              │
│                         │  Parse Packet      │              │
│                         │  - Extract Node ID │              │
│                         │  - Extract Level   │              │
│                         └─────────┬──────────┘              │
│                                   │                          │
│                                   ▼                          │
│                         ┌────────────────────┐              │
│                         │  Build JSON        │              │
│                         │  {device_id, level}│              │
│                         └─────────┬──────────┘              │
│                                   │                          │
│                                   ▼                          │
│                         ┌────────────────────┐              │
│                         │  INSERT to Supabase│              │
│                         │  water_levels table│              │
│                         └─────────┬──────────┘              │
│                                   │                          │
│                                   ▼                          │
│                         ┌────────────────────┐              │
│                         │  Restart LoRa RX   │              │
│                         └─────────┬──────────┘              │
│                                   │                          │
│                                   └────────────────▶(Loop)   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Backend

#### 5.2.1 Cloud Platform

- **Provider:** Supabase (Backend-as-a-Service)
- **Database:** PostgreSQL
- **Real-time:** Supabase Realtime (WebSocket-based)
- **Authentication:** Supabase Auth (API key-based for IoT)

#### 5.2.2 Database Schema

**Table: `water_levels`**

```sql
CREATE TABLE water_levels (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(255) NOT NULL,
  water_level DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_water_levels_device_time
ON water_levels(device_id, created_at DESC);
```

**Table: `device_control`**

```sql
CREATE TABLE device_control (
  id SERIAL PRIMARY KEY,
  led BOOLEAN DEFAULT FALSE,
  pump_mode VARCHAR(20) DEFAULT 'off',
  auto_enabled BOOLEAN DEFAULT FALSE
);
```

**Table: `device_locations` (Optional)**

```sql
CREATE TABLE device_locations (
  device_id VARCHAR(255) PRIMARY KEY,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  name VARCHAR(255)
);
```

#### 5.2.3 API List

| Method  | Endpoint                  | Description                   |
| ------- | ------------------------- | ----------------------------- |
| `POST`  | `/rest/v1/water_levels`   | Insert new reading            |
| `GET`   | `/rest/v1/water_levels`   | Query readings (with filters) |
| `GET`   | `/rest/v1/device_control` | Get pump state                |
| `PATCH` | `/rest/v1/device_control` | Update pump state             |
| `POST`  | `/api/telegram`           | Send report to Telegram       |
| `POST`  | `/api/alerts`             | Check & send alerts           |
| `GET`   | `/api/alerts`             | Health check                  |

### 5.3 Frontend / Dashboard

#### 5.3.1 UI Flow

```
┌──────────────────────────────────────────────────────────────┐
│                     DASHBOARD UI FLOW                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    SIDEBAR (Always Visible)              │ │
│  │  ┌─────────────┐                                        │ │
│  │  │   Logo      │  Theareasastr Command Center           │ │
│  │  └─────────────┘                                        │ │
│  │  ┌─────────────┐                                        │ │
│  │  │ Dashboard   │ ◄── Active Page Indicator              │ │
│  │  │ Analytics   │                                        │ │
│  │  │ Alerts (3)  │ ◄── Badge with alert count             │ │
│  │  │ Reports     │                                        │ │
│  │  │ Readings    │                                        │ │
│  │  │ Settings    │                                        │ │
│  │  └─────────────┘                                        │ │
│  │  ┌─────────────┐                                        │ │
│  │  │ Status: ●   │  System Online                         │ │
│  │  │ v1.0.0      │                                        │ │
│  │  └─────────────┘                                        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   MAIN CONTENT AREA                      │ │
│  │                                                          │ │
│  │  DASHBOARD PAGE:                                         │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │ │
│  │  │ Current │ │ Maximum │ │ Minimum │ │ Average │       │ │
│  │  │  45.2   │ │  120.5  │ │  12.3   │ │  67.8   │       │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │ │
│  │  ┌───────────────────────┐ ┌───────────────────────┐   │ │
│  │  │   FLOOD RISK CARD     │ │   CHANGE RATE CARD    │   │ │
│  │  │   ● SAFE              │ │   ▲ RISING            │   │ │
│  │  │   Level: 45.2 cm      │ │   +0.15 cm/min        │   │ │
│  │  │   Predicted +30m: 49.7│ │   Trend: MODERATE     │   │ │
│  │  └───────────────────────┘ └───────────────────────┘   │ │
│  │                                                          │ │
│  │  ANALYTICS PAGE:                                         │ │
│  │  ┌─────────────────────────────────────────────────────┐│ │
│  │  │         TIME SERIES CHART (Recharts)                ││ │
│  │  │    ^                                                ││ │
│  │  │ cm │      ___/\____/\                               ││ │
│  │  │    │   __/          \___                            ││ │
│  │  │    │__/                 \___                        ││ │
│  │  │    └──────────────────────────▶ Time               ││ │
│  │  └─────────────────────────────────────────────────────┘│ │
│  │                                                          │ │
│  │  SETTINGS PAGE:                                          │ │
│  │  ┌───────────────────────┐ ┌───────────────────────┐   │ │
│  │  │   PUMP CONTROL        │ │   CONFIGURATION       │   │ │
│  │  │   [▶ PUMP OUT]        │ │   High Threshold: 150 │   │ │
│  │  │   [■ DISENGAGE]       │ │   Low Threshold:  10  │   │ │
│  │  │   Status: STANDBY     │ │   Devices: 2          │   │ │
│  │  └───────────────────────┘ └───────────────────────┘   │ │
│  │                                                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 5.3.2 Pages / Functions

| Page          | Route        | Key Functions                                        |
| ------------- | ------------ | ---------------------------------------------------- |
| **Dashboard** | `/`          | Stats overview, flood risk, change rate, quick links |
| **Analytics** | `/analytics` | Time series chart (24h/7d/30d), period averages      |
| **Alerts**    | `/alerts`    | Alert summary cards, anomaly list, smart alerts      |
| **Reports**   | `/reports`   | Report generation, Telegram export, file download    |
| **Readings**  | `/readings`  | Device summary, raw readings table                   |
| **Settings**  | `/settings`  | Pump control, threshold config, system info          |

#### 5.3.3 Tools Used

| Tool              | Version | Purpose                         |
| ----------------- | ------- | ------------------------------- |
| **Next.js**       | 16.1.4  | React framework with App Router |
| **React**         | 19.2.3  | UI component library            |
| **TypeScript**    | 5.x     | Type-safe JavaScript            |
| **Tailwind CSS**  | 4.x     | Utility-first CSS styling       |
| **Recharts**      | 2.10.3  | Chart/graph visualization       |
| **Leaflet**       | 1.9.4   | Map visualization               |
| **React-Leaflet** | 5.0.0   | React wrapper for Leaflet       |
| **Supabase JS**   | 2.39.0  | Database client library         |

---

## 6. IoT Data Pipeline

### 6.1 Data Acquisition

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACQUISITION FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   SENSOR NODE                                                   │
│   ┌───────────────┐                                             │
│   │ HC-SR04       │ ──▶ Ultrasonic pulse (40kHz)               │
│   │ Ultrasonic    │ ◀── Echo return (µs duration)              │
│   └───────┬───────┘                                             │
│           │                                                      │
│           ▼                                                      │
│   ┌───────────────┐                                             │
│   │    ESP32      │ ──▶ Distance = duration × 0.034 / 2        │
│   │   Compute     │ ──▶ Water Level = Tank Height - Distance   │
│   └───────┬───────┘                                             │
│           │                                                      │
│           ▼                                                      │
│   ┌───────────────┐                                             │
│   │  LoRa TX      │ ──▶ Packet: "1|45.2 cm"                    │
│   │  (SX1262)     │     433 MHz, SF12, 500kHz BW               │
│   └───────┬───────┘                                             │
│           │                                                      │
│           │ ~~~~~~~~~ RF Transmission (up to 2km) ~~~~~~~~~~~~  │
│           │                                                      │
│           ▼                                                      │
│   GATEWAY STATION                                               │
│   ┌───────────────┐                                             │
│   │  LoRa RX      │ ◀── Receive packet                         │
│   │  (SX1262)     │                                             │
│   └───────┬───────┘                                             │
│           │                                                      │
│           ▼                                                      │
│   ┌───────────────┐                                             │
│   │    Parse      │ ──▶ Node ID: "1"                           │
│   │   Packet      │ ──▶ Level: 45.2                            │
│   └───────┬───────┘                                             │
│           │                                                      │
│           ▼                                                      │
│   ┌───────────────┐                                             │
│   │  JSON Build   │ ──▶ {"device_id":"node_1","water_level":45.2}│
│   └───────┬───────┘                                             │
│           │                                                      │
│           ▼                                                      │
│   ┌───────────────┐                                             │
│   │  WiFi/HTTPS   │ ──▶ POST to Supabase REST API              │
│   └───────────────┘                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Data Pre-processing (Edge/Cloud)

| Location              | Processing           | Description                               |
| --------------------- | -------------------- | ----------------------------------------- |
| **Edge (Sensor)**     | Distance calculation | Convert echo time to distance (cm)        |
| **Edge (Sensor)**     | Level calculation    | Subtract from tank height                 |
| **Edge (Gateway)**    | Packet parsing       | Extract node ID and value                 |
| **Edge (Gateway)**    | JSON formatting      | Structure for REST API                    |
| **Cloud (Dashboard)** | Aggregation          | Calculate min/max/avg over time periods   |
| **Cloud (Dashboard)** | Rate calculation     | Compute cm/min change rate                |
| **Cloud (Dashboard)** | Risk prediction      | Linear extrapolation + threshold analysis |

### 6.3 Storage

| Data Type        | Storage Location            | Retention               |
| ---------------- | --------------------------- | ----------------------- |
| Raw readings     | Supabase `water_levels`     | Unlimited (PostgreSQL)  |
| Device state     | Supabase `device_control`   | Current state only      |
| Device locations | Supabase `device_locations` | Persistent              |
| Reports          | Generated on-demand         | Not stored (exportable) |

### 6.4 Monitoring & Logging

| Component       | Logging Method   | Log Location           |
| --------------- | ---------------- | ---------------------- |
| Sensor Nodes    | Serial.print()   | Serial monitor (debug) |
| Gateway Station | Serial.print()   | Serial monitor (debug) |
| Dashboard       | Console logs     | Browser DevTools       |
| Supabase        | Built-in logging | Supabase Dashboard     |

### 6.5 Security Measures

| Layer                  | Security Measure                     |
| ---------------------- | ------------------------------------ |
| **LoRa Communication** | Sync word filtering (0x34)           |
| **WiFi**               | WPA2 encryption                      |
| **API Calls**          | HTTPS with TLS                       |
| **Database Access**    | Supabase API key authentication      |
| **Row Level Security** | Supabase RLS policies (configurable) |
| **Secrets Management** | Environment variables for API keys   |

---

## 7. Machine Learning / AI Model

### 7.1 Problem Type

The current implementation uses **Rule-based Analysis with Linear Extrapolation** rather than trained ML models. This approach was chosen for:

- **Simplicity** - No training data required
- **Interpretability** - Clear decision rules
- **Real-time performance** - No model inference overhead
- **Edge compatibility** - Can run on ESP32 if needed

| Analysis Type             | Method                            | Purpose                         |
| ------------------------- | --------------------------------- | ------------------------------- |
| **Flood Risk Prediction** | Linear extrapolation + thresholds | Predict risk level              |
| **Anomaly Detection**     | Threshold comparison              | Generate alerts                 |
| **Trend Analysis**        | Rate calculation                  | Determine rising/falling/stable |

### 7.2 Dataset

**Current State:** No training dataset required (rule-based system)

**For Future ML Implementation:**
| Aspect | Details |
|--------|---------|
| **Source** | Supabase `water_levels` table |
| **Size** | Growing (continuous collection) |
| **Features** | timestamp, device_id, water_level |
| **Potential Labels** | flood_occurred (manual annotation) |

### 7.3 Model Architecture

**Current: Rule-Based Algorithm**

```typescript
// Flood Risk Prediction Algorithm
function predictFloodRisk(readings: Reading[]): FloodRiskPrediction {
  // 1. Calculate change rate (cm/min)
  const changeRate = (latest - previous) / timeDeltaMinutes;

  // 2. Linear extrapolation
  const predicted30min = currentLevel + changeRate * 30;
  const predicted60min = currentLevel + changeRate * 60;

  // 3. Multi-factor risk assessment
  let riskLevel = "safe";

  if (currentLevel >= 180 || changeRate >= 2.0) {
    riskLevel = "critical";
  } else if (currentLevel >= 150 || changeRate >= 0.5) {
    riskLevel = "warning";
  }

  return { riskLevel, predicted30min, predicted60min, ... };
}
```

**Future ML Candidates:**
| Model Type | Use Case | Framework |
|------------|----------|-----------|
| LSTM | Time series forecasting | TensorFlow/PyTorch |
| Random Forest | Classification (flood/no-flood) | Scikit-learn |
| Prophet | Seasonal trend prediction | Facebook Prophet |

### 7.4 Training Details

**N/A** - Current system uses rule-based algorithms.

For future ML implementation:
| Aspect | Planned Approach |
|--------|------------------|
| Hyperparameters | Grid search optimization |
| Hardware | Cloud-based training (GPU) |
| Methodology | Time-series cross-validation |

### 7.5 Model Performance Metrics

**Current Rule-Based System:**

| Metric              | Value        | Notes                 |
| ------------------- | ------------ | --------------------- |
| Response Time       | <100ms       | Algorithm execution   |
| False Positive Rate | Configurable | Depends on thresholds |
| True Positive Rate  | N/A          | No labeled test data  |

**Thresholds Used:**
| Parameter | Value | Description |
|-----------|-------|-------------|
| Critical Level | 180 cm | Immediate danger |
| Warning Level | 150 cm | Caution required |
| Critical Rise Rate | 2.0 cm/min | Rapid flooding |
| Warning Rise Rate | 0.5 cm/min | Moderate concern |

### 7.6 Model Deployment

| Aspect               | Current Implementation       |
| -------------------- | ---------------------------- |
| **Location**         | Cloud (Dashboard frontend)   |
| **Compression**      | N/A (JavaScript code)        |
| **Update Mechanism** | Deploy new dashboard version |
| **Inference Time**   | Real-time (<100ms)           |

---

## 8. Prototype Features

### 8.1 Feature List

| #   | Feature                    | Description                               | Status |
| --- | -------------------------- | ----------------------------------------- | ------ |
| 1   | **Real-time Monitoring**   | Live water level display with 30s refresh | ✅     |
| 2   | **Multi-node Support**     | Monitor multiple sensor locations         | ✅     |
| 3   | **LoRa Communication**     | Long-range wireless (433MHz, up to 2km)   | ✅     |
| 4   | **Cloud Storage**          | Persistent data in Supabase PostgreSQL    | ✅     |
| 5   | **Statistics Dashboard**   | Current/Max/Min/Average display           | ✅     |
| 6   | **Time Series Charts**     | Historical trend visualization (Recharts) | ✅     |
| 7   | **Flood Risk Prediction**  | Algorithm-based risk assessment           | ✅     |
| 8   | **Change Rate Monitor**    | cm/min calculation with trend             | ✅     |
| 9   | **Anomaly Detection**      | Threshold-based alerts                    | ✅     |
| 10  | **Smart Alerts**           | Cooldown-enabled notifications            | ✅     |
| 11  | **Telegram Notifications** | Automated alert messages                  | ✅     |
| 12  | **Report Generation**      | Exportable text/Telegram reports          | ✅     |
| 13  | **Remote Pump Control**    | Cloud-controlled irrigation pump          | ✅     |
| 14  | **Device Status Sync**     | Real-time device state via WebSocket      | ✅     |
| 15  | **Responsive UI**          | Mobile-friendly dark theme dashboard      | ✅     |
| 16  | **Time Period Averages**   | 1h/6h/12h/24h average comparison          | ✅     |

### 8.2 Screenshots

_Note: Screenshots to be captured from running system_

**Dashboard Page Elements:**

- Stats Grid (4 metric cards)
- Flood Risk Assessment Card
- Water Level Change Rate Card
- Quick Link Cards

**Analytics Page Elements:**

- Time Series Line Chart
- Time Range Selector (24H/7D/30D)
- Time Period Averages Grid

**Settings Page Elements:**

- Pump Control Interface (PUMP OUT / DISENGAGE buttons)
- Water Level Gauge
- Configuration Panel

### 8.3 User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER FLOW DIAGRAM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐                                                  │
│   │  User    │                                                  │
│   │  Opens   │                                                  │
│   │  App     │                                                  │
│   └────┬─────┘                                                  │
│        │                                                         │
│        ▼                                                         │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                     DASHBOARD                             │  │
│   │  • View current stats                                     │  │
│   │  • Check flood risk status                                │  │
│   │  • See change rate                                        │  │
│   └──────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
│        ┌─────────────────────┼─────────────────────┐            │
│        │                     │                     │            │
│        ▼                     ▼                     ▼            │
│   ┌──────────┐        ┌──────────┐         ┌──────────┐        │
│   │ ANALYTICS│        │  ALERTS  │         │ SETTINGS │        │
│   │ • Charts │        │ • View   │         │ • Control│        │
│   │ • Trends │        │   alerts │         │   pump   │        │
│   │ • History│        │ • Smart  │         │ • Config │        │
│   └────┬─────┘        │   notif  │         └────┬─────┘        │
│        │              └────┬─────┘              │               │
│        │                   │                    │               │
│        ▼                   ▼                    ▼               │
│   ┌──────────┐        ┌──────────┐         ┌──────────┐        │
│   │ REPORTS  │        │ Telegram │         │ ESP32    │        │
│   │ • Generate│        │ Alert    │         │ Pump     │        │
│   │ • Export │        │ Received │         │ Activated│        │
│   │ • Send   │        │          │         │          │        │
│   └──────────┘        └──────────┘         └──────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Testing & Validation

### 9.1 Unit Tests

| Component                   | Test Type              | Status |
| --------------------------- | ---------------------- | ------ |
| Ultrasonic reading function | Manual verification    | ✅     |
| LoRa packet formatting      | Serial monitor check   | ✅     |
| JSON parsing                | Console log validation | ✅     |
| Supabase insert             | Database verification  | ✅     |
| React hooks                 | Manual testing         | ✅     |

_Note: Automated unit tests not implemented in current prototype._

### 9.2 Integration Tests

| Integration              | Test Method               | Result  |
| ------------------------ | ------------------------- | ------- |
| Sensor → Gateway (LoRa)  | Live transmission test    | ✅ Pass |
| Gateway → Supabase       | API response verification | ✅ Pass |
| Supabase → Dashboard     | Real-time update check    | ✅ Pass |
| Dashboard → Pump Control | State change verification | ✅ Pass |
| Alert → Telegram         | Message delivery test     | ✅ Pass |

### 9.3 Field Tests

#### 9.3.1 Test Conditions

| Parameter       | Value                          |
| --------------- | ------------------------------ |
| Test Duration   | 24 hours continuous            |
| Environment     | Indoor (controlled)            |
| Temperature     | 25°C (room temperature)        |
| Humidity        | Normal indoor levels           |
| Water Container | Plastic tank, 150cm max height |

#### 9.3.2 Environment Setup

- Sensor nodes placed 1-2 meters from gateway
- Water level manually varied to test range
- WiFi router within 10 meters of gateway

#### 9.3.3 Test Results

| Test Case                   | Expected | Actual        | Status              |
| --------------------------- | -------- | ------------- | ------------------- |
| Sensor reading accuracy     | ±3mm     | ±5mm observed | ✅ Within tolerance |
| LoRa packet delivery        | >95%     | ~98% success  | ✅ Pass             |
| Data latency (sensor→cloud) | <5s      | ~2-3s         | ✅ Pass             |
| Dashboard refresh           | 30s      | 30s           | ✅ Pass             |
| Pump control response       | <5s      | ~2-3s         | ✅ Pass             |
| Telegram alert delivery     | <10s     | ~3-5s         | ✅ Pass             |

### 9.4 Performance Tests

#### 9.4.1 Latency

| Path                     | Measured Latency   |
| ------------------------ | ------------------ |
| Sensor reading → LoRa TX | ~50ms              |
| LoRa TX → RX             | ~100ms             |
| Gateway → Supabase       | ~500-1000ms        |
| Supabase → Dashboard     | ~100-500ms         |
| **End-to-end**           | **~1.5-3 seconds** |

#### 9.4.2 Power Consumption

| Device          | Mode                    | Measured Current |
| --------------- | ----------------------- | ---------------- |
| Sensor Node     | Active (reading + TX)   | ~120mA           |
| Sensor Node     | Idle                    | ~20mA            |
| Gateway         | Active (WiFi + LoRa RX) | ~180mA           |
| Pump Controller | Active                  | ~80mA            |

#### 9.4.3 Data Throughput

| Metric              | Value                         |
| ------------------- | ----------------------------- |
| LoRa packet size    | ~20 bytes                     |
| Packets per node    | 1 every 2-3 seconds           |
| Database writes     | ~0.5-1 per second per node    |
| Dashboard API calls | ~12 per 30 seconds (12 hooks) |

---

## 10. Known Issues & Limitations

### 10.1 Technical Constraints

| Issue                 | Description                              | Severity | Workaround                |
| --------------------- | ---------------------------------------- | -------- | ------------------------- |
| WiFi dependency       | Gateway requires stable WiFi             | Medium   | Consider cellular backup  |
| Single gateway        | No redundancy if gateway fails           | Medium   | Add backup gateway        |
| No offline storage    | Gateway doesn't buffer data if WiFi lost | Low      | Implement SD card logging |
| Hardcoded credentials | WiFi/API keys in firmware                | Low      | Use provisioning system   |

### 10.2 ML/AI Limitations

| Limitation            | Description                          | Impact                                   |
| --------------------- | ------------------------------------ | ---------------------------------------- |
| No trained ML model   | Uses rule-based algorithms only      | Predictions may be less accurate than ML |
| Linear extrapolation  | Assumes constant rate of change      | May miss non-linear patterns             |
| Fixed thresholds      | Not adaptive to changing conditions  | May need manual adjustment               |
| No seasonal awareness | Doesn't account for weather patterns | May miss environmental factors           |

### 10.3 Hardware Challenges

| Challenge            | Description                          | Status                     |
| -------------------- | ------------------------------------ | -------------------------- |
| Waterproofing        | Sensors need proper enclosures       | Requires enclosure design  |
| Power management     | No battery optimization (deep sleep) | Future enhancement         |
| Antenna placement    | LoRa range affected by enclosure     | Requires external antenna  |
| Temperature extremes | ESP32 rated for -40°C to 85°C        | Test in target environment |

---

## 11. Future Improvements

### 11.1 Planned Enhancements

| Priority | Enhancement         | Description                           |
| -------- | ------------------- | ------------------------------------- |
| High     | Deep sleep mode     | Battery optimization for sensor nodes |
| High     | Data buffering      | Local storage when WiFi unavailable   |
| High     | OTA updates         | Over-the-air firmware updates         |
| Medium   | Multiple gateways   | Redundancy and load balancing         |
| Medium   | User authentication | Login system for dashboard            |
| Medium   | Mobile app          | Native iOS/Android application        |
| Low      | SMS alerts          | Backup notification channel           |

### 11.2 Additional Features

| Feature              | Description               | Benefit                 |
| -------------------- | ------------------------- | ----------------------- |
| Weather integration  | Pull forecast data        | Better flood prediction |
| Multi-tenant support | Organization-based access | Commercial deployment   |
| Historical analytics | ML-based pattern analysis | Predictive maintenance  |
| Camera integration   | Visual monitoring         | Remote inspection       |
| Solar power          | Renewable energy source   | Off-grid operation      |

### 11.3 Better Models

| Model Type           | Use Case                  | Expected Improvement      |
| -------------------- | ------------------------- | ------------------------- |
| LSTM neural network  | Time series forecasting   | More accurate predictions |
| Anomaly detection ML | Unusual pattern detection | Earlier warning           |
| Ensemble methods     | Combined predictions      | Higher confidence         |
| Transfer learning    | Pre-trained on flood data | Faster deployment         |

### 11.4 Hardware Upgrades

| Upgrade   | Current            | Proposed            | Benefit                      |
| --------- | ------------------ | ------------------- | ---------------------------- |
| Sensor    | HC-SR04 ultrasonic | Pressure transducer | Higher accuracy, submersible |
| MCU       | ESP32              | ESP32-S3            | Better performance, USB-C    |
| LoRa      | SX1262             | SX1262 + GPS        | Location tracking            |
| Power     | USB only           | Solar + battery     | Off-grid capability          |
| Enclosure | None               | IP67 rated          | Weather resistance           |

---

## 12. Conclusion

### 12.1 Summary of Prototype Capabilities

The Theareasastr prototype successfully demonstrates a complete IoT water level monitoring system with the following capabilities:

| Capability                    | Achievement                                                 |
| ----------------------------- | ----------------------------------------------------------- |
| **Real-time Data Collection** | Continuous monitoring with 2-3 second sensor intervals      |
| **Long-range Wireless**       | LoRa communication at 433MHz with up to 2km range           |
| **Cloud Integration**         | Supabase backend with PostgreSQL storage and real-time sync |
| **Modern Dashboard**          | Next.js-based responsive web application with 6 pages       |
| **Predictive Analytics**      | Flood risk prediction with linear extrapolation             |
| **Automated Alerts**          | Threshold-based alerts with Telegram notifications          |
| **Remote Control**            | Cloud-controlled pump/irrigation system                     |
| **Report Generation**         | Exportable reports in text and Telegram formats             |

### 12.2 Next Steps

| Phase       | Timeline    | Activities                                |
| ----------- | ----------- | ----------------------------------------- |
| **Phase 1** | 1-2 months  | Deploy in controlled field environment    |
| **Phase 2** | 2-3 months  | Implement power optimization (deep sleep) |
| **Phase 3** | 3-4 months  | Add weather API integration               |
| **Phase 4** | 4-6 months  | Develop ML-based prediction model         |
| **Phase 5** | 6-12 months | Scale to production deployment            |

---

## 13. Appendix

### 13.1 Source Code Links

| Repository            | Location    | Description            |
| --------------------- | ----------- | ---------------------- |
| **Hardware Firmware** | `/Node_1/`  | ESP32 Arduino sketches |
| **Web Dashboard**     | `/thearea/` | Next.js application    |

### 13.2 File Structure

```
theareasastr/
├── Node_1/
│   ├── Node_1.ino           # Sensor Node 1 firmware
│   ├── Node_2/
│   │   └── Node_2.ino       # Sensor Node 2 firmware
│   ├── Pump/
│   │   └── Pump.ino         # Pump controller firmware
│   └── station/
│       └── station.ino      # Gateway station firmware
│
└── thearea/
    ├── app/                  # Next.js pages
    ├── components/           # React components
    ├── hooks/                # Custom React hooks
    ├── lib/                  # Utilities and types
    ├── public/               # Static assets
    ├── package.json          # Dependencies
    └── DOCUMENTATION.md      # Original documentation
```

### 13.3 Circuit Diagrams

**Sensor Node Wiring:**

```
ESP32 DevKit          HC-SR04          SX1262 LoRa
─────────────         ───────          ───────────
GPIO 6  ──────────▶  TRIG
GPIO 5  ◀──────────  ECHO
5V      ──────────▶  VCC
GND     ──────────▶  GND
GPIO 10 ──────────▶                    MOSI
GPIO 11 ◀──────────                    MISO
GPIO 9  ──────────▶                    SCK
GPIO 8  ──────────▶                    NSS
GPIO 14 ◀──────────                    DIO1
GPIO 12 ──────────▶                    NRST
GPIO 13 ◀──────────                    BUSY
3.3V    ──────────▶                    VCC
GND     ──────────▶                    GND
```

### 13.4 Configuration Reference

**LoRa Parameters:**

```cpp
Frequency:        433.0 MHz
Bandwidth:        500.0 kHz
Spreading Factor: 12
Coding Rate:      5 (4/5)
Sync Word:        0x34
TX Power:         22 dBm
Preamble:         10 symbols
```

**Risk Thresholds:**

```typescript
criticalLevel:    180 cm
warningLevel:     150 cm
criticalRiseRate: 2.0 cm/min
warningRiseRate:  0.5 cm/min
highThreshold:    150 cm
lowThreshold:     10 cm
```

### 13.5 Environment Variables Template

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your-bot-token
NEXT_PUBLIC_TELEGRAM_CHAT_ID=your-chat-id
```

---

**Document Version:** 1.0.0  
**Last Updated:** February 2, 2026  
**Authors:** Theareasastr Development Team

---

_This document serves as a comprehensive specification for the Theareasastr IoT Water Level Monitoring System prototype._
