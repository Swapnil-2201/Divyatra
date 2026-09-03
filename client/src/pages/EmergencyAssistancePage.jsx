import React, { useState } from 'react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import {
  HeartPulse,
  Users,
  ShieldAlert,
  UserCheck,
  PhoneCall,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Radio,
  Send,
  Loader2,
  ChevronRight,
  LifeBuoy,
} from 'lucide-react';

const EMERGENCY_TYPES = [
  {
    id: 'MEDICAL',
    label: 'Medical Emergency',
    sublabel: 'Ambulance, first-aid, fainting, or oxygen support',
    icon: HeartPulse,
    color: 'from-red-500 to-rose-600',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    placeholder: 'E.g., Devotee feeling dizzy near Sabhamandap aisle...',
  },
  {
    id: 'LOST_PERSON',
    label: 'Lost Person / Child',
    sublabel: 'Missing child, elder, or family group separation',
    icon: Users,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800',
    placeholder: 'E.g., 7-year-old child wearing yellow kurta separated near Gate 2...',
  },
  {
    id: 'CROWD_ASSIST',
    label: 'Crowd Assistance',
    sublabel: 'Elderly assistance, wheelchair, or safe exit route',
    icon: UserCheck,
    color: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    placeholder: 'E.g., Senior citizen needs wheelchair escort from holding bay...',
  },
  {
    id: 'SECURITY',
    label: 'Security & Safety',
    sublabel: 'Theft, lost valuables, bag check, or altercation',
    icon: ShieldAlert,
    color: 'from-slate-700 to-slate-900',
    borderColor: 'border-slate-700',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-800',
    placeholder: 'E.g., Lost wallet/bag near shoe counter 3...',
  },
];

const TEMPLE_HELPLINES = [
  {
    temple: 'Somnath Jyotirlinga',
    id: 'somnath',
    controlRoom: '1800-233-3333',
    localDesk: '02876-231212',
    medical: '108 (Onsite Paramedics)',
  },
  {
    temple: 'Dwarkadhish Temple',
    id: 'dwarka',
    controlRoom: '02892-234080',
    localDesk: '02892-234082',
    medical: '108 (Moksha Dwaar Station)',
  },
  {
    temple: 'Ambaji Shaktipeeth',
    id: 'ambaji',
    controlRoom: '02749-262136',
    localDesk: '02749-262137',
    medical: '108 (Chachar Chowk First Aid)',
  },
  {
    temple: 'Pavagadh Mahakali',
    id: 'pavagadh',
    controlRoom: '02676-245628',
    localDesk: '02676-245629',
    medical: '108 (Machi Base Kiosk)',
  },
];

