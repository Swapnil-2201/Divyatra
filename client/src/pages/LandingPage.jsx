import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCrowd } from '../context/CrowdContext';
import { TempleCard } from '../components/common/TempleCard';
import { LiveCrowdMeter } from '../components/crowd/LiveCrowdMeter';
import { LiveDarshanPlayer } from '../components/darshan/LiveDarshanPlayer';
import { InteractiveMap } from '../components/interactive/InteractiveMap';
import { HOMEPAGE_HERO_IMAGE, HOMEPAGE_HERO_FALLBACK } from '../data/templeImages';
import {
  Compass,
  Clock,
  ShieldCheck,
  Users,
  Calendar,
  ShoppingBag,
  ArrowRight,
  Activity,
  HeartHandshake,
  Shield,
  TrendingDown,
  MapPin,
  Smartphone,
  Download,
} from 'lucide-react';

const LIVE_STATUS_DATA = [
  { id: 'somnath', name: 'Somnath',  level: 'smooth',   wait: 28, aarti: '07:00 PM' },
  { id: 'dwarka',  name: 'Dwarka',   level: 'moderate',  wait: 45, aarti: '07:30 PM' },
  { id: 'ambaji',  name: 'Ambaji',   level: 'smooth',   wait: 14, aarti: '07:00 PM' },
  { id: 'pavagadh',name: 'Pavagadh', level: 'high',     wait: 52, aarti: '06:30 PM' },
];

