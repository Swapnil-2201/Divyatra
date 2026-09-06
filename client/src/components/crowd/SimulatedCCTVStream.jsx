import React, { useState, useEffect, useRef } from 'react';
import { Radio, Eye, Shield, Maximize2, RefreshCw, Sparkles, Activity, Video, Camera, Upload, AlertCircle } from 'lucide-react';

export const SimulatedCCTVStream = ({ cams = [], templeName = "Shree Somnath Jyotirlinga" }) => {
  const [selectedCam, setSelectedCam] = useState(cams[0] || null);
  const [detectedBoxes, setDetectedBoxes] = useState([]);
  const [streamFps, setStreamFps] = useState(30);
  const [latencyMs, setLatencyMs] = useState(24);
  const [headcount, setHeadcount] = useState(42);
  const [isLiveAI, setIsLiveAI] = useState(false);
  const [activeSource, setActiveSource] = useState('sample'); // 'sample', 'webcam', 'upload'
  const [streamError, setStreamError] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());

  const fileInputRef = useRef(null);
  const streamBaseUrl = "http://127.0.0.1:8000";

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
  // Gate 1 / First camera connects to the physical AI inference edge node
  const isPhysicalNode = activeCam.id.includes("01") || activeCam.name.toLowerCase().includes("gate 1") || activeCam.name.toLowerCase().includes("main entry");

  // Poll real-time AI microservice telemetry
  useEffect(() => {
    let isMounted = true;

    const fetchLiveTelemetry = async () => {
      // If user selected non-physical camera node, run simulated feed for that node
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
            if (data.source) {
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
  }, [isPhysicalNode, activeCam]);

  // Fallback dynamic simulated AI bounding boxes when live AI is inactive
  useEffect(() => {
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
  }, [selectedCam, isLiveAI, isPhysicalNode, activeCam]);

  // Handle switching video source on edge microservice
  const handleSwitchSource = async (sourceType) => {
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
          <div className={`w-8 h-8 rounded-lg ${isLiveAI && isPhysicalNode ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-red-500/20 border-red-500/30 text-red-400'} border flex items-center justify-center shrink-0`}>
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-white">AI Edge Computer Vision Feed</span>
              
              {/* Distinct Badge: LIVE AI INFERENCE vs DEMO MODE */}
              {isLiveAI && isPhysicalNode ? (
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
              {templeName} • Edge Node: YOLOv8 Spatial {isLiveAI && isPhysicalNode && "• Model: Fine-tuned Pedestrian"}
            </span>
          </div>
        </div>

        {/* Camera Selector Tabs & Source Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          {cameraFeeds.map((cam) => {
            const isCamPhysical = cam.id.includes("01") || cam.name.toLowerCase().includes("gate 1") || cam.name.toLowerCase().includes("main entry");
            return (
              <button
                key={cam.id}
                onClick={() => setSelectedCam(cam)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] flex items-center gap-1 ${
                  activeCam.id === cam.id
                    ? 'bg-[#E97820] text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>{cam.name.split(' ')[0]} {cam.id.split('-').pop()}</span>
                {isCamPhysical && (
                  <span className="text-[8px] bg-black/40 px-1 rounded text-emerald-300 font-mono">PHYSICAL</span>
                )}
              </button>
            );
          })}

          {/* Video Feed Source Selector */}
          {isPhysicalNode && (
            <div className="relative">
              <button
                onClick={() => setShowSourceMenu(!showSourceMenu)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 min-h-[36px] transition-colors"
                title="Select CCTV Source"
              >
                {activeSource === 'webcam' ? <Camera className="w-3.5 h-3.5 text-emerald-400" /> : activeSource === 'upload' ? <Upload className="w-3.5 h-3.5 text-blue-400" /> : <Video className="w-3.5 h-3.5 text-[#E97820]" />}
                <span className="capitalize text-[11px]">{activeSource}</span>
              </button>

              {showSourceMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 p-1 space-y-0.5 text-xs font-medium">
                  <button
                    onClick={() => handleSwitchSource('sample')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 ${activeSource === 'sample' ? 'bg-[#E97820] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Prerecorded CCTV</span>
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Video Stream Container */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
        
        {/* Real Live AI Video Stream from Python Edge Microservice */}
        {isLiveAI && isPhysicalNode && !streamError ? (
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
          /* Simulated Video Stream Texture */
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-[#102A56]/60 to-slate-900 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
              alt="Temple CCTV feed simulation"
              className="w-full h-full object-cover opacity-35 filter contrast-125 grayscale"
            />
            {/* Subtle Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60" />
            
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
        <div className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-sm border border-slate-700 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-mono text-slate-300 space-y-0.5 max-w-[60%] truncate shadow-lg">
          <div className="text-emerald-400 font-bold flex items-center gap-1.5 truncate">
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isLiveAI && isPhysicalNode ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'} shrink-0`} />
            <span className="truncate">CAM: {activeCam.name}</span>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-300">
            HEADCOUNT: <strong className="text-white font-bold">{headcount} Devotees</strong>
          </div>
        </div>

        {/* Top-Right Telemetry Overlay (Real Measured Telemetry) */}
        <div className="absolute top-2.5 right-2.5 bg-slate-950/85 backdrop-blur-sm border border-slate-700 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-mono text-slate-300 text-right shadow-lg">
          <div>FPS: <span className="text-emerald-400 font-bold">{streamFps}</span></div>
          <div className="text-[9px] sm:text-[10px] text-slate-400">LATENCY: {latencyMs}ms</div>
          {isLiveAI && isPhysicalNode && (
            <div className="text-[8px] text-emerald-400 font-bold tracking-tight">RTX 4050 ACCELERATED</div>
          )}
        </div>

        {/* Simulation / Secondary Camera Watermark if on other nodes */}
        {!isPhysicalNode && (
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
    </div>
  );
};
