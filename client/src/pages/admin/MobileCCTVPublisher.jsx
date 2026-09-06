import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Camera, SwitchCamera, StopCircle, Radio, Shield, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

export const MobileCCTVPublisher = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('session');
  const cameraIdParam = searchParams.get('camera') || 'cam-01';

  const [cameraInfo, setCameraInfo] = useState({
    name: 'Gate 01 Main Entry',
    id: cameraIdParam,
  });

  const [connectionStatus, setConnectionStatus] = useState('VALIDATING'); // VALIDATING, PERMISSION_REQUEST, CONNECTING, LIVE, DISCONNECTED, ERROR
  const [errorMessage, setErrorMessage] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear) or 'user' (front)
  const [streamFps, setStreamFps] = useState(0);
  const [isSecure, setIsSecure] = useState(true);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnRef = useRef(null);
  const iceCandidatesQueue = useRef([]);

  // Determine Socket.IO backend gateway URL
  const getBackendUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      // If accessed via localhost
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5001';
      }
      // If accessed via LAN IP (e.g. 192.168.x.x) or domain
      return `${protocol}//${hostname}:5001`;
    }
    return 'http://localhost:5001';
  };

  // 1. Initial Validation of Single-Purpose Session Token
  useEffect(() => {
    if (!token) {
      setConnectionStatus('ERROR');
      setErrorMessage('Missing temporary camera session token. Please scan a valid QR code from the Admin Command Center.');
      return;
    }

    // Check secure context for getUserMedia
    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setIsSecure(false);
    }

    const validateToken = async () => {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/api/crowd/cctv-session/validate?token=${token}`);
        const data = await res.json();

        if (!res.ok || !data.success || !data.data.valid) {
          setConnectionStatus('ERROR');
          setErrorMessage(data.message || 'The temporary camera session has expired or is invalid. Please request a new QR code from Admin.');
          return;
        }

        setCameraInfo({
          name: data.data.cameraName || 'Assigned Temple CCTV',
          id: data.data.cameraId || cameraIdParam,
        });

        // Token is valid; proceed to request camera
        startCamera();
      } catch (err) {
        console.warn('Backend validation failed, attempting direct handshake:', err);
        // Fallback: proceed to socket handshake where token will also be validated
        startCamera();
      }
    };

    validateToken();

    return () => {
      stopCameraSession();
    };
  }, [token]);

  // 2. Camera Media Stream Acquisition
  const startCamera = async (currentFacing = facingMode) => {
    setConnectionStatus('PERMISSION_REQUEST');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const constraints = {
        video: {
          facingMode: { ideal: currentFacing },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: false // Audio strictly disabled per specs
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }

      setConnectionStatus('CONNECTING');
      initWebRTCSignaling(mediaStream);
    } catch (err) {
      console.error('Camera access error:', err);
      setConnectionStatus('ERROR');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('CAMERA PERMISSION DENIED: Please grant camera access in your browser settings to broadcast as a temporary CCTV node.');
      } else if (err.name === 'NotFoundError') {
        setErrorMessage('NO CAMERA FOUND: Unable to locate a physical camera on this mobile device.');
      } else {
        setErrorMessage(`CAMERA ERROR: ${err.message || 'Unable to open video capture device.'}`);
      }
    }
  };

  // 3. WebRTC Peer Connection & Socket.IO Signaling
  const initWebRTCSignaling = (mediaStream) => {
    const backendUrl = getBackendUrl();
    const socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 [Mobile CCTV] Connected to signaling gateway, joining session...');
      socket.emit('cctv_phone_join', {
        token,
        camera: cameraInfo.id,
      });
    });

    socket.on('cctv_joined', (data) => {
      console.log('✅ [Mobile CCTV] Handshake validated by backend:', data);
    });

    socket.on('cctv_error', (err) => {
      console.error('❌ [Mobile CCTV] Handshake rejected:', err);
      setConnectionStatus('ERROR');
      setErrorMessage(err.message || 'Session verification failed.');
    });

    // Create RTCPeerConnection
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    peerConnRef.current = pc;

    // Attach local camera stream tracks to PeerConnection
    mediaStream.getTracks().forEach((track) => {
      pc.addTrack(track, mediaStream);
    });

    // Gather ICE candidates and send to Admin
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('cctv_ice_candidate', {
          token,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('🔄 [Mobile CCTV] PeerConnection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setConnectionStatus('LIVE');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setConnectionStatus('DISCONNECTED');
      }
    };

    // Receive SDP Offer from Admin Laptop
    socket.on('cctv_signal', async ({ signal }) => {
      try {
        if (signal.type === 'offer') {
          console.log('📩 [Mobile CCTV] Received WebRTC offer from Admin, generating answer...');
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          
          // Process any queued ICE candidates
          while (iceCandidatesQueue.current.length > 0) {
            const candidate = iceCandidatesQueue.current.shift();
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit('cctv_signal', {
            token,
            signal: answer,
          });
          setConnectionStatus('LIVE');
        }
      } catch (err) {
        console.error('WebRTC offer/answer negotiation error:', err);
      }
    });

    // Receive ICE candidate from Admin Laptop
    socket.on('cctv_ice_candidate', async ({ candidate }) => {
      try {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          iceCandidatesQueue.current.push(candidate);
        }
      } catch (err) {
        console.warn('ICE candidate addition error:', err);
      }
    });

    // Terminated by Admin
    socket.on('cctv_session_terminated', (data) => {
      console.log('🛑 [Mobile CCTV] Session terminated by Admin:', data);
      stopCameraSession();
      setConnectionStatus('DISCONNECTED');
      setErrorMessage('The CCTV broadcast was stopped by the Administrator.');
    });
  };

  // Toggle Front / Rear Camera
  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Gracefully stop session
  const stopCameraSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (peerConnRef.current) {
      peerConnRef.current.close();
      peerConnRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.emit('cctv_session_terminate', { token });
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setConnectionStatus('DISCONNECTED');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans select-none safe-top safe-bottom">
      
      {/* Top Header Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E97820]/20 border border-[#E97820]/40 flex items-center justify-center text-[#E97820]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h1 className="font-serif text-sm font-bold text-white tracking-wide">
              DIVYATRA ADMIN CCTV
            </h1>
            <p className="text-[11px] text-slate-400">
              Temporary Mobile Publisher Node
            </p>
          </div>
        </div>

        {/* Bound Camera Badge */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold block">
            {cameraInfo.name}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">
            Node: {cameraInfo.id}
          </span>
        </div>
      </div>

      {/* Main Camera Viewport Area */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        
        {/* Physical Camera Video Preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        />

        {/* Live Scanlines Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

        {/* Live Status Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 shadow-xl">
            {connectionStatus === 'LIVE' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-400">
                  LIVE • BROADCASTING
                </span>
              </>
            ) : connectionStatus === 'CONNECTING' || connectionStatus === 'PERMISSION_REQUEST' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  {connectionStatus.replace('_', ' ')}
                </span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-xs font-mono font-bold text-red-400">
                  OFFLINE
                </span>
              </>
            )}
          </div>

          <div className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700 text-[10px] font-mono text-slate-300 shadow-xl">
            {facingMode === 'environment' ? 'REAR CAMERA' : 'FRONT CAMERA'}
          </div>
        </div>

        {/* Insecure Context Warning if not on HTTPS */}
        {!isSecure && (
          <div className="absolute top-16 left-4 right-4 bg-amber-950/90 border border-amber-600/80 rounded-xl p-3 z-30 text-xs text-amber-200 shadow-2xl">
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>HTTPS Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-300/90">
              Mobile browsers require HTTPS or an HTTPS tunnel (ngrok / localtunnel) for full camera permissions.
            </p>
          </div>
        )}

        {/* Error or Disconnected State Modal / Overlay */}
        {(connectionStatus === 'ERROR' || connectionStatus === 'DISCONNECTED') && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-2xl">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-1 max-w-sm">
              <h2 className="text-base font-bold text-white font-serif">
                {connectionStatus === 'DISCONNECTED' ? 'CAMERA DISCONNECTED' : 'CONNECTION ERROR'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {errorMessage || 'This camera session is no longer active. The administrator may have stopped the stream or the token has expired.'}
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono space-y-1 text-left w-full max-w-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Camera:</span>
                <span className="text-white font-bold">{cameraInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Node ID:</span>
                <span className="text-emerald-400 font-bold">{cameraInfo.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-red-400 font-bold">{connectionStatus}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500">
              To broadcast again, scan a new QR code from the Admin Command Center.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-4 space-y-3 z-20">
        
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleToggleFacingMode}
            disabled={connectionStatus === 'ERROR' || connectionStatus === 'DISCONNECTED'}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[48px]"
          >
            <SwitchCamera className="w-4 h-4 text-emerald-400" />
            <span>Switch Camera</span>
          </button>

          <button
            onClick={stopCameraSession}
            disabled={connectionStatus === 'DISCONNECTED'}
            className="py-3 px-4 rounded-xl bg-red-600/90 hover:bg-red-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/30 disabled:opacity-50 min-h-[48px]"
          >
            <StopCircle className="w-4 h-4" />
            <span>STOP CAMERA</span>
          </button>
        </div>

        {/* Security & Zero PII Notice */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-500">
          <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>Admin-Authorized Single-Purpose Token • Zero PII Retained</span>
        </div>
      </div>
    </div>
  );
};

export default MobileCCTVPublisher;
