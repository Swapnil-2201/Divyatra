# DivYatra 🛕
### Intelligent Pilgrimage Management & Crowd Intelligence Platform

> **"Predict. Prevent. Protect."**  
> *Smart Pilgrimage, Peaceful Journey.*

DivYatra is a production-grade, full-stack web platform built for Gujarat's premier pilgrimage shrines:
- **Shree Somnath Jyotirlinga** (Veraval)
- **Shree Dwarkadhish Temple / Jagat Mandir** (Dwarka)
- **Shree Arasuri Ambaji Mata Temple** (Banaskantha)
- **Shree Mahakali Mata Temple** (Pavagadh Hill)

---

## 🔐 Demo Credentials (JWT Authentication)

The application includes built-in demo credentials for all three user roles:

| Role | Email | Password | Permissions |
|---|---|---|---|
| 👤 **Pilgrim / Devotee** | `pilgrim@divyatra.in` | `Pilgrim@123` | Book Darshan slots, order Mahaprasad, view live crowd, view Yatra plans, view verified passes. |
| 🛡️ **Temple Authority** | `authority@divyatra.in` | `Authority@123` | Access Command Center (`/admin`), monitor CCTV feeds, view active bookings, acknowledge & resolve corridor safety alerts. |
| 👑 **System Admin** | `admin@divyatra.in` | `Admin@123` | Full access across all 4 shrines, manage temples, manage user roles, broadcast system advisories. |

---

## 🌟 Key Features

### For Pilgrims / Devotees:
1. **Live Crowd Intelligence**: Real-time sanctum occupancy meters, queue speeds, and waiting time forecasts updating automatically.
2. **AI Yatra Itinerary Planner**: Multi-step wizard recommending optimal arrival windows to bypass peak congestion.
3. **Verified E-Darshan Pass Booking**: Contactless QR barcode pass generation for smart RFID turnstile scanning.
4. **Sacred Mahaprasad Store**: Order pure Desi Ghee Besan Ladoo, Mohanthal, and 56-Bhog for counter pickup or India Speed Post home delivery with dedicated shrine filters.
5. **Interactive 3D Premise Viewer**: Digital twin explorer with layer toggles for Garbhagriha, queue lines, prasad counters, and medical posts.
6. **Official Live Darshan & Aarti Schedules**: Direct connectivity with official temple trust broadcast channels.

### For Temple Authorities & Security (Command Center):
1. **Operations Matrix**: Live telemetry table tracking active devotee counts, queue delay, and system alert levels.
2. **Edge Computer Vision CCTV Monitor**: 64-camera simulated grid with AI bounding boxes, spatial motion vectoring, and headcount detection.
3. **AI Incident & Congestion Alerts**: Queue bottleneck warnings with instant *Acknowledge*, *Deploy Marshals*, and *Mark Resolved* actions.
4. **Predictive Big Data Analytics**: Recharts-powered footfall distribution, hourly throughput, and upcoming festival surge models.
5. **Emergency Response & SOS Command**: Real-time dispatching for rapid medical units and disaster management control.

---

## 🏗️ Tech Stack & Architecture

- **Frontend**: React 18, Vite, Vanilla CSS + Tailwind utility tokens, React Router v6, Lucide React, Recharts, QRCode.React, Canvas Confetti.
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose), JWT, BcryptJS, Morgan logger, CORS.
- **Resilience**: Automated In-Memory Fallback Mock Mode if `MONGODB_URI` is not supplied.

---

## 🚀 Quick Start & Development Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Environment Configuration
Inside `/server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI= # (Optional: Add your MongoDB Atlas connection string, or leave blank for local mock mode)
CLIENT_URL=http://localhost:5173
```

### 2. Start Backend Server
```bash
cd server
npm install
npm start
```
*Backend active on `http://localhost:5000`*

### 3. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
*Frontend active on `http://localhost:5173`*

---

## ⌚ IoT Smart Band Simulator (`iot-band-simulator/`)

DivYatra includes a completely separate, standalone **IoT Smart Band Simulator** that emulates a connected pilgrim wearable device:

- **Independent Application**: Located in `iot-band-simulator/`, deployable on its own URL (e.g. `https://divyatra-iot.vercel.app`), completely decoupled from the pilgrim application.
- **Hardware-Inspired Centerpiece**: Faithful reproduction of the slender Fitbit Inspire 3 / Luxe elongated vertical pill-capsule form factor, matte silicone loop, capacitive touch sensor, and vertical AMOLED watchface.
- **Real-Time Bidirectional Event Mesh**: Powered by **Socket.IO** rooms (`band_DV-BAND-0001` and `authority`), receiving `PASS_ISSUED` instantly upon booking confirmation.
- **Cold-Start Persistence**: If the simulator is opened minutes after booking, `GET /api/iot/band/:bandId/state` automatically restores the active pass, scannable QR, and telemetry history.
- **Telemetry & Safety**: Simulated vitals (Heart rate, stress, temperature with "SIMULATED" badge), GPS simulation (Somnath Temple, Gate 1), live crowd telemetry from backend API, and SOS emergency dispatch.

