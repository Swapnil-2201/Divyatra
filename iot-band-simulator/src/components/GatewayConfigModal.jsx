import React, { useState } from 'react';
import { useBand } from '../context/BandContext';
import { iotApi } from '../services/iotApi';
import {
  Globe,
  Radio,
  Server,
  Zap,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  ExternalLink,
  Laptop,
} from 'lucide-react';

export const GatewayConfigModal = ({ isOpen, onClose }) => {
  const { gatewayUrl, updateGateway, gatewayHealth } = useBand();
  const [customInput, setCustomInput] = useState(gatewayUrl || '/api');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const presets = [
    {
      id: 'same-origin',
      label: 'Automatic / Vercel Serverless',
      url: '/api',
      desc: 'Connects directly to the host Vercel serverless /api endpoints',
      icon: Globe,
    },
    {
      id: 'divyatra-cloud',
      label: 'DivYatra Main Cloud',
      url: 'https://divyatra.vercel.app/api',
      desc: 'Connects to production DivYatra cloud backend deployment',
      icon: Zap,
    },
    {
      id: 'localhost',
      label: 'Localhost Mesh Daemon',
      url: 'http://localhost:5001/api',
      desc: 'Connects to local Express & Socket.IO server on port 5001',
      icon: Laptop,
    },
  ];

  const handleTestConnection = async (targetUrl) => {
    setTesting(true);
    setTestResult(null);
    try {
      const urlToTest = (targetUrl || customInput || '/api').trim().replace(/\/+$/, '');
      const start = performance.now();
      const res = await fetch(`${urlToTest}/iot/bands`, {
        signal: AbortSignal.timeout(4000),
      });
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        setTestResult({ success: true, latency, message: `Connected successfully (${latency}ms roundtrip)` });
      } else {
        setTestResult({ success: false, status: res.status, message: `HTTP ${res.status} error from gateway` });
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message || 'Connection timed out or network error' });
    } finally {
      setTesting(false);
    }
  };

  const handleApply = (url) => {
    const finalUrl = (url || customInput || '/api').trim();
    updateGateway(finalUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#121826] border border-amber-500/30 rounded-3xl p-6 max-w-lg w-full text-slate-200 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">IoT Mesh Gateway Settings</h3>
              <p className="text-xs text-slate-400">Dynamic backend & telemetry routing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Status */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Active Gateway Target</span>
            <strong className="text-xs font-mono text-amber-300 truncate block max-w-[280px]">
              {gatewayUrl || '/api'}
            </strong>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{gatewayHealth.latencyMs || 24}ms</span>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">Connection Presets</span>
          <div className="grid grid-cols-1 gap-2">
            {presets.map((p) => {
              const Icon = p.icon;
              const isSelected = customInput === p.url;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setCustomInput(p.url);
                    handleTestConnection(p.url);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-amber-500/80 bg-amber-500/10 shadow-lg'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-medium text-white">{p.label}</strong>
                      <span className="text-[10px] font-mono text-slate-400">{p.url}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">Custom Endpoint URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. https://your-domain.vercel.app/api"
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500/80"
            />
            <button
              type="button"
              disabled={testing}
              onClick={() => handleTestConnection(customInput)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-amber-400' : ''}`} />
              <span>Ping</span>
            </button>
          </div>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-fadeIn ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-mono text-[11px]">{testResult.message}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              setCustomInput('/api');
              handleApply('/api');
            }}
            className="text-xs text-slate-400 hover:text-slate-200 underline transition-colors"
          >
            Reset to Default (/api)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleApply(customInput)}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
            >
              Connect Gateway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
