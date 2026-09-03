import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Layers, HardDrive, Zap, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * @component PerformanceMonitor
 * @description Telemetry HUD for 3D digital twin performance auditing.
 * Shows FPS, draw calls, triangle count, geometry memory, streaming load latency, and Cache API status.
 * Enabled by default to provide parity between localhost and production.
 */
export const PerformanceMonitor = ({ telemetry = {} }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('perf=false') || localStorage.getItem('divyatra_perf') === 'false') {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    }
  }, []);

  if (!isVisible) return null;

  const {
    fps = 60,
    triangles = 0,
    drawCalls = 0,
    geometries = 0,
    textures = 0,
    timeToFirstRender = null,
    timeToFullLoad = null,
    cacheStatus = 'CHECKING',
    activeStage = 'INIT',
    modelSizeMb = 0
  } = telemetry;

  return (
    <div className="absolute top-14 left-3 z-30 font-mono text-[10.5px] pointer-events-auto select-none transition-all">
      <div className="bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-2xl text-cyan-200 overflow-hidden min-w-[210px]">
        {/* Header Bar */}
        <div
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center justify-between px-2.5 py-1.5 bg-cyan-950/40 border-b border-cyan-500/20 cursor-pointer hover:bg-cyan-900/30 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="font-bold tracking-wider text-cyan-300">3D TELEMETRY</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
              fps >= 55 ? 'bg-emerald-500/20 text-emerald-300' : fps >= 30 ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {fps} FPS
            </span>
            {isExpanded ? <ChevronUp className="w-3 h-3 text-cyan-400" /> : <ChevronDown className="w-3 h-3 text-cyan-400" />}
          </div>
        </div>

        {/* Collapsible Body */}
        {isExpanded && (
          <div className="p-2.5 space-y-2">
            {/* Stage & Cache Badge */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-1 rounded bg-black/40 border border-white/5">
                <span className="text-[9px] text-gray-400 block">Stage</span>
                <span className={`font-bold text-[10px] ${
                  activeStage === 'HIGH_RES' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {activeStage === 'HIGH_RES' ? '⚡ 1.94M ULTRA' : '🚀 PROXY'}
                </span>
              </div>
              <div className="p-1 rounded bg-black/40 border border-white/5">
                <span className="text-[9px] text-gray-400 block">Asset Source</span>
                <span className={`font-bold text-[10px] ${
                  cacheStatus.includes('HIT') ? 'text-emerald-400' : 'text-cyan-300'
                }`}>
                  {cacheStatus}
                </span>
              </div>
            </div>

            {/* Geometry & Calls */}
            <div className="space-y-1 pt-1 border-t border-white/10">
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-1 text-[10px]">
                  <Cpu className="w-3 h-3 text-gray-400" /> Triangles:
                </span>
                <strong className="text-white font-bold">{triangles > 0 ? triangles.toLocaleString() : '—'}</strong>
              </div>

              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-1 text-[10px]">
                  <Layers className="w-3 h-3 text-gray-400" /> Draw Calls:
                </span>
                <strong className="text-white font-bold">{drawCalls}</strong>
              </div>

              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-1 text-[10px]">
                  <HardDrive className="w-3 h-3 text-gray-400" /> Geo / Tex:
                </span>
                <strong className="text-white font-bold">{geometries} / {textures}</strong>
              </div>

              {modelSizeMb > 0 && (
                <div className="flex justify-between items-center text-gray-300">
                  <span className="text-[10px] text-gray-400">Payload:</span>
                  <span className="text-cyan-300 font-bold">{modelSizeMb} MB</span>
                </div>
              )}
            </div>

            {/* Latency Timers */}
            <div className="space-y-1 pt-1 border-t border-white/10 text-[9.5px]">
              <div className="flex justify-between text-gray-400">
                <span>First 3D Render:</span>
                <span className="text-emerald-400 font-bold">
                  {timeToFirstRender ? `${timeToFirstRender}ms` : 'Measuring...'}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Full Model Stream:</span>
                <span className="text-emerald-400 font-bold">
                  {timeToFullLoad ? `${timeToFullLoad}ms` : 'Streaming...'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