---

## 🚀 Quick Start & Running Locally

### Prerequisites
- Node.js (v18 or higher, v24 recommended)
- npm (v9 or higher)

### 1. One-Command Setup
To install all dependencies across server, client, and simulator:
```bash
npm run install:all
```

### 2. Run All 3 Services Concurrently
```bash
npm run dev:all
```
This launches:
- 🛕 **Express Backend + Socket.IO**: `http://localhost:5001`
- 📱 **DivYatra Pilgrim App**: `http://localhost:5173`
- ⌚ **IoT Smart Band Simulator**: `http://localhost:5174`

Or run them individually in separate terminals:
```bash
# Terminal 1: Backend Server
npm run server

# Terminal 2: DivYatra Pilgrim Web/App
npm run client

# Terminal 3: IoT Smart Band Simulator
npm run simulator
```

---

## ⚙️ Environment Variables Configuration

### Backend (`server/.env`)
```env
PORT=5001
HOST=127.0.0.1
NODE_ENV=development
# Optional: MongoDB connection string (falls back to in-memory store if omitted)
MONGODB_URI=
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)
```env
VITE_API_URL=/api
```

### IoT Simulator (`iot-band-simulator/.env`)
```env
VITE_API_URL=/api
VITE_WS_URL=http://localhost:5001
```

---

## 📡 Real-Time WebSocket Architecture

```
DivYatra App (Port 5173)
       ↓ (POST /api/payment/verify or /api/bookings)
Express Backend (Port 5001)
       ↓
MongoDB / In-Memory IoT Store
       ↓
Socket.IO Event Layer (band_DV-BAND-0001 & authority rooms)
       ↓
IoT Smart Band Simulator (Port 5174) & Authority Dashboard (/admin)
```

### How `PASS_ISSUED` Works:
1. Pilgrim books a Darshan pass and completes payment on DivYatra (`http://localhost:5173`).
2. Server creates/verifies booking and generates a cryptographic QR payload.
3. Server associates default demo band `DV-BAND-0001` and emits:
   ```json
   {
     "event": "PASS_ISSUED",
     "bandId": "DV-BAND-0001",
     "bookingId": "BK-SOM-8808",
     "templeId": "somnath",
     "templeName": "Shree Somnath Jyotirlinga",
     "date": "2026-10-12",
     "slot": "10:00 AM",
     "pilgrims": 2,
     "leadPilgrim": "Ramesh Patel",
     "qrPayload": "..."
   }
   ```
4. **DivYatra App Behavior**: The user stays on the booking confirmation page. The page displays `SMART BAND ● SYNCED (DV-BAND-0001)`. The app **never** auto-redirects or opens new windows.
5. **Simulator Behavior**:
   - If already open: receives `PASS_ISSUED` over Socket.IO immediately, vibrates with haptic feedback, displays `NEW DIVYATRA PASS` animation, and renders the scannable QR.
   - If opened later: `GET /api/iot/band/DV-BAND-0001/state` fetches the active pass on cold-start.
   - Devotee taps `ACKNOWLEDGE`: updates pass status to `PASS ACTIVE`.

---

## 🎬 Step-by-Step Feature Demo Flow

1. Open **DivYatra App** in browser: `http://localhost:5173`
2. Separately open **IoT Band Simulator**: `http://localhost:5174` (keep both in side-by-side browser windows).
3. On DivYatra: Navigate to **Book Darshan**, select **Shree Somnath**, choose a slot, and proceed to payment.
4. Click **Complete Payment & Confirm E-Pass**.
5. DivYatra remains on `/confirmation`, showing:
   - `PAYMENT SUCCESSFUL ✓`
   - `DIGITAL PASS GENERATED ✓`
   - `QR GENERATED ✓`
   - `SMART BAND ● SYNCED` (Band: `DV-BAND-0001`)
6. Notice the **IoT Band Simulator** simultaneously:
   - Vibrates with haptic notification.
   - Displays `NEW DIVYATRA PASS` banner.
   - Renders scannable high-contrast QR code.
   - Displays Temple, Date, Slot, and Pax info.
   - Action buttons `VIEW PASS` and `ACKNOWLEDGE`.
7. Click `ACKNOWLEDGE`: Status transitions to `PASS ACTIVE`.
8. Cycle wearable screens (using side groove or bottom dots) to view **Vitals Telemetry** (76 BPM), **Location & Gate 1 Crowd Status**, and **Alerts**.
9. In Simulator Demo Controls, click **Simulate Emergency**.
10. Open **Authority Dashboard** (`http://localhost:5173/admin`):
    - View **CONNECTED IOT BANDS** section.
    - Notice active SOS alert banner and device status updated to `ALERT`.

---

## 🧪 Build Validation

To build both web applications for production verification:
```bash
npm run build:all
```
Both `client` and `iot-band-simulator` build clean static bundles ready for Vercel deployment.

