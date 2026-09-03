import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { QRViewer } from '../components/common/QRViewer';
import {
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  History,
  ArrowRight,
  Ticket,
} from 'lucide-react';

export const ConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const passId = searchParams.get('id');

  const { confirmedBookings, activePass, setActivePass, saveConfirmedBooking } = useBooking();
  const { user } = useAuth();

  const [fetchedBooking, setFetchedBooking] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch specific booking if ID is in URL
  useEffect(() => {
    if (passId) {
      const match = confirmedBookings.find((b) => b.bookingId === passId);
      if (match) {
        setFetchedBooking(match);
        setActivePass(match);
      } else {
        setLoading(true);
        api
          .getBookingById(passId)
          .then((data) => {
            if (data) {
              setFetchedBooking(data);
              setActivePass(data);
              saveConfirmedBooking(data);
            }
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      }
    }
  }, [passId]);

  // Fetch authenticated user booking history
  useEffect(() => {
    if (user?.email || user?.id) {
      api
        .getUserBookings()
        .then((list) => {
          if (Array.isArray(list) && list.length > 0) {
            setUserHistory(list);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const currentBooking =
    fetchedBooking || activePass || confirmedBookings[0] || userHistory[0] || null;

  return (
    <div className="min-h-screen bg-[#F8F5EF] py-12 sm:py-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-600 mx-auto shadow-md animate-scaleUp">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Darshan Slot Confirmed</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-[#102A56]">
            Your Sacred E-Darshan Pass
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Your pass has been securely confirmed on the Temple Trust Central Node. Present the scannable QR barcode at Smart Gate 1 turnstiles.
          </p>
        </div>

        {/* Multi-pass selector if user has multiple bookings */}
        {confirmedBookings.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 touch-scroll no-scrollbar">
            <span className="text-xs font-bold text-gray-500 shrink-0">Recent Passes:</span>
            {confirmedBookings.map((b) => (
              <button
                key={b.bookingId}
                onClick={() => {
                  setActivePass(b);
                  setFetchedBooking(b);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all min-h-[36px] ${
                  currentBooking?.bookingId === b.bookingId
                    ? 'bg-[#102A56] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-[#EBE4D5] hover:bg-gray-50'
                }`}
              >
                {b.templeName.split(' ')[1] || b.templeName} ({b.bookingId})
              </button>
            ))}
          </div>
        )}

        {/* Verified QR Pass Container */}
        {currentBooking ? (
          <QRViewer booking={currentBooking} />
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-3xl text-center space-y-4 border border-[#E5DED0]">
            <p className="text-sm text-gray-500">No active bookings found.</p>
            <Link to="/booking" className="px-5 py-2.5 bg-[#E97820] text-white rounded-xl text-xs font-bold inline-block min-h-[44px]">
              Book a Darshan Pass
            </Link>
          </div>
        )}

        {/* User Booking History Section */}
        {userHistory.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E5DED0] p-4 sm:p-8 shadow-luxury space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EBE4D5]">
              <History className="w-5 h-5 text-[#E97820]" />
              <h3 className="font-serif text-lg font-bold text-[#102A56]">
                Devotee Pass History ({userHistory.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userHistory.map((b) => (
                <div
                  key={b.bookingId}
                  onClick={() => {
                    setActivePass(b);
                    setFetchedBooking(b);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    currentBooking?.bookingId === b.bookingId
                      ? 'border-[#E97820] bg-[#FFFBF7] shadow-sm'
                      : 'border-[#EBE4D5] bg-[#FAF8F5] hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <strong className="text-xs font-bold text-[#102A56] block truncate pr-2">{b.templeName}</strong>
                    <span className="text-[10px] font-mono font-bold text-[#E97820] shrink-0">{b.bookingId}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10.5px] sm:text-[11px] text-gray-500 mt-2">
                    <span>📅 {b.date}</span>
                    <span>⏰ {b.timeSlot?.split('(')[0] || b.timeSlot}</span>
                    <span>👥 {b.pilgrimCount} pax</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Temple Entry Guidelines & Protocols */}
        <div className="bg-white rounded-3xl border border-[#E5DED0] p-4 sm:p-8 shadow-luxury space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EBE4D5]">
            <ShieldCheck className="w-5 h-5 text-[#E97820]" />
            <h3 className="font-serif text-lg font-bold text-[#102A56]">
              Pilgrimage Entry Guidelines
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs text-slate-700">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-1">
              <strong className="text-[#102A56] block">1. Arrival Window</strong>
              <p className="text-gray-500">Please arrive 15 minutes prior to your allocated slot for seamless RFID turnstile scanning.</p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-1">
              <strong className="text-[#102A56] block">2. Dress Code Protocol</strong>
              <p className="text-gray-500">Traditional Indian attire is recommended (Dhoti/Kurta for men, Saree/Salwar for women).</p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-1">
              <strong className="text-[#102A56] block">3. Automated Lockers</strong>
              <p className="text-gray-500">Free secure automated lockers available at Gate 1 and Gate 3 for mobile phones & footwear.</p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-1">
              <strong className="text-[#102A56] block">4. Mahaprasad Counter</strong>
              <p className="text-gray-500">Show this E-Pass QR code at Prasad Counter 1 for immediate consecrated box collection.</p>
            </div>
          </div>
        </div>

        {/* Action Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-4">
          <Link
            to="/live-crowd"
            className="text-xs font-bold text-[#102A56] hover:text-[#E97820] flex items-center justify-center sm:justify-start gap-1.5 min-h-[44px]"
          >
            <span>Monitor Live Sanctum Crowd Telemetry</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <Link
            to="/temples"
            className="px-6 py-3 rounded-xl bg-[#102A56] hover:bg-[#1B3B74] text-white text-xs font-bold shadow-md transition-colors min-h-[44px] flex items-center justify-center text-center"
          >
            Explore More Sacred Shrines
          </Link>
        </div>
      </div>
    </div>
  );
};
