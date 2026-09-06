import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useBand } from '../context/BandContext';
import { X, CheckCircle2, QrCode, ShieldCheck, Ticket, Calendar, Clock, MapPin, Users } from 'lucide-react';

export const PassDetailsModal = () => {
  const {
    selectedPassModal,
    setSelectedPassModal,
    passStatus,
    acknowledgeCurrentPass,
  } = useBand();

  if (!selectedPassModal) return null;

  const pass = selectedPassModal;
  const isAcknowledged = passStatus === 'PASS_ACTIVE' || pass.status === 'ACTIVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-[#D5A63A]/40 rounded-3xl p-6 shadow-2xl space-y-5 text-white animate-scaleUp">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E97820]/20 border border-[#E97820]/40 flex items-center justify-center text-[#E97820]">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-white">
                Sacred Darshan E-Pass
              </h3>
              <span className="text-[10.5px] font-mono text-slate-400">
                Synchronized Smart Band Pass #{pass.bookingId}
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedPassModal(null)}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center QR Code */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner border border-slate-200 text-slate-900 space-y-2">
          <QRCodeSVG
            value={pass.qrPayload || pass.bookingId}
            size={180}
            level="H"
            includeMargin={true}
          />
          <div className="text-center">
            <span className="text-[11px] font-mono font-bold text-slate-700 block">
              GATE TURNSTILE SCAN PASS
            </span>
            <span className="text-[9.5px] font-mono text-slate-500">
              {pass.bookingId}
            </span>
          </div>
        </div>

        {/* Pass Details Table */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#E97820]" />
              Temple Shrine
            </span>
            <strong className="text-white text-right">{pass.templeName}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D5A63A]" />
              Sacred Date
            </span>
            <strong className="text-white">{pass.date}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Darshan Slot
            </span>
            <strong className="text-white">{pass.slot?.split('(')[0] || pass.slot}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Devotees
            </span>
            <strong className="text-white">{pass.pilgrims} Pax ({pass.leadPilgrim})</strong>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-mono">
            <span className="text-slate-400">Sync Status:</span>
            <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
              isAcknowledged
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-[#E97820]/20 text-[#E97820] border border-[#E97820]/30'
            }`}>
              {isAcknowledged ? 'PASS ACTIVE ✓' : 'PASS ISSUED (PENDING ACK)'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        {!isAcknowledged ? (
          <button
            onClick={() => {
              acknowledgeCurrentPass();
              setSelectedPassModal(null);
            }}
            className="w-full py-3 rounded-xl bg-[#E97820] hover:bg-[#D36A18] text-white font-bold text-xs tracking-wider shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ACKNOWLEDGE ON SMART BAND</span>
          </button>
        ) : (
          <button
            onClick={() => setSelectedPassModal(null)}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider transition-colors"
          >
            Close Viewer
          </button>
        )}
      </div>
    </div>
  );
};
