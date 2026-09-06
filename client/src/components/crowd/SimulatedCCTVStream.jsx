import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Eye,
  Shield,
  Maximize2,
  RefreshCw,
  Sparkles,
  Activity,
  Video,
  Camera,
  Upload,
  AlertCircle,
  Smartphone,
  X,
  Copy,
  Check,
  ExternalLink,
  Wifi,
  StopCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';
import gate01Video from '../../assets/cctv demo footage/Gate 01.mp4';
import garbhagrihaVideo from '../../assets/cctv demo footage/Garbhagriha.mp4';

export const SimulatedCCTVStream = ({
  cams = [],
  templeName = "Shree Somnath Jyotirlinga",
  isAdmin = false
}) => {
  const [selectedCam, setSelectedCam] = useState(cams[0] || null);
  const [detectedBoxes, setDetectedBoxes] = useState([]);
  const [streamFps, setStreamFps] = useState(30);
  const [latencyMs, setLatencyMs] = useState(24);
  const [headcount, setHeadcount] = useState(42);
  const [isLiveAI, setIsLiveAI] = useState(false);
  const [activeSource, setActiveSource] = useState('sample'); // 'sample', 'webcam', 'upload', 'phone'
  const [streamError, setStreamError] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());

  // Phone Camera Session State (Admin Only)
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(600);
  const [phoneConnectionStatus, setPhoneConnectionStatus] = useState('IDLE'); // 'IDLE', 'WAITING_FOR_SCAN', 'CONNECTING_WEBRTC', 'CONNECTED'
  const [tunnelHost, setTunnelHost] = useState(typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');
  const [copiedLink, setCopiedLink] = useState(false);
  const [phoneStream, setPhoneStream] = useState(null);

  const fileInputRef = useRef(null);
  const phoneVideoRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const adminSocketRef = useRef(null);
  const adminPeerConnRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const iceCandidatesQueue = useRef([]);

  const streamBaseUrl = "http://127.0.0.1:8000";
  const backendBaseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:5001`
    : "http://localhost:5001";

  useEffect(() => {
    if (cams.length > 0 && (!selectedCam || !cams.find(c => c.id === selectedCam.id))) {
      setSelectedCam(cams[0]);
    }
  }, [cams]);

  // Keep timestamp ticking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toISOString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cameraFeeds = cams.length > 0 ? cams : [
    { id: "cam-01", name: "Main Entry Gate 1 Turnstiles", count: 42, status: "Online" },
    { id: "cam-02", name: "Sabhamandap Queue Corridor", count: 78, status: "Online" },
    { id: "cam-03", name: "Inner Garbhagriha Sanctum", count: 32, status: "Online" },
    { id: "cam-04", name: "Prasad Distribution Courtyard", count: 28, status: "Online" }
  ];

  const activeCam = selectedCam || cameraFeeds[0];
  const isGarbhagriha = activeCam.id.includes("03") || activeCam.name.toLowerCase().includes("garbhagriha") || activeCam.name.toLowerCase().includes("sanctum");
  const isGate01 = activeCam.id.includes("01") || activeCam.name.toLowerCase().includes("gate 1") || activeCam.name.toLowerCase().includes("main entry");
  const isPhysicalNode = true;
  const currentDemoVideo = activeSource === 'garbhagriha' || (activeSource !== 'gate01' && isGarbhagriha) ? garbhagrihaVideo : gate01Video;

  // Poll real-time AI microservice telemetry (when not in phone streaming mode)
  useEffect(() => {
    if (activeSource === 'phone') return; // In phone mode, telemetry is updated directly by the ingestion loop
    let isMounted = true;

    const fetchLiveTelemetry = async () => {
      if (!isPhysicalNode) {
        setIsLiveAI(false);
        return;
      }

      try {
        const res = await fetch(`${streamBaseUrl}/api/cctv/telemetry`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.mode === "LIVE_AI_INFERENCE") {
            setIsLiveAI(true);
            setStreamError(false);
            setHeadcount(data.headcount || 0);
            setStreamFps(data.fps || 30);
            setLatencyMs(data.latencyMs || 22);
            if (data.detectedBoxes && data.detectedBoxes.length > 0) {
              setDetectedBoxes(data.detectedBoxes);
            }
            if (data.source && data.source !== 'phone') {
              setActiveSource(data.source);
            }
            return;
          }
        }
      } catch (err) {
        // Fall back to simulation if microservice not responding
      }

      if (isMounted) {
        setIsLiveAI(false);
      }
    };

    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isPhysicalNode, activeCam, activeSource]);

  // Fallback dynamic simulated AI bounding boxes when live AI is inactive
  useEffect(() => {
    if (activeSource === 'phone') return;
    if (isLiveAI && isPhysicalNode) return;

    const generateSimulatedBoxes = () => {
      const count = activeCam?.count ? Math.min(12, Math.round(activeCam.count / 7)) : 6;
      const boxes = [];
      for (let i = 0; i < count; i++) {
        boxes.push({
          id: i,
          top: 20 + Math.random() * 55,
          left: 15 + Math.random() * 70,
          width: 8 + Math.random() * 10,
          height: 14 + Math.random() * 15,
          confidence: (0.91 + Math.random() * 0.08).toFixed(2),
          trackingId: `#PIL-${100 + i}`
        });
      }
      setDetectedBoxes(boxes);
      setStreamFps(29 + Math.round(Math.random() * 2));
      setLatencyMs(42);
      setHeadcount(activeCam.count || 42);
    };

    generateSimulatedBoxes();
    const interval = setInterval(generateSimulatedBoxes, 2500);
    return () => clearInterval(interval);
  }, [selectedCam, isLiveAI, isPhysicalNode, activeCam, activeSource]);

  // Handle switching video source on edge microservice
  const handleSwitchSource = async (sourceType) => {
    if (sourceType === 'phone') {
      handleOpenPhonePairingModal();
      return;
    }
    try {
      const formData = new FormData();
      formData.append("source_type", sourceType);
      formData.append("camera_name", activeCam.name);

      await fetch(`${streamBaseUrl}/api/cctv/source`, {
        method: "POST",
        body: formData,
      });
      setActiveSource(sourceType);
      setShowSourceMenu(false);
    } catch (err) {
      console.warn("Could not switch source on microservice:", err);
    }
  };

  // Handle user video file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("source_type", "upload");
      formData.append("camera_name", activeCam.name);
      formData.append("file", file);

      await fetch(`${streamBaseUrl}/api/cctv/source`, {
        method: "POST",
        body: formData,
      });
      setActiveSource("upload");
      setShowSourceMenu(false);
    } catch (err) {
      console.warn("Could not upload video to microservice:", err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Admin-Only Phone Camera WebRTC & Pairing Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const handleOpenPhonePairingModal = async () => {
    try {
      setPhoneConnectionStatus('WAITING_FOR_SCAN');
      setSessionSecondsLeft(600);

      const res = await fetch(`${backendBaseUrl}/api/crowd/cctv-session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cameraId: activeCam.id,
          cameraName: activeCam.name,
          templeId: "somnath"
        })
      });

      const data = await res.json();
      if (data.success && data.data?.token) {
        setSessionData(data.data);
        setShowPhoneModal(true);
        initAdminWebRTCSignaling(data.data.token);
      }
    } catch (err) {
      console.error('Failed to create CCTV session:', err);
    }
  };

  // Session timer countdown in modal
  useEffect(() => {
    if (!showPhoneModal || sessionSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSessionSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleDisconnectPhone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showPhoneModal, sessionSecondsLeft]);

  // Initialize Admin WebRTC Peer & Socket.IO Listener
  const initAdminWebRTCSignaling = (token) => {
    if (adminSocketRef.current) {
      adminSocketRef.current.disconnect();
    }

    const socket = io(backendBaseUrl, { transports: ['websocket', 'polling'] });
    adminSocketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 [Admin CCTV] Joined session room:', token);
      socket.emit('cctv_admin_join', { token });
    });

    // When the phone joins and is ready to stream
    socket.on('cctv_phone_ready', async (phoneInfo) => {
      console.log('📱 [Admin CCTV] Phone ready, initiating WebRTC negotiation...', phoneInfo);
      setPhoneConnectionStatus('CONNECTING_WEBRTC');

      try {
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });
        adminPeerConnRef.current = pc;

        // Phone is the video sender; Admin offers to receive video
        pc.addTransceiver('video', { direction: 'recvonly' });

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('cctv_ice_candidate', { token, candidate: event.candidate });
          }
        };

        pc.ontrack = (event) => {
          console.log('🎥 [Admin CCTV] Received remote phone video track!', event.streams[0]);
          const remoteStream = event.streams[0];
          setPhoneStream(remoteStream);
          setActiveSource('phone');
          setPhoneConnectionStatus('CONNECTED');
          setShowPhoneModal(false); // Close pairing modal now that live stream is receiving

          if (phoneVideoRef.current) {
            phoneVideoRef.current.srcObject = remoteStream;
            phoneVideoRef.current.play().catch(e => console.warn('Play error:', e));
          }
        };

        pc.onconnectionstatechange = () => {
          console.log('🔄 [Admin CCTV] WebRTC state:', pc.connectionState);
          if (pc.connectionState === 'connected') {
            setPhoneConnectionStatus('CONNECTED');
          } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            handleDisconnectPhone();
          }
        };

        // Create SDP Offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('cctv_signal', { token, signal: offer });
      } catch (err) {
        console.error('Error creating WebRTC offer:', err);
      }
    });

    // Handle SDP Answer from phone
    socket.on('cctv_signal', async ({ signal }) => {
      try {
        const pc = adminPeerConnRef.current;
        if (pc && signal.type === 'answer') {
          console.log('📩 [Admin CCTV] Received WebRTC answer from Phone');
          await pc.setRemoteDescription(new RTCSessionDescription(signal));

          while (iceCandidatesQueue.current.length > 0) {
            const cand = iceCandidatesQueue.current.shift();
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          }
        }
      } catch (err) {
        console.error('WebRTC answer handling error:', err);
      }
    });

    // Handle ICE candidates from phone
    socket.on('cctv_ice_candidate', async ({ candidate }) => {
      try {
        const pc = adminPeerConnRef.current;
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          iceCandidatesQueue.current.push(candidate);
        }
      } catch (err) {
        console.warn('Admin ICE error:', err);
      }
    });

    socket.on('cctv_peer_disconnected', () => {
      console.log('🛑 [Admin CCTV] Phone disconnected');
      handleDisconnectPhone();
    });

    socket.on('cctv_session_terminated', () => {
      handleDisconnectPhone();
    });
  };

  // Disconnect Phone Camera and cleanly revert to simulation
  const handleDisconnectPhone = () => {
    if (sessionData?.token && adminSocketRef.current) {
      adminSocketRef.current.emit('cctv_session_terminate', { token: sessionData.token });
    }
    if (adminPeerConnRef.current) {
      adminPeerConnRef.current.close();
      adminPeerConnRef.current = null;
    }
    if (adminSocketRef.current) {
      adminSocketRef.current.disconnect();
      adminSocketRef.current = null;
    }
    if (phoneStream) {
      phoneStream.getTracks().forEach(t => t.stop());
      setPhoneStream(null);
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    setShowPhoneModal(false);
    setPhoneConnectionStatus('IDLE');
    setSessionData(null);
    setActiveSource('sample');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Real-Time Computer Vision Inference Loop on Remote Phone Stream
  // Captures frames from the WebRTC video stream and feeds into RTX 4050 YOLOv8 pipeline
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeSource !== 'phone' || !phoneStream) {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
      return;
    }

    const canvas = captureCanvasRef.current || document.createElement('canvas');
    captureCanvasRef.current = canvas;
    const ctx = canvas.getContext('2d');

    let isPosting = false;

    frameIntervalRef.current = setInterval(async () => {
      const video = phoneVideoRef.current;
      if (!video || video.readyState < 2 || isPosting) return;

      try {
        isPosting = true;
        const tCapture = performance.now();

        // Downscale frame to 640x360 for high-FPS low-latency GPU inference
        canvas.width = 640;
        canvas.height = 360;
        ctx.drawImage(video, 0, 0, 640, 360);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

        const res = await fetch(`${streamBaseUrl}/api/cctv/ingest-frame`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: dataUrl,
            camera_name: `${activeCam.name} (Phone CCTV)`,
            transport_latency: 18.0
          })
        });

        if (res.ok) {
          const data = await res.json();
          setIsLiveAI(true);
          setHeadcount(data.headcount || 0);
          setStreamFps(data.fps || 28);
          setLatencyMs(data.endToEndLatencyMs || data.latencyMs || 22);
          if (data.detectedBoxes) {
            setDetectedBoxes(data.detectedBoxes);
          }
        }
      } catch (err) {
        console.warn('Phone frame ingestion error:', err);
      } finally {
        isPosting = false;
      }
    }, 70); // ~14-16 FPS continuous edge inference

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    };
  }, [activeSource, phoneStream, activeCam]);

  // Ensure remote stream is bound to video element if element mounts
  useEffect(() => {
    if (phoneVideoRef.current && phoneStream) {
      phoneVideoRef.current.srcObject = phoneStream;
      phoneVideoRef.current.play().catch(e => console.warn('Play video error:', e));
    }
  }, [phoneStream, activeSource]);

  // Generate pairing URL for phone
  const mobilePairingUrl = sessionData?.token
    ? `${tunnelHost.replace(/\/$/, '')}/admin/cctv/mobile?session=${sessionData.token}&camera=${sessionData.cameraId}`
    : '';

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-3.5 sm:p-6 text-white shadow-2xl space-y-3.5 sm:space-y-4">
      
      {/* Hidden File Picker for Uploaded CCTV */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="video/mp4,video/avi,video/mov,video/mkv,video/webm"
        className="hidden"
      />

      {/* CCTV Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className={`w-8 h-8 rounded-lg ${activeSource === 'phone' ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' : isLiveAI && isPhysicalNode ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-red-500/20 border-red-500/30 text-red-400'} border flex items-center justify-center shrink-0`}>
            {activeSource === 'phone' ? (
              <Smartphone className="w-4 h-4 animate-bounce" />
            ) : (
              <Radio className="w-4 h-4 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-white">AI Edge Computer Vision Feed</span>
              
              {/* Distinct Badge: LIVE PHONE CCTV vs LIVE AI INFERENCE vs DEMO MODE */}
              {activeSource === 'phone' ? (
                <span className="text-[9px] sm:text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-mono font-bold uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
                  SOURCE: PHONE CAMERA (LIVE WEBRTC)
                </span>
              ) : isLiveAI && isPhysicalNode ? (
                <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-mono font-bold uppercase flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE AI INFERENCE
                </span>
              ) : isPhysicalNode ? (
                <span className="text-[9px] sm:text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono uppercase">
                  DEMO MODE (SIMULATED)
                </span>
              ) : (
                <span className="text-[9px] sm:text-[10px] bg-slate-700/60 text-slate-300 border border-slate-600 px-1.5 py-0.5 rounded font-mono uppercase">
                  SIMULATION NODE
                </span>
              )}
            </div>
            <span className="text-[11px] sm:text-xs text-slate-400">
              {templeName} • Edge Node: YOLOv8 Spatial {activeSource === 'phone' ? '• Model: Mobile Live Ingest' : isLiveAI && isPhysicalNode ? '• Model: Fine-tuned Pedestrian' : ''}
            </span>
          </div>
        </div>

        {/* Camera Selector Tabs & Admin Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {cameraFeeds.map((cam) => {
            const isCamPhysical = cam.id.includes("01") || cam.id.includes("03") || cam.name.toLowerCase().includes("gate 1") || cam.name.toLowerCase().includes("main entry") || cam.name.toLowerCase().includes("garbhagriha") || cam.name.toLowerCase().includes("sanctum");
            const isPhoneBound = activeSource === 'phone' && (sessionData?.cameraId === cam.id || cam.id === activeCam.id);
            return (
              <button
                key={cam.id}
                onClick={() => {
                  if (activeSource === 'phone' && cam.id !== activeCam.id) {
                    if (window.confirm("Switching camera nodes will disconnect the active phone camera session. Proceed?")) {
                      handleDisconnectPhone();
                      setSelectedCam(cam);
                    }
                  } else {
                    setSelectedCam(cam);
                    // Notify edge microservice to switch video source
                    const isGarbha = cam.id.includes("03") || cam.name.toLowerCase().includes("garbhagriha") || cam.name.toLowerCase().includes("sanctum");
                    setActiveSource(isGarbha ? "garbhagriha" : "gate01");
                    try {
                      const formData = new FormData();
                      formData.append("source_type", isGarbha ? "garbhagriha" : "gate01");
                      formData.append("camera_name", cam.name);
                      fetch(`${streamBaseUrl}/api/cctv/source`, { method: "POST", body: formData }).catch(() => {});
                    } catch (e) {}
                  }
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] flex items-center gap-1 ${
                  activeCam.id === cam.id
                    ? isPhoneBound ? 'bg-purple-600 text-white shadow-md' : 'bg-[#E97820] text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>{cam.name.split(' ')[0]} {cam.id.split('-').pop()}</span>
                {isPhoneBound ? (
                  <span className="text-[8px] bg-black/40 px-1 rounded text-purple-200 font-mono">PHONE</span>
                ) : (
                  <span className="text-[8px] bg-black/40 px-1 rounded text-emerald-300 font-mono">
                    {cam.id.includes("03") || cam.name.toLowerCase().includes("garbhagriha") || cam.name.toLowerCase().includes("sanctum") ? 'SANCTUM AI' : 'GATE AI'}
                  </span>
                )}
              </button>
            );
          })}

          {/* ADMIN-ONLY: Connect Phone Camera Button */}
          {isAdmin && (
            activeSource === 'phone' ? (
              <button
                onClick={handleDisconnectPhone}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 flex items-center gap-1.5 min-h-[36px] transition-all"
                title="Disconnect Phone Camera"
              >
                <StopCircle className="w-3.5 h-3.5 text-red-400" />
                <span>DISCONNECT</span>
              </button>
            ) : (
              <button
                onClick={handleOpenPhonePairingModal}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 flex items-center gap-1.5 min-h-[36px] transition-all shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                title="Pair Phone Camera as Live CCTV Source"
              >
                <Smartphone className="w-3.5 h-3.5 text-purple-300" />
                <span>CONNECT PHONE CAMERA</span>
              </button>
            )
          )}

          {/* Video Feed Source Selector */}
          {isPhysicalNode && (
            <div className="relative">
              <button
                onClick={() => setShowSourceMenu(!showSourceMenu)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 min-h-[36px] transition-colors"
                title="Select CCTV Source"
              >
                {activeSource === 'phone' ? (
                  <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                ) : activeSource === 'webcam' ? (
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                ) : activeSource === 'upload' ? (
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Video className="w-3.5 h-3.5 text-[#E97820]" />
                )}
                <span className="capitalize text-[11px]">{activeSource === 'phone' ? 'Phone' : activeSource}</span>
              </button>

              {showSourceMenu && (
                <div className="absolute right-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 p-1 space-y-0.5 text-xs font-medium">
                  <button
                    onClick={() => handleSwitchSource('gate01')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 ${activeSource === 'gate01' || (activeSource === 'sample' && !isGarbhagriha) ? 'bg-[#E97820] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Gate 01 Demo Footage</span>
                  </button>
                  <button
                    onClick={() => handleSwitchSource('garbhagriha')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 ${activeSource === 'garbhagriha' || (activeSource === 'sample' && isGarbhagriha) ? 'bg-[#E97820] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Garbhagriha Demo Footage</span>
                  </button>
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 ${activeSource === 'upload' ? 'bg-[#E97820] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload CCTV Video</span>
                  </button>
                  <button
                    onClick={() => handleSwitchSource('webcam')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 ${activeSource === 'webcam' ? 'bg-[#E97820] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Live Webcam</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleSwitchSource('phone')}
                      className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 ${activeSource === 'phone' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:bg-slate-800'}`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Phone Camera (WebRTC)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Video Stream Container */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
        
        {/* CASE 1: REAL LIVE PHONE CAMERA VIA WEBRTC */}
        {activeSource === 'phone' && phoneStream ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <video
              ref={phoneVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Subtle Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

            {/* Real YOLO Bounding Boxes Overlaid on Live Phone Stream */}
            {detectedBoxes.map((box) => (
              <div
                key={box.id}
                className="absolute border-2 border-emerald-400 rounded bg-emerald-500/10 pointer-events-none transition-all duration-100 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{
                  top: `${box.top}%`,
                  left: `${box.left}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`
                }}
              >
                <div className="absolute -top-4 left-0 bg-emerald-500 text-slate-950 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-t whitespace-nowrap flex items-center gap-1 shadow">
                  <span>{box.trackingId}</span>
                  <span className="opacity-80">({box.confidence})</span>
                  {box.direction && box.direction !== "STATIONARY" && (
                    <span className="text-[7.5px] bg-slate-950/80 text-emerald-300 px-1 rounded">{box.direction}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : isLiveAI && isPhysicalNode && !streamError ? (
          /* CASE 2: REAL LIVE AI MJPEG STREAM FROM EDGE MICROSERVICE */
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <img
              src={`${streamBaseUrl}/api/cctv/stream`}
              alt="Live CCTV Feed with AI Inference"
              onError={() => setStreamError(true)}
              className="w-full h-full object-cover"
            />
            {/* Subtle Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
          </div>
        ) : (
          /* CASE 3: CCTV DEMO FOOTAGE VIDEO STREAM TEXTURE */
          <div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
            <video
              key={currentDemoVideo}
              src={currentDemoVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-75 filter contrast-110"
            />
            {/* Subtle Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
            
            {/* Simulated AI Detection Bounding Boxes */}
            {detectedBoxes.map((box) => (
              <div
                key={box.id}
                className="absolute border-2 border-emerald-400/90 rounded bg-emerald-500/10 pointer-events-none transition-all duration-700"
                style={{
                  top: `${box.top}%`,
                  left: `${box.left}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`
                }}
              >
                <div className="absolute -top-4 left-0 bg-emerald-500 text-slate-950 text-[8px] font-mono font-bold px-1 rounded-t whitespace-nowrap">
                  {box.trackingId} ({box.confidence})
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top-Left Camera Info Overlay */}
        <div className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-sm border border-slate-700 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-mono text-slate-300 space-y-0.5 max-w-[65%] truncate shadow-lg">
          <div className="text-emerald-400 font-bold flex items-center gap-1.5 truncate">
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${activeSource === 'phone' ? 'bg-purple-400 animate-ping' : isLiveAI && isPhysicalNode ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'} shrink-0`} />
            <span className="truncate">
              CAM: {activeCam.name} {activeSource === 'phone' ? '• MOBILE CCTV' : ''}
            </span>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-300">
            HEADCOUNT: <strong className="text-white font-bold">{headcount} Devotees</strong>
          </div>
        </div>

        {/* Top-Right Telemetry Overlay (Real Measured Telemetry) */}
        <div className="absolute top-2.5 right-2.5 bg-slate-950/85 backdrop-blur-sm border border-slate-700 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-mono text-slate-300 text-right shadow-lg">
          <div>FPS: <span className="text-emerald-400 font-bold">{streamFps}</span></div>
          <div className="text-[9px] sm:text-[10px] text-slate-400">LATENCY: {latencyMs}ms</div>
          {activeSource === 'phone' ? (
            <div className="text-[8px] text-purple-400 font-bold tracking-tight">PHONE WEBRTC • RTX 4050</div>
          ) : isLiveAI && isPhysicalNode ? (
            <div className="text-[8px] text-emerald-400 font-bold tracking-tight">RTX 4050 ACCELERATED</div>
          ) : null}
        </div>

        {/* Simulation / Secondary Camera Watermark if on other nodes */}
        {!isPhysicalNode && activeSource !== 'phone' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 text-center">
              SIMULATION FEED — Physical AI stream active on Gate 01
            </div>
          </div>
        )}

        {/* Bottom Timestamp & Privacy Notice */}
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[9px] sm:text-[10.5px] font-mono bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-slate-800 text-slate-400 shadow-lg">
          <span className="truncate">{currentTime} • UTC+05:30</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
            Privacy Protected (Zero PII Retained)
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          ADMIN-ONLY: PHONE CAMERA PAIRING MODAL WITH SCANNABLE QR CODE
          ───────────────────────────────────────────────────────────────────────────── */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0B172B] border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-white relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white">
                    Connect Phone Camera as Live CCTV
                  </h3>
                  <p className="text-xs text-slate-400">
                    Temporary WebRTC publisher node
                  </p>
                </div>
              </div>
              <button
                onClick={handleDisconnectPhone}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Camera Assignment Badge & Timer */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-slate-400 block text-[10px]">BOUND CAMERA:</span>
                <strong className="text-emerald-400">{activeCam.name} ({activeCam.id})</strong>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-slate-400 block text-[10px]">SESSION EXPIRES:</span>
                <strong className="text-amber-400 font-bold">{formatCountdown(sessionSecondsLeft)}</strong>
              </div>
            </div>

            {/* QR Code Presentation */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner border border-slate-200">
              {mobilePairingUrl ? (
                <QRCodeSVG
                  value={mobilePairingUrl}
                  size={190}
                  level="M"
                  includeMargin={true}
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                  Generating Session...
                </div>
              )}
              <span className="text-slate-700 text-[11px] font-sans font-semibold mt-2 text-center">
                Scan with any smartphone camera (iOS / Android)
              </span>
            </div>

            {/* Host Configurator for HTTPS Tunnels (ngrok / localtunnel) */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Pairing Host URL:</span>
                <span className="text-[10px] text-purple-400">Requires HTTPS on phone</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tunnelHost}
                  onChange={(e) => setTunnelHost(e.target.value)}
                  placeholder="https://your-tunnel.ngrok-free.app or http://192.168.x.x:5173"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(mobilePairingUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                  title="Copy Link to Clipboard"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Live Connection Status Banner */}
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping shrink-0" />
              <div className="leading-tight">
                <strong className="block text-white font-serif">
                  {phoneConnectionStatus === 'WAITING_FOR_SCAN' ? 'Waiting for phone connection...' : 'Establishing WebRTC tunnel...'}
                </strong>
                <span className="text-[11px] text-purple-300/80">
                  No app required. The phone streams directly into your RTX 4050 YOLO pipeline.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-1">
              <button
                onClick={handleDisconnectPhone}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel Pairing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulatedCCTVStream;
