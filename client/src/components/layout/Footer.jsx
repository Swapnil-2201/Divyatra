import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PhoneCall, Compass, Heart, Award, ArrowUpRight } from 'lucide-react';
import { Logo } from '../common/Logo';

export const Footer = () => {
  return (
    <footer className="bg-[#102A56] text-white border-t border-[#1B3B74] pt-10 sm:pt-16 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-8 sm:pb-12 border-b border-white/10">
          
          {/* Brand & Purpose Column */}
          <div className="sm:col-span-2 space-y-4">
            <Logo theme="dark" size="lg" />

            <p className="text-sm text-gray-300 leading-relaxed pr-0 sm:pr-6">
              DivYatra is Gujarat's official online temple bookings and pilgrimage platform. Empowering millions of devotees with guaranteed contactless Darshan slot reservations, live sanctum telemetry, AI yatra planning, and direct temple trust prasad delivery.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-xs text-gray-200">
                <ShieldCheck className="w-4 h-4 text-[#D5A63A]" />
                <span>Temple Trust Certified</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-xs text-gray-200">
                <Award className="w-4 h-4 text-[#E97820]" />
                <span>Govt. of Gujarat Partner</span>
              </div>
            </div>
          </div>

          {/* Pilgrimage Shrines */}
          <div>
            <h4 className="font-serif text-base font-bold text-[#D5A63A] tracking-wider uppercase mb-4">
              Sacred Shrines
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/temples/somnath" className="hover:text-[#E97820] transition-colors flex items-center gap-1.5">
                  <span>Shree Somnath Jyotirlinga</span>
                </Link>
              </li>
              <li>
                <Link to="/temples/dwarka" className="hover:text-[#E97820] transition-colors flex items-center gap-1.5">
                  <span>Shree Dwarkadhish (Jagat Mandir)</span>
                </Link>
              </li>
              <li>
                <Link to="/temples/ambaji" className="hover:text-[#E97820] transition-colors flex items-center gap-1.5">
                  <span>Shree Ambaji Shaktipeeth</span>
                </Link>
              </li>
              <li>
                <Link to="/temples/pavagadh" className="hover:text-[#E97820] transition-colors flex items-center gap-1.5">
                  <span>Shree Pavagadh Mahakali</span>
                </Link>
              </li>
              <li>
                <Link to="/temples" className="text-[#D5A63A] hover:underline text-xs font-semibold pt-1 inline-block">
                  View All Pilgrimage Sites &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Smart Features */}
          <div>
            <h4 className="font-serif text-base font-bold text-[#D5A63A] tracking-wider uppercase mb-4">
              Smart Features
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/live-crowd" className="hover:text-[#E97820] transition-colors">
                  Live Crowd Telemetry
                </Link>
              </li>
              <li>
                <Link to="/plan-yatra" className="hover:text-[#E97820] transition-colors">
                  AI Yatra Itinerary Planner
                </Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-[#E97820] transition-colors">
                  Darshan Slot Pass Booking
                </Link>
              </li>
              <li>
                <Link to="/prasad" className="hover:text-[#E97820] transition-colors">
                  Sanctified Mahaprasad Store
                </Link>
              </li>
              <li>
                <Link to="/DivyatraAdministration" className="hover:text-[#E97820] transition-colors flex items-center gap-1">
                  <span>Authority Command Center</span>
                  <ArrowUpRight className="w-3 h-3 text-[#D5A63A]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Helpline Support */}
          <div>
            <h4 className="font-serif text-base font-bold text-[#E97820] tracking-wider uppercase mb-4 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#E97820]" />
              24x7 Helplines
            </h4>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="block text-[11px] text-gray-400">State Disaster Management</span>
                <span className="text-sm font-bold text-white tracking-wider">Toll-Free: 1070</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="block text-[11px] text-gray-400">Police & Temple Security</span>
                <span className="text-sm font-bold text-white tracking-wider">Emergency: 112 / 100</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="block text-[11px] text-gray-400">Ambulance & Medical Post</span>
                <span className="text-sm font-bold text-white tracking-wider">Medical: 108</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 text-center sm:text-left">
          <p>© {new Date().getFullYear()} DivYatra Platform. Designed for Temple Pilgrims & Shrine Trusts.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Darshan Guidelines</span>
            <span className="hover:text-white cursor-pointer">CCTV Privacy Charter</span>
            <Link to="/DivyatraAdministration" className="text-[#D5A63A] hover:underline font-medium">
              Trustee & Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