const LEVEL_STYLES = {
  smooth:   { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Smooth'   },
  moderate: { dot: 'bg-amber-500',   text: 'text-amber-700',   label: 'Moderate' },
  high:     { dot: 'bg-red-500',     text: 'text-red-600',     label: 'Crowded'  },
};

export const LandingPage = () => {
  const { t } = useTranslation();
  const { temples, crowdData } = useCrowd();

  return (
    <div className="min-h-screen bg-[#F8F5EF]">

      {/* ═══════════════════════════════════════════════════
          1. HERO
      ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] sm:min-h-[88vh] flex items-center overflow-hidden">
        {/* Hero image */}
        <div className="absolute inset-0 z-0">
          <img
            src={HOMEPAGE_HERO_IMAGE}
            alt="Sacred Pilgrimage — Gujarat Temples"
            className="w-full h-full object-cover object-center animate-hero-scale"
            onError={(e) => { e.target.src = HOMEPAGE_HERO_FALLBACK; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#102A56]/90 via-[#102A56]/70 to-[#102A56]/40" />
        </div>

        {/* Hero text — left-aligned, editorial */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 w-full">
          <div className="max-w-2xl space-y-5 sm:space-y-7 animate-fade-up">
            
            <p className="text-[#D5A63A] text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em]">
              {t('hero.badge')}
            </p>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.15] tracking-tight">
              A Safer, Smarter Journey<br />
              <em className="font-serif italic text-[#D5A63A] not-italic" style={{ fontStyle: 'italic' }}>
                to the Divine
              </em>
            </h1>

            <p className="text-sm sm:text-lg text-white/80 leading-relaxed max-w-lg font-light">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
              <Link
                to="/plan-yatra"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-[#E97820] hover:bg-[#D36A18] text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 min-h-[44px]"
              >
                <Compass className="w-4 h-4" />
                {t('hero.ctaPlan')}
              </Link>
              <Link
                to="/temples"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/25 backdrop-blur-sm transition-all min-h-[44px]"
              >
                {t('hero.ctaExplore')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-white/50 text-xs font-medium tracking-wide">
              {t('hero.trustLine')}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          2. LIVE PILGRIMAGE STATUS STRIP
      ═══════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-[#EBE5D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="shrink-0">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#E97820]">
                {t('liveStatus.sectionLabel')}
              </p>
            </div>
            <div className="flex-1 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {(temples && temples.length > 0 ? temples : LIVE_STATUS_DATA).map((temple) => {
                const rawLevel = (temple.crowdLevel || temple.liveStatus?.crowdLevel || 'smooth').toLowerCase();
                const level = rawLevel === 'low' ? 'smooth' : rawLevel === 'moderate' ? 'moderate' : 'high';
                const style = LEVEL_STYLES[level] || LEVEL_STYLES.smooth;
                
                // Real-time telemetry resolution
                const liveOverride = crowdData?.templeOverview?.find(t => t.templeId === temple.id);
                const wait = liveOverride?.avgWait ?? temple.estimatedWait ?? temple.liveStatus?.estimatedWaitMinutes ?? 25;
                const displayName = t(`templeData.${temple.id}.shortName`, {
                  defaultValue: temple.shortName || temple.name?.replace('Shree ', '').replace(' Temple', '').replace(' Jyotirlinga', '') || temple.name,
                });
                const localizedLevelLabel = t(`liveStatus.${level}`, { defaultValue: style.label });

                return (
                  <Link
                    key={temple.id}
                    to={`/temples/${temple.id}`}
                    className="group flex items-center justify-between p-2.5 sm:p-3 rounded-lg border border-[#EBE5D8] hover:border-[#E97820]/30 hover:bg-orange-50/50 transition-all min-h-[44px]"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-[#102A56] truncate">{displayName}</p>
                      <div className={`flex items-center gap-1 mt-0.5 ${style.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        <span className="text-[10px] sm:text-[11px] font-medium">{localizedLevelLabel}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-[#102A56]">~{wait}m</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400">{t('liveStatus.wait')}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          3. FEATURED TEMPLES
      ═══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20 space-y-6 sm:space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#E97820] mb-1.5 sm:mb-2">
              {t('temples.sectionLabel')}
            </p>
            <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-[#102A56]">
              {t('temples.sectionHeading')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2 max-w-lg">
              {t('temples.sectionSub')}
            </p>
          </div>
          <Link
            to="/temples"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#102A56] hover:text-[#E97820] transition-colors shrink-0 self-start md:self-auto min-h-[36px]"
          >
            {t('temples.viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {temples.map((temple) => (
            <TempleCard key={temple.id} temple={temple} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          4. HOW DIVYATRA WORKS
      ═══════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-[#EBE5D8] py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-8 sm:space-y-12">
          <div className="max-w-xl">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#E97820] mb-1.5 sm:mb-2">
              {t('howItWorks.sectionLabel')}
            </p>
            <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-[#102A56] leading-snug">
              {t('howItWorks.sectionHeading')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">
              {t('howItWorks.sectionSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { key: 'p1', icon: <Clock className="w-6 h-6" />, color: 'bg-[#102A56] text-[#D5A63A]' },
              { key: 'p2', icon: <Shield className="w-6 h-6" />, color: 'bg-[#E97820] text-white' },
              { key: 'p3', icon: <HeartHandshake className="w-6 h-6" />, color: 'bg-emerald-700 text-emerald-100' },
            ].map(({ key, icon, color }) => (
              <div key={key} className="space-y-3 sm:space-y-4 p-4 sm:p-0 rounded-2xl bg-[#FAF8F5] sm:bg-transparent border sm:border-0 border-[#EBE5D8]">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${color} flex items-center justify-center`}>
                  {icon}
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold text-[#E97820] uppercase tracking-widest">
                  {t(`howItWorks.${key}Label`)}
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#102A56]">
                  {t(`howItWorks.${key}Title`)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t(`howItWorks.${key}Body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          5. OFFICIAL LIVE DARSHAN
      ═══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
          {/* Left: Player */}
          <LiveDarshanPlayer />

          {/* Right: Explanation */}
          <div className="space-y-5 sm:space-y-6 lg:pt-4">
            <div>
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#E97820] mb-1.5 sm:mb-2">
                {t('liveDarshan.sectionLabel')}
              </p>
              <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-[#102A56] leading-snug">
                Watch the Aarti<br />from anywhere.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 sm:mt-3 leading-relaxed">
                Connect to official live darshan streams from Somnath, Dwarka, Ambaji, and Pavagadh — broadcast directly from temple authorities. When a live stream is unavailable, links take you directly to the official channel.
              </p>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {[
                { temple: 'Somnath', detail: 'Morning Mangala Aarti · Evening Sandhya Aarti' },
                { temple: 'Dwarka', detail: 'Rajbhog · Evening Sandhya Aarti' },
                { temple: 'Ambaji', detail: 'Daily Aarti at 6:00 AM · 7:00 PM' },
                { temple: 'Pavagadh', detail: 'Cliff-top Mahakali Aarti · 6:00 AM · 6:30 PM' },
              ].map(({ temple, detail }) => (
                <div key={temple} className="flex items-start gap-2.5 sm:gap-3 p-3 rounded-lg border border-[#EBE5D8] bg-white">
                  <div className="w-2 h-2 rounded-full bg-[#D5A63A] mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#102A56]">{temple}</p>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">{detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/live-darshan"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#E97820] hover:underline min-h-[36px]"
            >
              Open full Live Darshan page
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          6. SMART CROWD INTELLIGENCE
      ═══════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-[#EBE5D8] py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-6 sm:space-y-8">
          <div className="max-w-xl">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#E97820] mb-1.5 sm:mb-2">
              {t('crowd.sectionLabel')}
            </p>
            <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-[#102A56]">
              {t('crowd.sectionHeading')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">
              {t('crowd.sectionSub')}
            </p>
          </div>

          <LiveCrowdMeter
            percentage={crowdData?.templeOverview?.[0]?.crowdPercentage || 55}
            waitMinutes={crowdData?.templeOverview?.[0]?.avgWait || 28}
            activeCount={crowdData?.templeOverview?.[0]?.activeCount || 3840}
            templeName="Shree Somnath Jyotirlinga"
            statusLabel="Optimal flow — normal queues"
          />

          <div>
            <Link
              to="/live-crowd"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#102A56] text-white text-xs sm:text-sm font-semibold hover:bg-[#1B3B74] shadow-sm transition-all min-h-[44px]"
            >
              <Activity className="w-4 h-4 text-[#D5A63A]" />
              {t('crowd.openHub')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          7. GEOGRAPHIC CIRCUIT MAP
      ═══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20">
        <InteractiveMap />
      </section>

      {/* ═══════════════════════════════════════════════════
          8. IMPACT NUMBERS
      ═══════════════════════════════════════════════════ */}
      <section className="bg-[#102A56] text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 text-center">
          {[
            { value: '1.48M+',  label: 'Pilgrims guided monthly',      color: 'text-[#D5A63A]' },
            { value: '94.8%',   label: 'Wait time prediction accuracy', color: 'text-[#E97820]' },
            { value: '64+',     label: 'Edge AI camera nodes',          color: 'text-emerald-400' },
            { value: '4 Dhams', label: 'Gujarat shrines covered',       color: 'text-white' },
          ].map(({ value, label, color }) => (
            <div key={label} className="space-y-1.5 sm:space-y-2">
              <strong className={`text-2xl sm:text-4xl font-serif font-semibold ${color} block`}>
                {value}
              </strong>
              <p className="text-[11px] sm:text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          9. PLAN YOUR YATRA CTA
      ═══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          
          <div className="space-y-3.5 sm:space-y-4">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#E97820]">
              {t('planner.sectionLabel')}
            </p>
            <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-[#102A56]">
              {t('planner.sectionHeading')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
              {t('planner.sectionSub')}
            </p>
            <Link
              to="/plan-yatra"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#E97820] text-white text-xs sm:text-sm font-semibold hover:bg-[#D36A18] shadow-sm transition-all min-h-[44px]"
            >
              <Compass className="w-4 h-4" />
              {t('planner.startPlanning')}
            </Link>
          </div>

          {/* Feature bullets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { icon: <Calendar className="w-5 h-5" />, title: 'E-Darshan Pass', body: 'Book guaranteed slots. Scan at turnstiles for paperless entry.' },
              { icon: <ShoppingBag className="w-5 h-5" />, title: 'Sacred Prasadam', body: 'Pre-order temple prasad for counter pickup or home delivery.' },
              { icon: <TrendingDown className="w-5 h-5" />, title: 'Crowd Forecast', body: 'Hour-by-hour predictions to help you avoid peak surges.' },
              { icon: <ShieldCheck className="w-5 h-5" />, title: 'Authority Dashboard', body: 'Temple trusts and security teams manage live crowd flows.' },
            ].map(({ icon, title, body }) => (
              <div key={title} className="bg-white border border-[#EBE5D8] rounded-xl p-3.5 sm:p-4 space-y-1.5 sm:space-y-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-orange-50 text-[#E97820] flex items-center justify-center">
                  {icon}
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-[#102A56]">{title}</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          10. FINAL CTA BANNER
      ═══════════════════════════════════════════════════ */}
      <section className="bg-[#102A56] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-5 sm:space-y-6 text-white">
          <h2 className="font-serif text-2xl sm:text-4xl font-semibold leading-snug">
            Everything you need for a more peaceful pilgrimage.
          </h2>
          <p className="text-white/70 text-xs sm:text-sm max-w-lg mx-auto">
            Check live sanctum waiting times and reserve your darshan slot in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
            <Link
              to="/booking"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#E97820] hover:bg-[#D36A18] text-white font-semibold text-xs sm:text-sm shadow-lg transition-all min-h-[44px] flex items-center justify-center"
            >
              Book Darshan Pass
            </Link>
            <Link
              to="/plan-yatra"
              className="w-full sm:w-auto px-7 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-white font-semibold text-xs sm:text-sm transition-all min-h-[44px] flex items-center justify-center"
            >
              Plan 4-Dham Circuit
            </Link>
            <a
              href="/Divyatra1.0.apk"
              download="Divyatra1.0.apk"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm shadow-lg transition-all min-h-[44px] flex items-center justify-center gap-2 border border-emerald-400/30"
            >
              <Smartphone className="w-4 h-4 text-emerald-200" />
              <span>Download DivYatra App</span>
              <Download className="w-3.5 h-3.5 text-emerald-300 ml-0.5" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
