import React, { useState } from 'react';
import { ArrowRight, ExternalLink, Navigation, MapPin, Layers, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Temple assets ─────────────────────────────────────────────────────────────
import somnathImg from '../../assets/somnath.jpg';
import dwarkadhishImg from '../../assets/dwarkadhish.jpg';
import ambajiImg from '../../assets/ambaji.jpg';
import pavagadhImg from '../../assets/pavagadh.jpg';

const TEMPLE_PINS = [
  {
    id: 'somnath',
    name: 'Shree Somnath Jyotirlinga',
    shortName: 'Somnath',
    city: 'Veraval, Saurashtra',
    coords: { lat: 20.8880, lng: 70.4012 },
    mapQuery: 'Shree Somnath Jyotirlinga Temple, Veraval, Gujarat',
    x: 42, // % coordinate on Gujarat canvas
    y: 78,
    image: somnathImg,
    wait: '28m',
    crowdPct: 58,
    desc: 'First among the twelve sacred Jyotirlingas of Lord Shiva, situated peacefully on the shores of the Arabian Sea.',
  },
  {
    id: 'dwarka',
    name: 'Shree Dwarkadhish Temple',
    shortName: 'Dwarka',
    city: 'Dwarka, Devbhumi',
    coords: { lat: 22.2376, lng: 68.9678 },
    mapQuery: 'Shree Dwarkadhish Temple, Dwarka, Gujarat',
    x: 20,
    y: 52,
    image: dwarkadhishImg,
    wait: '52m',
    crowdPct: 79,
    desc: 'Char Dham supreme pilgrimage and the sacred ancient golden kingdom of Bhagwan Shree Krishna.',
  },
  {
    id: 'ambaji',
    name: 'Shree Ambaji Mata Temple',
    shortName: 'Ambaji',
    city: 'Banaskantha, North Gujarat',
    coords: { lat: 24.3353, lng: 72.8530 },
    mapQuery: 'Shree Arasuri Ambaji Mata Temple, Banaskantha, Gujarat',
    x: 60,
    y: 20,
    image: ambajiImg,
    wait: '14m',
    crowdPct: 32,
    desc: 'Supreme 51 Shaktipeeth sanctum atop Arasur hills worshiping the miraculous Vishwa Yantra.',
  },
  {
    id: 'pavagadh',
    name: 'Shree Pavagadh Mahakali',
    shortName: 'Pavagadh',
    city: 'Champaner, Central Gujarat',
    coords: { lat: 22.4632, lng: 73.5273 },
    mapQuery: 'Kalika Mata Temple, Pavagadh Hill, Gujarat',
    x: 70,
    y: 58,
    image: pavagadhImg,
    wait: '45m',
    crowdPct: 74,
    desc: 'Historic cliff-top Mahakali Shaktipeeth perched upon the UNESCO World Heritage volcanic summit.',
  },
];

export const InteractiveMap = ({ selectedTempleId, onSelectTemple }) => {
  const [activePin, setActivePin] = useState(selectedTempleId || 'somnath');
  const [viewMode, setViewMode] = useState('embed'); // 'circuit' | 'embed'

  const current = TEMPLE_PINS.find((p) => p.id === activePin) || TEMPLE_PINS[0];

  const handleSelect = (id) => {
    setActivePin(id);
    if (onSelectTemple) onSelectTemple(id);
  };

  // Google Maps Direct Links
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(current.mapQuery)}`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(current.coords.lat + ',' + current.coords.lng)}`;
  
  // Standard Google Maps Embed URL (No API key required)
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(current.mapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="bg-white rounded-3xl border border-[#E5DED0] p-4 sm:p-8 shadow-luxury space-y-4 sm:space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EBE4D5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#E97820]">
              Gujarat Sacred Pilgrimage Circuit
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Google Maps
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#102A56] mt-0.5">
            Interactive Yatra Geographic Network
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View mode toggle */}
          <div className="bg-[#FAF8F5] p-1 rounded-xl border border-[#E5DED0] flex items-center gap-1">
            <button
              onClick={() => setViewMode('embed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'embed'
                  ? 'bg-[#102A56] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#102A56]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#D5A63A]" />
              Google Map Embed
            </button>
            <button
              onClick={() => setViewMode('circuit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'circuit'
                  ? 'bg-[#102A56] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#102A56]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#E97820]" />
              Circuit Overview
            </button>
          </div>

          <Link
            to="/plan-yatra"
            className="text-xs font-bold text-[#102A56] hover:text-[#E97820] flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#EBE4D5] hover:bg-orange-50 transition-colors"
          >
            <span>Multi-Stop Route</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Interactive Map View + Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        
        {/* Map Canvas / Embed Display */}
        <div className="lg:col-span-2 relative aspect-[4/3] min-h-[380px] sm:min-h-[440px] w-full rounded-2xl bg-[#F8F5EF] border border-[#EBE4D5] overflow-hidden flex flex-col">
          
          {viewMode === 'embed' ? (
            <div className="relative w-full h-full flex flex-col">
              {/* Live Google Map Iframe */}
              <iframe
                title={`Google Map - ${current.name}`}
                src={embedUrl}
                className="w-full h-full flex-1 border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Floating Temple Quick-Switch Bar with Images over the Google Map */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E5DED0] shadow-md pointer-events-auto max-w-full">
                  {TEMPLE_PINS.map((pin) => {
                    const isSelected = activePin === pin.id;
                    return (
                      <button
                        key={pin.id}
                        onClick={() => handleSelect(pin.id)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-[#102A56] text-white shadow-sm ring-2 ring-[#E97820]'
                            : 'bg-white hover:bg-orange-50 text-[#102A56] border border-[#E5DED0]'
                        }`}
                      >
                        <img
                          src={pin.image}
                          alt={pin.name}
                          className="w-6 h-6 rounded-full object-cover border border-white shrink-0"
                        />
                        <span className="text-xs font-bold whitespace-nowrap">{pin.shortName}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          isSelected ? 'bg-[#E97820] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {pin.wait}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom bar with Google Maps links */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-auto">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#E97820] hover:bg-[#D36A18] text-white px-3 py-2 rounded-xl shadow-md transition-all hover:scale-105"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            /* Circuit Overview with Geographic Custom Image Markers */
            <div className="relative w-full h-full p-4 flex items-center justify-center bg-gradient-to-b from-[#FAF8F5] to-[#F1EBDD]">
              
              {/* Stylized Gujarat Map Graphic Background */}
              <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 pointer-events-none">
                {/* Gujarat State Outline */}
                <path
                  d="M 20,40 Q 25,20 50,15 Q 75,18 85,35 Q 90,60 70,80 Q 55,90 35,85 Q 15,80 18,55 Z"
                  fill="#EAE3D2"
                  stroke="#D5A63A"
                  strokeWidth="0.8"
                  strokeDasharray="2,2"
                  opacity="0.8"
                />

                {/* Circuit Route Connecting all 4 Temples */}
                <path
                  d="M 42,78 L 20,52 L 60,20 L 70,58 Z"
                  fill="none"
                  stroke="#E97820"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                  className="animate-pulse"
                />
              </svg>

              {/* Geographic Image Markers */}
              {TEMPLE_PINS.map((pin) => {
                const isSelected = activePin === pin.id;
                return (
                  <div
                    key={pin.id}
                    onClick={() => handleSelect(pin.id)}
                    style={{
                      position: 'absolute',
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="cursor-pointer group flex flex-col items-center z-10"
                  >
                    {/* Outer Glow Pulse for Selected */}
                    {isSelected && (
                      <div className="absolute inset-0 w-16 h-16 -top-2 -left-2 rounded-full bg-[#E97820]/30 animate-ping pointer-events-none" />
                    )}

                    {/* Image Circle Pin */}
                    <div
                      className={`relative rounded-full overflow-hidden transition-all duration-300 shadow-lg ${
                        isSelected
                          ? 'w-14 h-14 sm:w-16 sm:h-16 ring-4 ring-[#E97820] scale-110 shadow-orange-500/40'
                          : 'w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-[#102A56] hover:scale-105 opacity-90 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={pin.image}
                        alt={pin.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Label Badge with Wait Time */}
                    <div
                      className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-md transition-all ${
                        isSelected
                          ? 'bg-[#E97820] text-white scale-105'
                          : 'bg-[#102A56] text-white group-hover:bg-[#1B3B74]'
                      }`}
                    >
                      {pin.shortName.toUpperCase()} · {pin.wait}
                    </div>
                  </div>
                );
              })}

              {/* Compass Rose */}
              <div className="absolute top-4 right-4 p-2 rounded-xl bg-white/90 backdrop-blur-sm border border-[#E5DED0] shadow-sm text-center pointer-events-none">
                <span className="text-[10px] font-bold text-[#102A56] block">N ↑</span>
                <span className="text-[8px] font-medium text-gray-500">GUJARAT</span>
              </div>

              {/* Hint badge */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-[#E5DED0] rounded-xl px-3 py-1.5 text-xs text-slate-600 shadow-sm flex items-center gap-1.5 pointer-events-none">
                <Sparkles className="w-3.5 h-3.5 text-[#D5A63A]" />
                <span>Click any shrine image to preview in Google Maps</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Temple Details & Actions Panel */}
        <div className="space-y-4 p-5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] flex flex-col justify-between">
          <div className="space-y-3.5">
            {/* Temple Thumbnail */}
            <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[#E5DED0] shadow-inner group">
              <img
                src={current.image}
                alt={current.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2.5 right-2.5 bg-[#102A56]/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
                Live Occupancy: {current.crowdPct}%
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E97820] block">
                Selected Shrine
              </span>
              <h4 className="font-serif text-xl font-bold text-[#102A56] leading-tight mt-0.5">
                {current.name}
              </h4>
              <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#E97820]" />
                {current.city}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {current.desc}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#E5DED0]">
                <span className="text-[10px] text-gray-400 block font-medium">Sanctum Wait</span>
                <strong className="text-sm font-bold text-[#E97820]">~{current.wait}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E5DED0]">
                <span className="text-[10px] text-gray-400 block font-medium">Flow Status</span>
                <strong className="text-sm font-bold text-[#102A56]">
                  {current.crowdPct > 70 ? 'Busy' : current.crowdPct > 40 ? 'Moderate' : 'Smooth'}
                </strong>
              </div>
            </div>

            {/* Google Maps Direct Navigation Links */}
            <div className="space-y-1.5 pt-1">
              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-[#E5DED0] text-xs font-semibold text-[#102A56] flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#E97820]" />
                  Open in Google Maps
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-[#E5DED0] text-xs font-semibold text-[#102A56] flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  Get Turn-by-Turn GPS Directions
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to={`/temples/${current.id}`}
              className="w-full py-2.5 px-4 rounded-xl bg-[#102A56] text-white hover:bg-[#1B3B74] text-xs font-bold text-center transition-colors min-h-[44px] flex items-center justify-center shadow-sm"
            >
              Explore Temple Details & Live Darshan →
            </Link>
            <Link
              to={`/booking?temple=${current.id}`}
              className="w-full py-2.5 px-4 rounded-xl bg-[#E97820] text-white hover:bg-[#D36A18] text-xs font-bold text-center transition-colors shadow-sm min-h-[44px] flex items-center justify-center"
            >
              Book Darshan Slot
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
