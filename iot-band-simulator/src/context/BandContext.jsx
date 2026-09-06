import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { iotApi } from '../services/iotApi';
import { initSocket, disconnectSocket } from '../services/socket';

const BandContext = createContext(null);

const DEFAULT_BAND_ID = 'DV-BAND-0001';

export const BandProvider = ({ children }) => {
  const [bandId, setBandId] = useState(DEFAULT_BAND_ID);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTED');
  const [battery, setBattery] = useState(87);
  const [signalStrength, setSignalStrength] = useState('Strong');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Pass and pilgrim state
  const [currentPass, setCurrentPass] = useState(null);
  const [passStatus, setPassStatus] = useState('NO_PASS'); // 'NO_PASS' | 'PASS_ISSUED' | 'PASS_ACTIVE'
  const [isNewPassAlert, setIsNewPassAlert] = useState(false);
  const [currentPilgrim, setCurrentPilgrim] = useState('Ramesh Patel');
  const [currentTemple, setCurrentTemple] = useState('Shree Somnath Jyotirlinga');

  // Gateway Connection Info (Supports dynamic Vercel / Localhost / Custom routing)
  const [gatewayUrl, setGatewayUrlState] = useState(iotApi.getGatewayUrl());
  const [gatewayHealth, setGatewayHealth] = useState({ online: true, latencyMs: 24, lastChecked: new Date() });

  // Refs to avoid stale closures in polling intervals
  const currentPassRef = useRef(currentPass);
  const emergencyActiveRef = useRef(false);

  useEffect(() => {
    currentPassRef.current = currentPass;
  }, [currentPass]);

  // Simulated Telemetry (Fluctuates subtly over time - NOT medical data)
  const [telemetry, setTelemetry] = useState({
    heartRate: 76,
    stressLevel: 'Normal',
    temperature: 36.8,
  });

  // Simulated Location (GPS Simulation)
  const [location, setLocation] = useState({
    templeName: 'Somnath Temple',
    zone: 'Sanctum Courtyard',
    gate: 'Gate 1 Turnstile',
    coordinates: { lat: 20.888, lng: 70.401 },
  });

  // Live Crowd Telemetry from Backend
  const [crowdStatus, setCrowdStatus] = useState({
    exposure: '58%',
    crowdExposure: 'Moderate',
    wait: '34 minutes',
    waitMinutes: 34,
    status: 'Moderate',
  });

  // Notifications & Event Timeline
  const [notifications, setNotifications] = useState([]);
  const [events, setEvents] = useState([]);

  // Emergency Assistance Simulation State
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);

  useEffect(() => {
    emergencyActiveRef.current = emergencyActive;
  }, [emergencyActive]);

  // Active Screen inside the Smart Band: 'clock' | 'pass' | 'vitals' | 'crowd' | 'notifications' | 'sos'
  const [activeScreen, setActiveScreen] = useState('clock');
  const [selectedPassModal, setSelectedPassModal] = useState(null);
  const [hapticBuzz, setHapticBuzz] = useState(false);

  // Helper to trigger haptic vibration animation on band
  const triggerHaptic = useCallback(() => {
    setHapticBuzz(true);
    setTimeout(() => setHapticBuzz(false), 900);
  }, []);

  // Update Clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Telemetry Subtly Updates (Heart rate fluctuates between 74 - 78, temperature between 36.7 - 36.9)
  useEffect(() => {
    const vitalsTimer = setInterval(() => {
      if (emergencyActive) {
        setTelemetry((prev) => ({
          ...prev,
          heartRate: Math.floor(100 + Math.random() * 8),
          stressLevel: 'Elevated',
        }));
      } else {
        const delta = (Math.random() - 0.5) * 2;
        const hr = Math.min(80, Math.max(73, Math.round(76 + delta)));
        const temp = +(36.8 + (Math.random() - 0.5) * 0.2).toFixed(1);
        setTelemetry({
          heartRate: hr,
          stressLevel: hr > 78 ? 'Moderate' : 'Normal',
          temperature: temp,
        });
      }
    }, 4000);

    return () => clearInterval(vitalsTimer);
  }, [emergencyActive]);

  // Handle incoming PASS_ISSUED real-time event
  const handlePassIssued = useCallback((passPayload) => {
    console.log('⚡ Processing PASS_ISSUED event in BandContext:', passPayload);
    const normalizedPass = {
      bookingId: passPayload.bookingId || `BK-SOM-${Date.now().toString(36).toUpperCase()}`,
      templeId: passPayload.templeId || 'somnath',
      templeName: passPayload.templeName || 'Shree Somnath Jyotirlinga',
      date: passPayload.date || new Date().toISOString().split('T')[0],
      slot: passPayload.slot || passPayload.timeSlot || '10:00 AM',
      pilgrims: Number(passPayload.pilgrims || passPayload.pilgrimCount || 1),
      leadPilgrim: passPayload.leadPilgrim?.name || passPayload.leadPilgrim || 'Ramesh Patel',
      status: 'ISSUED',
      qrPayload: passPayload.qrPayload || passPayload.qrCodeData || JSON.stringify(passPayload),
      issuedAt: passPayload.timestamp || passPayload.issuedAt || new Date().toISOString(),
    };

    setCurrentPass(normalizedPass);
    setCurrentPilgrim(normalizedPass.leadPilgrim);
    setCurrentTemple(normalizedPass.templeName);
    setPassStatus('PASS_ISSUED');
    setIsNewPassAlert(true);
    setActiveScreen('pass');
    triggerHaptic();

    // Celebration Confetti on the Simulator
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E97820', '#D5A63A', '#102A56', '#10B981'],
      });
    } catch (e) {}

    // Add to notifications
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: 'PASS_ISSUED',
      title: '🔔 New Darshan Pass',
      message: `${normalizedPass.templeName.split(' ')[1] || normalizedPass.templeName} • ${normalizedPass.slot}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 14)]);

    // Add to events timeline
    const nowTime = new Date().toTimeString().split(' ')[0];
    const newEvents = [
      { id: `ev-${Date.now()}-1`, time: nowTime, event: 'Pass received', type: 'PASS', timestamp: new Date().toISOString() },
      { id: `ev-${Date.now()}-2`, time: nowTime, event: 'QR generated', type: 'QR', timestamp: new Date().toISOString() },
      { id: `ev-${Date.now()}-3`, time: nowTime, event: 'QR synced to band', type: 'SYSTEM', timestamp: new Date().toISOString() },
    ];
    setEvents((prev) => [...newEvents, ...prev]);
  }, [triggerHaptic]);

  // Sync state from Backend / Vercel Serverless API (Active Heartbeat Polling)
  const syncLatestState = useCallback(async () => {
    try {
      const state = await iotApi.getBandState(bandId);
      if (!state) return;

      setConnectionStatus(state.connectionStatus || 'CONNECTED');
      setBattery(state.battery || 87);
      setSignalStrength(state.signalStrength || 'Strong');

      const prevPassId = currentPassRef.current?.bookingId;
      const newPassId = state.currentPass?.bookingId;

      // Detect dynamically booked pass arrival
      if (newPassId && newPassId !== prevPassId) {
        handlePassIssued(state.currentPass);
      } else if (!newPassId && prevPassId) {
        // Band was reset remotely
        setCurrentPass(null);
        setPassStatus('NO_PASS');
        setIsNewPassAlert(false);
      } else if (state.currentPass) {
        // Update pass status (ACTIVE vs ISSUED)
        if (state.currentPass.status === 'ACTIVE' && passStatus !== 'PASS_ACTIVE') {
          setPassStatus('PASS_ACTIVE');
        }
      }

      if (state.crowdStatus) {
        setCrowdStatus(state.crowdStatus);
      }

      if (state.emergencyStatus) {
        if (state.emergencyStatus.active && !emergencyActiveRef.current) {
          setEmergencyActive(true);
          setEmergencyData(state.emergencyStatus);
          setActiveScreen('sos');
          triggerHaptic();
        } else if (!state.emergencyStatus.active && emergencyActiveRef.current) {
          setEmergencyActive(false);
          setEmergencyData(null);
        }
      }

      if (Array.isArray(state.latestNotifications) && state.latestNotifications.length > 0) {
        setNotifications(state.latestNotifications);
      }

      if (Array.isArray(state.events) && state.events.length > 0) {
        setEvents(state.events);
      }
    } catch (err) {
      console.warn('⚠️ [Heartbeat] Periodic state sync notice:', err.message);
    }
  }, [bandId, handlePassIssued, passStatus, triggerHaptic]);

  // Gateway Switcher
  const updateGateway = useCallback((newUrl) => {
    iotApi.setGatewayUrl(newUrl);
    setGatewayUrlState(iotApi.getGatewayUrl());
    disconnectSocket();
    syncLatestState();
  }, [syncLatestState]);

  // Periodic Gateway Health Check
  useEffect(() => {
    const checkHealth = async () => {
      const res = await iotApi.pingGateway();
      setGatewayHealth({
        online: res.online,
        latencyMs: res.latencyMs || 30,
        lastChecked: new Date(),
      });
    };
    checkHealth();
    const timer = setInterval(checkHealth, 10000);
    return () => clearInterval(timer);
  }, [gatewayUrl]);

  // Initialize Socket.IO connection & listen for events + Dynamic 3-sec Heartbeat Polling
  useEffect(() => {
    syncLatestState();

    const socket = initSocket(bandId, {
      onConnect: () => {
        setConnectionStatus('CONNECTED');
      },
      onDisconnect: () => {
        setConnectionStatus('DISCONNECTED');
      },
      onPassIssued: (pass) => {
        handlePassIssued(pass);
      },
      onPassAcknowledged: () => {
        setPassStatus('PASS_ACTIVE');
        if (currentPass) {
          setCurrentPass((p) => (p ? { ...p, status: 'ACTIVE' } : p));
        }
      },
      onCrowdAlert: (notif) => {
        triggerHaptic();
        setNotifications((prev) => [notif, ...prev.slice(0, 14)]);
        const nowTime = new Date().toTimeString().split(' ')[0];
        setEvents((prev) => [
          { id: `ev-${Date.now()}`, time: nowTime, event: 'Crowd status alert received', type: 'CROWD', timestamp: new Date().toISOString() },
          ...prev,
        ]);
      },
      onHealthAlert: (data) => {
        triggerHaptic();
        if (data.heartRate) {
          setTelemetry((prev) => ({
            ...prev,
            heartRate: data.heartRate,
            stressLevel: data.stressLevel || 'Elevated',
          }));
        }
        if (data.notification) {
          setNotifications((prev) => [data.notification, ...prev.slice(0, 14)]);
        }
      },
      onEmergencyAlert: (emg) => {
        triggerHaptic();
        setEmergencyActive(true);
        setEmergencyData(emg);
      },
      onBandReset: () => {
        setCurrentPass(null);
        setPassStatus('NO_PASS');
        setIsNewPassAlert(false);
        setEmergencyActive(false);
        setEmergencyData(null);
        setActiveScreen('clock');
        syncLatestState();
      },
    });

    // Dynamic Heartbeat Polling: guarantees live updates even on Vercel serverless / without WebSockets
    const heartbeatInterval = setInterval(() => {
      syncLatestState();
    }, 3000);

    // Periodic crowd telemetry refresh (every 15 seconds)
    const crowdInterval = setInterval(async () => {
      const crowd = await iotApi.getCrowdTelemetry('somnath');
      if (crowd) {
        const pct = crowd.crowdPercentage || 58;
        const wait = crowd.estimatedWaitMinutes || 34;
        let label = 'Smooth';
        if (pct >= 75) label = 'Crowded';
        else if (pct >= 45) label = 'Moderate';

        setCrowdStatus({
          exposure: `${pct}%`,
          crowdExposure: label,
          wait: `${wait} minutes`,
          waitMinutes: wait,
          status: label,
        });
      }
    }, 15000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(crowdInterval);
      disconnectSocket();
    };
  }, [bandId, gatewayUrl, handlePassIssued, syncLatestState, triggerHaptic]);

  // Acknowledge Pass
  const acknowledgeCurrentPass = async () => {
    triggerHaptic();
    setPassStatus('PASS_ACTIVE');
    setIsNewPassAlert(false);

    if (currentPass) {
      setCurrentPass((prev) => ({ ...prev, status: 'ACTIVE' }));
    }

    const nowTime = new Date().toTimeString().split(' ')[0];
    setEvents((prev) => [
      { id: `ev-ack-${Date.now()}`, time: nowTime, event: 'Pass acknowledged', type: 'ACK', timestamp: new Date().toISOString() },
      ...prev,
    ]);

    await iotApi.acknowledgePass(bandId);
  };

  // Trigger Emergency SOS
  const triggerEmergencySOS = async (type = 'EMERGENCY_ASSISTANCE', details = 'Emergency SOS triggered from smart band') => {
    triggerHaptic();
    setEmergencyActive(true);
    const nowTime = new Date().toTimeString().split(' ')[0];
    const payload = {
      type,
      details,
      pilgrim: currentPilgrim,
      location: `${location.templeName} - ${location.gate}`,
      timestamp: new Date().toISOString(),
    };

    setEmergencyData(payload);
    setActiveScreen('sos');

    setEvents((prev) => [
      { id: `ev-emg-${Date.now()}`, time: nowTime, event: '⚠ Emergency SOS dispatched', type: 'EMERGENCY', timestamp: new Date().toISOString() },
      ...prev,
    ]);

    const res = await iotApi.triggerEmergency(bandId, payload);
    return res;
  };

  // Reset Device (for Demo)
  const resetBandDevice = async () => {
    triggerHaptic();
    setCurrentPass(null);
    setPassStatus('NO_PASS');
    setIsNewPassAlert(false);
    setEmergencyActive(false);
    setEmergencyData(null);
    setActiveScreen('clock');
    await iotApi.resetBand(bandId);
    await syncLatestState();
  };

  // Demo Controls
  const simulatePassReceived = async () => {
    triggerHaptic();
    const demoBooking = {
      bookingId: `BK-SOM-${Math.floor(1000 + Math.random() * 9000)}`,
      templeId: 'somnath',
      templeName: 'Shree Somnath Jyotirlinga',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      slot: '10:00 AM - 11:30 AM (Madhyahna Aarti)',
      pilgrims: 2,
      leadPilgrim: 'Ramesh Patel',
      status: 'ISSUED',
      qrPayload: JSON.stringify({
        bookingId: `BK-SOM-DEMO`,
        temple: 'Shree Somnath Jyotirlinga',
        slot: '10:00 AM',
        pilgrims: 2,
      }),
      issuedAt: new Date().toISOString(),
    };
    handlePassIssued(demoBooking);
    await iotApi.simulateEvent(bandId, 'PASS_RECEIVED');
  };

  const simulateCrowdAlert = async () => {
    triggerHaptic();
    const notif = {
      id: `notif-${Date.now()}`,
      type: 'CROWD_ALERT',
      title: '⚠ Crowd Alert',
      message: 'Crowd density surging near Gate 2 turnstiles.',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev.slice(0, 14)]);
    const nowTime = new Date().toTimeString().split(' ')[0];
    setEvents((prev) => [
      { id: `ev-${Date.now()}`, time: nowTime, event: 'Crowd surge at Gate 2', type: 'CROWD', timestamp: new Date().toISOString() },
      ...prev,
    ]);
    setActiveScreen('crowd');
    await iotApi.simulateEvent(bandId, 'CROWD_ALERT');
  };

  const simulateHealthAlert = async () => {
    triggerHaptic();
    setTelemetry((prev) => ({
      ...prev,
      heartRate: 104,
      stressLevel: 'Elevated',
    }));
    const notif = {
      id: `notif-${Date.now()}`,
      type: 'HEALTH_ALERT',
      title: '💓 Health Pulse Alert',
      message: 'Elevated heart rate detected (104 BPM).',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev.slice(0, 14)]);
    const nowTime = new Date().toTimeString().split(' ')[0];
    setEvents((prev) => [
      { id: `ev-${Date.now()}`, time: nowTime, event: 'Health surge: 104 BPM', type: 'HEALTH', timestamp: new Date().toISOString() },
      ...prev,
    ]);
    setActiveScreen('vitals');
    await iotApi.simulateEvent(bandId, 'HEALTH_ALERT');
  };

  const simulateEmergency = async () => {
    triggerHaptic();
    await triggerEmergencySOS('DEMO_EMERGENCY', 'Simulated emergency alert from demo control panel');
  };

  return (
    <BandContext.Provider
      value={{
        bandId,
        setBandId,
        connectionStatus,
        battery,
        signalStrength,
        currentTime,
        currentPilgrim,
        currentTemple,
        currentPass,
        passStatus,
        isNewPassAlert,
        setIsNewPassAlert,
        telemetry,
        location,
        crowdStatus,
        notifications,
        events,
        emergencyActive,
        setEmergencyActive,
        emergencyData,
        activeScreen,
        setActiveScreen,
        selectedPassModal,
        setSelectedPassModal,
        hapticBuzz,
        triggerHaptic,
        acknowledgeCurrentPass,
        triggerEmergencySOS,
        resetBandDevice,
        simulatePassReceived,
        simulateCrowdAlert,
        simulateHealthAlert,
        simulateEmergency,
        syncLatestState,
        gatewayUrl,
        gatewayHealth,
        updateGateway,
      }}
    >
      {children}
    </BandContext.Provider>
  );
};

export const useBand = () => {
  const context = useContext(BandContext);
  if (!context) {
    throw new Error('useBand must be used within a BandProvider');
  }
  return context;
};
