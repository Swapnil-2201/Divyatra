/**
 * @file socket.js
 * @description Real-time WebSocket connection manager using Socket.IO client
 */

import { io } from 'socket.io-client';
import { getGatewayUrl } from './iotApi';

const getWsUrl = () => {
  const envWs = import.meta.env.VITE_WS_URL;
  if (envWs && envWs.trim()) return envWs.trim();

  const gw = getGatewayUrl();
  if (gw && gw.startsWith('http')) {
    try {
      const parsed = new URL(gw);
      return parsed.origin;
    } catch (e) {}
  }

  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `${window.location.protocol}//${window.location.hostname}:5001`;
    }
    return window.location.origin;
  }
  return 'http://localhost:5001';
};

let socket = null;

export const initSocket = (bandId = 'DV-BAND-0001', callbacks = {}) => {
  if (socket && socket.connected) {
    socket.emit('join_band', bandId);
    return socket;
  }

  const wsTarget = getWsUrl();
  console.log(`🔌 [IoT Socket] Initializing connection to ${wsTarget}...`);

  socket = io(wsTarget, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 5000,
    timeout: 8000,
  });

  socket.on('connect', () => {
    console.log(`📡 [IoT Socket] Connected to DivYatra Central Mesh (${socket.id})`);
    socket.emit('join_band', bandId);
    callbacks.onConnect?.({ status: 'CONNECTED', socketId: socket.id });
  });

  socket.on('connected', (data) => {
    callbacks.onBandJoined?.(data);
  });

  socket.on('PASS_ISSUED', (passData) => {
    console.log(`🎫 [IoT Socket] PASS_ISSUED received in real-time:`, passData);
    callbacks.onPassIssued?.(passData);
  });

  socket.on('PASS_ACKNOWLEDGED', (ackData) => {
    callbacks.onPassAcknowledged?.(ackData);
  });

  socket.on('CROWD_ALERT', (alertData) => {
    console.log(`⚠ [IoT Socket] CROWD_ALERT received:`, alertData);
    callbacks.onCrowdAlert?.(alertData);
  });

  socket.on('HEALTH_ALERT', (healthData) => {
    console.log(`💓 [IoT Socket] HEALTH_ALERT received:`, healthData);
    callbacks.onHealthAlert?.(healthData);
  });

  socket.on('EMERGENCY_ALERT', (emgData) => {
    console.log(`🚨 [IoT Socket] EMERGENCY_ALERT received:`, emgData);
    callbacks.onEmergencyAlert?.(emgData);
  });

  socket.on('BAND_RESET', () => {
    console.log(`🔄 [IoT Socket] BAND_RESET received`);
    callbacks.onBandReset?.();
  });

  socket.on('disconnect', (reason) => {
    console.log(`🔌 [IoT Socket] Disconnected:`, reason);
    callbacks.onDisconnect?.(reason);
  });

  socket.on('connect_error', (error) => {
    callbacks.onConnectError?.(error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    try {
      socket.disconnect();
    } catch (e) {}
    socket = null;
  }
};
