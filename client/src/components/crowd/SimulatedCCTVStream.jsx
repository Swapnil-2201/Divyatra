import React, { useState, useEffect } from 'react';
import { Radio, Eye, Shield, Maximize2, RefreshCw, Sparkles, Activity } from 'lucide-react';

export const SimulatedCCTVStream = ({ cams = [], templeName = "Shree Somnath Jyotirlinga" }) => {
  const [selectedCam, setSelectedCam] = useState(cams[0] || null);
  const [detectedBoxes, setDetectedBoxes] = useState([]);
  const [streamFps, setStreamFps] = useState(30);

  useEffect(() => {
    if (cams.length > 0 && (!selectedCam || !cams.find(c => c.id === selectedCam.id))) {
      setSelectedCam(cams[0]);
    }
  }, [cams]);

  // Generate dynamic simulated AI bounding boxes on camera view
  useEffect(() => {
    const generateBoxes = () => {
      const count = selectedCam?.count ? Math.min(12, Math.round(selectedCam.count / 7)) : 6;
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
    };

    generateBoxes();
    const interval = setInterval(generateBoxes, 2500);
    return () => clearInterval(interval);
  }, [selectedCam]);

  const cameraFeeds = cams.length > 0 ? cams : [
    { id: "cam-01", name: "Main Entry Gate 1 Turnstiles", count: 42, status: "Online" },
    { id: "cam-02", name: "Sabhamandap Queue Corridor", count: 78, status: "Online" },
    { id: "cam-03", name: "Inner Garbhagriha Sanctum", count: 32, status: "Online" },
    { id: "cam-04", name: "Prasad Distribution Courtyard", count: 28, status: "Online" }
  ];

  const activeCam = selectedCam || cameraFeeds[0];

  return (
    <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-3.5 sm:p-6 text-white shadow-2xl space-y-3.5 sm:space-y-4">
      
      {/* CCTV Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-white">AI Edge Computer Vision Feed</span>
              <span className="text-[9px] sm:text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-mono uppercase">
                LIVE
              </span>
            </div>
            <span className="text-[11px] sm:text-xs text-slate-400">{templeName} • Edge Node: YOLOv8 Spatial</span>
          </div>
        </div>

        {/* Camera Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {cameraFeeds.map((cam) => (
            <button
              key={cam.id}
              onClick={() => setSelectedCam(cam)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
                activeCam.id === cam.id
                  ? 'bg-[#E97820] text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cam.name.split(' ')[0]} {cam.id.split('-').pop()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Video Stream Container (Simulated with AI Overlays) */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
        
        {/* Background Visual Texture */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-[#102A56]/60 to-slate-900 flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
            alt="Temple CCTV feed simulation"
            className="w-full h-full object-cover opacity-35 filter contrast-125 grayscale"
          />
          {/* Subtle Scanline Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60" />
        </div>

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

        {/* Top-Left Camera Info Overlay */}
        <div className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-sm border border-slate-700 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-mono text-slate-300 space-y-0.5 max-w-[60%] truncate">
          <div className="text-emerald-400 font-bold flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="truncate">CAM: {activeCam.name}</span>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-400">
            HEADCOUNT: <strong className="text-white">{activeCam.count || 42} Devotees</strong>
          </div>
        </div>

        {/* Top-Right Telemetry Overlay */}
        <div className="absolute top-2.5 right-2.5 bg-slate-950/85 backdrop-blur-sm border border-slate-700 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-mono text-slate-300 text-right">
          <div>FPS: <span className="text-emerald-400 font-bold">{streamFps}</span></div>
          <div className="text-[9px] sm:text-[10px] text-slate-400">LATENCY: 42ms</div>
        </div>

        {/* Bottom Timestamp & Privacy Notice */}
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[9px] sm:text-[10.5px] font-mono bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-slate-800 text-slate-400">
          <span className="truncate">{new Date().toISOString()} • UTC+05:30</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
            Privacy Protected (Zero PII Retained)
          </span>
        </div>
      </div>
    </div>
  );
};
