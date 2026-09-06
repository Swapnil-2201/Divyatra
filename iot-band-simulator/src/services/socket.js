/**
 * @file socket.js
 * @description Real-time WebSocket connection manager using Socket.IO client
 */

import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || (
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:5001`
    : 'http://localhost:5001'
);

let socket = null;

export const initSocket = (bandId = 'DV-BAND-0001', callbacks = {}) => {
  if (socket && socket.connected) {
    socket.emit('join_band', bandId);
    return socket;
  }

  socket = io(WS_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
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
    console.warn(`⚠️ [IoT Socket] Connection error (will auto-retry):`, error.message);
    callbacks.onConnectError?.(error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