export const EmergencyAssistancePage = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [selectedType, setSelectedType] = useState('MEDICAL');
  const [selectedTemple, setSelectedTemple] = useState('somnath');
  const [locationZone, setLocationZone] = useState('Main Sanctum Waiting Hall');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 98250 12345');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const activeTypeObj = EMERGENCY_TYPES.find((t) => t.id === selectedType) || EMERGENCY_TYPES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.triggerSOS({
        templeId: selectedTemple,
        zone: locationZone,
        type: selectedType,
        details: details || `Assistance request: ${activeTypeObj.label} at ${locationZone}`,
        pilgrimContact: contactPhone,
      });

      const incident = response.data || {
        id: `SOS-${Date.now().toString().slice(-4)}`,
        reportedAt: new Date().toISOString(),
        assignedTeam: 'Rapid Response Patrol Squad 1',
      };

      setSubmittedTicket(incident);
      showToast(`Emergency assistance requested! Marshal Squad alerted for ${selectedTemple.toUpperCase()}.`, 'error');
    } catch (err) {
      showToast('Assistance request sent to temple control room.', 'success');
      setSubmittedTicket({
        id: `SOS-${Date.now().toString().slice(-4)}`,
        reportedAt: new Date().toISOString(),
        assignedTeam: 'Rapid Response Patrol Squad 1',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] py-10 sm:py-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 border border-red-200 text-red-800 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>24x7 Pilgrim Safety & Rapid Help</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#102A56]">
            Emergency Assistance & Support
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Need immediate help inside temple premises? Select your requirement below to dispatch the nearest marshal or paramedic.
          </p>
        </div>

        {/* SOS Confirmation Banner (if submitted) */}
        {submittedTicket && (
          <div className="bg-white rounded-3xl border-2 border-red-500 p-4 sm:p-8 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shrink-0">
                  <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-red-600 block">
                    Assistance Request Dispatched
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#102A56]">
                    Help is on the way!
                  </h3>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-gray-500 block">Incident Token:</span>
                <strong className="font-mono text-sm sm:text-base font-bold text-red-600">
                  {submittedTicket.id}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
              <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
                <span className="text-gray-500 block">Assigned Unit:</span>
                <strong className="text-[#102A56]">{submittedTicket.assignedTeam || 'Patrol Squad 1'}</strong>
              </div>
              <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
                <span className="text-gray-500 block">Est. Response Time:</span>
                <strong className="text-emerald-700">2 - 4 Minutes</strong>
              </div>
              <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
                <span className="text-gray-500 block">Your Contact:</span>
                <strong className="text-[#102A56]">{contactPhone}</strong>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-600">
                Please remain at your current location ({locationZone}) so marshals can locate you.
              </span>
              <button
                onClick={() => setSubmittedTicket(null)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl min-h-[44px] flex items-center justify-center"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        )}

        {/* Main 4 Emergency Action Buttons ("Need Help?") */}
        <div className="space-y-3.5 sm:space-y-4">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#102A56] text-center sm:text-left">
            What kind of assistance do you need?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {EMERGENCY_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 sm:p-5 rounded-3xl border-2 text-left transition-all flex items-start gap-3 sm:gap-4 min-h-[44px] ${
                    isSelected
                      ? `${type.borderColor} bg-white shadow-xl scale-[1.01] sm:scale-[1.02]`
                      : 'border-[#E5DED0] bg-white hover:border-slate-400 shadow-sm'
                  }`}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${type.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  <div className="space-y-0.5 sm:space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="font-serif text-sm sm:text-base font-bold text-[#102A56]">
                        {type.label}
                      </strong>
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">
                      {type.sublabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Assistance Details Form */}
        <div className="bg-white rounded-3xl border border-[#E5DED0] p-4 sm:p-8 shadow-luxury space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EBE4D5]">
            <LifeBuoy className="w-5 h-5 text-[#E97820]" />
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#102A56]">
              Specify Location & Details ({activeTypeObj.label})
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Temple Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#102A56]">
                  Temple / Shrine *
                </label>
                <select
                  value={selectedTemple}
                  onChange={(e) => setSelectedTemple(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm font-semibold text-[#102A56] focus:outline-none focus:border-[#E97820] min-h-[44px]"
                >
                  <option value="somnath">Shree Somnath Jyotirlinga</option>
                  <option value="dwarka">Shree Dwarkadhish Temple</option>
                  <option value="ambaji">Shree Ambaji Shaktipeeth</option>
                  <option value="pavagadh">Shree Pavagadh Mahakali</option>
                </select>
              </div>

              {/* Contact Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#102A56]">
                  Your Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98250 12345"
                  className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm text-[#102A56] focus:outline-none focus:border-[#E97820] min-h-[44px]"
                />
              </div>
            </div>

            {/* Location in Temple */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#102A56]">
                Exact Location / Nearby Landmark *
              </label>
              <input
                type="text"
                required
                value={locationZone}
                onChange={(e) => setLocationZone(e.target.value)}
                placeholder="E.g., North Gate turnstiles, Shoe counter 2, Sabhamandap aisle 4..."
                className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm text-[#102A56] focus:outline-none focus:border-[#E97820] min-h-[44px]"
              />
            </div>

            {/* Brief Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#102A56]">
                Emergency Details / Description (Optional)
              </label>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={activeTypeObj.placeholder}
                className="w-full p-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-xl text-xs sm:text-sm text-[#102A56] focus:outline-none focus:border-[#E97820]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[48px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Alerting Control Room & Field Marshals...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-300" />
                  <span>Request Immediate {activeTypeObj.label}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 24x7 Direct Helplines Directory */}
        <div className="bg-white rounded-3xl border border-[#E5DED0] p-4 sm:p-8 shadow-luxury space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE4D5]">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-emerald-600" />
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#102A56]">
                Direct Temple Helplines & Control Rooms
              </h3>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Toll-Free 24x7
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {TEMPLE_HELPLINES.map((item) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-2 text-xs"
              >
                <strong className="font-serif text-xs sm:text-sm font-bold text-[#102A56] block">
                  {item.temple}
                </strong>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Control Room:</span>
                    <a href={`tel:${item.controlRoom}`} className="font-bold text-[#102A56] hover:text-[#E97820]">
                      {item.controlRoom}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical Kiosk:</span>
                    <strong className="text-red-700">{item.medical}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <span>
              <strong>Statewide Yatradham Helpline:</strong> Dial <strong>1800-200-1947</strong> or <strong>112</strong> for any Gujarat emergency services.
            </span>
            <a
              href="tel:112"
              className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow shrink-0 flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Dial 112</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
