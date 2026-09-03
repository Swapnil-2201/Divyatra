import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, Share2, CheckCircle2, ShieldCheck, Calendar, Clock, Users, MapPin, Sparkles, Check } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const QRViewer = ({ booking }) => {
  const { showToast } = useNotification();
  const passRef = useRef(null);

  if (!booking) return null;

  const {
    bookingId,
    templeName,
    date,
    timeSlot,
    pilgrimCount,
    leadPilgrim,
    qrCodeData,
    facilities = [],
    specialQueue,
    amountPaid,
    status = 'confirmed',
  } = booking;

  // Build clean, scannable QR payload containing booking ID, temple, date, slot, number of pilgrims
  const scannableQrPayload =
    qrCodeData ||
    JSON.stringify({
      bookingId,
      temple: templeName,
      date,
      slot: timeSlot,
      pilgrims: pilgrimCount,
      leadPilgrim: leadPilgrim?.name || 'Devotee',
      status: (status || 'confirmed').toUpperCase(),
      service: 'DivYatra Smart Pilgrimage Platform',
    });

  const handleDownload = () => {
    showToast(`Digital E-Pass ${bookingId} downloaded to device!`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `DivYatra Darshan Pass - ${bookingId}`,
          text: `Confirmed Darshan Slot at ${templeName} on ${date} (${timeSlot}) for ${pilgrimCount} Devotee(s).`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Pass link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Printable / Viewable Pass Card */}
      <div
        ref={passRef}
        className="bg-white rounded-3xl border-2 border-[#D5A63A] p-4 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Sacred Watermark Emblem */}
        <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none">
          <svg viewBox="0 0 24 24" className="w-80 h-80 fill-[#102A56]">
            <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 3.3L17.5 8 12 11.2 6.5 8 12 5.3zm-6 4.3l5 2.9v5.8l-5-3.1V9.6zm7 8.7v-5.8l5-2.9v5.6l-5 3.1z" />
          </svg>
        </div>

        {/* Pass Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-[#EBE4D5] gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-black text-[#102A56] tracking-wider">
                DIV<span className="text-[#E97820]">YATRA</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                VERIFIED E-PASS
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">Gujarat Sacred Shrines Official E-Darshan Pass</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase tracking-widest block">Booking Reference</span>
            <span className="font-mono text-base sm:text-lg font-bold text-[#E97820] tracking-wider">{bookingId}</span>
          </div>
        </div>

        {/* Pass Body: Info + QR Code */}
        <div className="py-4 sm:py-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="text-[11px] text-gray-500 uppercase tracking-wider">Pilgrimage Shrine</span>
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#102A56] leading-snug">
                {templeName}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F5EF] border border-[#EBE4D5]">
                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#E97820]" />
                  <span>Darshan Date</span>
                </div>
                <strong className="text-sm font-bold text-[#102A56] block">{date}</strong>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F5EF] border border-[#EBE4D5]">
                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#E97820]" />
                  <span>Time Slot</span>
                </div>
                <strong className="text-sm font-bold text-[#102A56] block">{timeSlot}</strong>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F5EF] border border-[#EBE4D5]">
                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                  <Users className="w-3.5 h-3.5 text-[#E97820]" />
                  <span>Devotees</span>
                </div>
                <strong className="text-sm font-bold text-[#102A56] block">{pilgrimCount} Person(s)</strong>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F5EF] border border-[#EBE4D5]">
                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0D8259]" />
                  <span>Lead Pilgrim</span>
                </div>
                <strong className="text-sm font-bold text-[#102A56] truncate block">{leadPilgrim?.name || 'Ramesh Patel'}</strong>
              </div>
            </div>

            {facilities && facilities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {facilities.map((fac, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-[#FAF8F5] border border-[#EBE4D5] rounded-md text-[10.5px] text-slate-600 font-medium">
                    ✓ {fac}
                  </span>
                ))}
              </div>
            )}

            <div className="text-[11px] text-[#64748B] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#E97820] shrink-0" />
              <span>Present this QR pass at Smart Gate 1 Turnstile for automated RFID entry.</span>
            </div>
          </div>

          {/* QR Code Container (Scannable with all camera apps) */}
          <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border-2 border-dashed border-[#D5A63A] text-center">
            <div className="p-2.5 sm:p-3 bg-white rounded-xl shadow-md border border-gray-200">
              <QRCodeSVG
                value={scannableQrPayload}
                size={150}
                level="H"
                includeMargin={false}
              />
            </div>
            <span className="text-[10.5px] font-mono font-bold text-[#102A56] mt-3 uppercase tracking-wider">
              {bookingId}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">
              • Scannable QR E-Pass
            </span>
          </div>
        </div>

        {/* Pass Footer */}
        <div className="pt-4 border-t border-[#EBE4D5] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 text-center sm:text-left">
          <span>Official Trust Issuance: Verified by DivYatra Core Node</span>
          <span>Status: <strong className="text-[#0D8259] uppercase font-bold">{status || 'CONFIRMED'}</strong></span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        <button
          onClick={handleDownload}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#102A56] text-white hover:bg-[#1B3B74] font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all min-h-[44px]"
        >
          <Download className="w-4 h-4 text-[#D5A63A]" />
          <span>Download PDF Pass</span>
        </button>

        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-[#102A56] text-[#102A56] hover:bg-[#F8F5EF] font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all min-h-[44px]"
        >
          <Printer className="w-4 h-4 text-[#E97820]" />
          <span>Print Physical Pass</span>
        </button>

        <button
          onClick={handleShare}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FAF8F5] border border-gray-300 text-slate-700 hover:bg-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-h-[44px]"
        >
          <Share2 className="w-4 h-4 text-slate-600" />
          <span>Share Pass (WhatsApp / SMS)</span>
        </button>
      </div>
    </div>
  );
};
