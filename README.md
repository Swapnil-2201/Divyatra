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

## 🧪 Testing Backend REST Endpoints
To run the automated test suite verifying all 12 REST API routes:
```bash
cd server
node test-endpoints.js
```
