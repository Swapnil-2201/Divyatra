import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Sparkles,
  ShieldCheck,
  Flame,
  Award,
  Users,
  Clock
} from 'lucide-react';

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const data = await api.getAnalytics();
      setAnalytics(data);
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#D5A63A]">
              Predictive Telemetry & Big Data
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
              94.8% AI Model Accuracy
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Pilgrimage Intelligence & Footfall Analytics
          </h1>
        </div>
      </div>

      {/* Analytics Summary Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0B172B] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Monthly Footfall</span>
          <strong className="font-serif text-xl sm:text-2xl font-bold text-white block">1.48M Devotees</strong>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12.4% vs last month
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0B172B] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Avg Wait Across Shrines</span>
          <strong className="font-serif text-xl sm:text-2xl font-bold text-[#E97820] block">28.4 mins</strong>
          <span className="text-[11px] text-emerald-400">Reduced from 65m baseline</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0B172B] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">E-Darshan Slot Adoption</span>
          <strong className="font-serif text-xl sm:text-2xl font-bold text-[#D5A63A] block">86% Quota</strong>
          <span className="text-[11px] text-slate-400">Over 38,000 digital passes today</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0B172B] border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Incidents Resolved</span>
          <strong className="font-serif text-xl sm:text-2xl font-bold text-emerald-400 block">100% Rate</strong>
          <span className="text-[11px] text-slate-400">Zero safety escalation</span>
        </div>
      </div>

      {/* Chart 1: Daily Footfall Trends Across Shrines */}
      <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-white">
              Weekly Footfall Distribution (Somnath, Dwarka, Ambaji, Pavagadh)
            </h3>
            <p className="text-xs text-slate-400">Devotees counted per day across all four target pilgrimage hubs</p>
          </div>
        </div>

        <div className="h-64 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.dailyFootfallTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#07111F', border: '1px solid #334155', borderRadius: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="somnath" name="Somnath" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="dwarka" name="Dwarka" fill="#E97820" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ambaji" name="Ambaji" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pavagadh" name="Pavagadh" fill="#D5A63A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Hourly Darshan Throughput vs Waiting Times */}
      <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-white">
              Hourly Sanctum Throughput & Queue Delay
            </h3>
            <p className="text-xs text-slate-400">Correlation between Darshan clearance speed and queue waiting time</p>
          </div>
        </div>

        <div className="h-64 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.darshanThroughputByHour || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#07111F', border: '1px solid #334155', borderRadius: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="rate" name="Pilgrims Cleared/Hr" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey="waitTime" name="Queue Delay (Mins)" stroke="#E97820" fill="#E97820" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Festival Surge Predictive Modeling */}
      <div className="bg-[#0B172B] rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Flame className="w-5 h-5 text-[#E97820]" />
          <h3 className="font-serif text-base sm:text-lg font-bold text-white">
            Upcoming Festival Surge Prediction & Marshalling Rosters
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {(analytics?.festivalSurgeForecast || []).map((f, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <strong className="text-xs font-bold text-white block">{f.festival}</strong>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Multiplier:</span>
                <span className="font-bold text-lg text-[#E97820] font-serif">{f.expectedMultiplier}</span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-400">Risk Profile:</span>
                <span className="text-red-400 font-bold">{f.riskLevel}</span>
              </div>
              <div className="text-[11px] text-emerald-400 pt-1 border-t border-slate-800">
                Recommended Staff: {f.recommendedMarshals} Marshals
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
