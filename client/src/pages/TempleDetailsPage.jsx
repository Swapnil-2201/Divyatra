import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { getTempleImage } from '../data/templeImages';
import { LiveCrowdMeter } from '../components/crowd/LiveCrowdMeter';
import { ZoneCongestionMap } from '../components/crowd/ZoneCongestionMap';
import { Temple3DViewer } from '../components/interactive/Temple3DViewer';
import { SimulatedCCTVStream } from '../components/crowd/SimulatedCCTVStream';
import { LiveDarshanPlayer } from '../components/darshan/LiveDarshanPlayer';
import { TempleGallery } from '../components/common/TempleGallery';
import { TempleDonationModal } from '../components/temple/TempleDonationModal';
import {
  MapPin,
  Clock,
  Sun,
  Cloud,
  Wind,
  ShieldCheck,
  Sparkles,
  Calendar,
  ShoppingBag,
  HeartHandshake,
  ArrowRight,
  ChevronRight,
  Info,
  CheckCircle2,
  Users,
  Compass,
  Radio
} from 'lucide-react';

export const TempleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [temple, setTemple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  useEffect(() => {
    const fetchTemple = async () => {
      setLoading(true);
      const data = await api.getTempleById(id || 'somnath');
      setTemple(data);
      setLoading(false);
      window.scrollTo(0, 0);
    };
    fetchTemple();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EF]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#E97820] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif font-bold text-lg text-[#102A56]">{t('common.loading', { defaultValue: 'Loading Sacred Shrine Telemetry...' })}</p>
        </div>
      </div>
    );
  }

  if (!temple) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EF] p-4 text-center">
        <div className="bg-white p-8 rounded-3xl border border-[#E5DED0] max-w-md space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#102A56]">Temple Not Found</h2>
          <p className="text-xs text-gray-500">The requested temple ID could not be loaded.</p>
          <Link to="/temples" className="px-5 py-2.5 bg-[#E97820] text-white rounded-xl text-xs font-bold inline-block">
            {t('nav.temples', { defaultValue: 'Back to Temples' })}
          </Link>
        </div>
      </div>
    );
  }

  const {
    name,
    deity,
    location,
    image,
    bannerImage,
    tagline,
    description,
    historicalSignificance,
    timings,
    liveStatus,
    weather,
    facilities,
    zones,
    darshanSlots,
    cctvCams
  } = temple;

  // Localized temple attributes
  const displayTitle = t(`templeData.${temple.id}.name`, { defaultValue: name });
  const displayDeity = t(`templeData.${temple.id}.deity`, { defaultValue: deity });
  const displayLocation = t(`templeData.${temple.id}.location`, { defaultValue: location });
  const displayDescription = t(`templeData.${temple.id}.description`, { defaultValue: description });
  const displayHistoricalSignificance = t(`templeData.${temple.id}.historicalSignificance`, { defaultValue: historicalSignificance });
  const displayEveningAarti = t(`templeData.${temple.id}.eveningAarti`, { defaultValue: timings?.eveningAarti });

  return (
    <div className="min-h-screen bg-[#F8F5EF] pb-24 space-y-12">
      
      {/* 1. Cinematic Temple Hero Banner */}
      <section className="relative min-h-[380px] sm:min-h-[520px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={getTempleImage(temple.id, 'hero') || bannerImage || image}
            alt={displayTitle}
            className="w-full h-full object-cover object-center filter brightness-90"
            onError={(e) => {
              e.target.src = getTempleImage(temple.id, 'heroFallback') || bannerImage || image;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102A56] via-[#102A56]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 w-full text-white space-y-3 sm:space-y-4">
          
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-gray-300">
            <Link to="/" className="hover:text-white">{t('nav.home', { defaultValue: 'Home' })}</Link>
            <ChevronRight className="w-3 h-3 text-[#D5A63A]" />
            <Link to="/temples" className="hover:text-white">{t('nav.temples', { defaultValue: 'Temples' })}</Link>
            <ChevronRight className="w-3 h-3 text-[#D5A63A]" />
            <span className="text-[#D5A63A] font-semibold truncate max-w-[180px] sm:max-w-none">{displayTitle}</span>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[#D5A63A] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{displayDeity}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              {displayTitle}
            </h1>
            <div className="flex items-center text-xs sm:text-sm text-gray-200">
              <MapPin className="w-4 h-4 text-[#E97820] mr-1.5 shrink-0" />
              <span>{displayLocation}</span>
            </div>
          </div>

          {/* Quick Header CTA */}
          <div className="pt-2 flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center gap-2.5 sm:gap-3">
            <Link
              to={`/booking?temple=${temple.id}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E97820] hover:bg-[#D36A18] text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all min-h-[44px]"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('temples.bookDarshan', { defaultValue: 'Book Darshan Pass' })}</span>
            </Link>
            <Link
              to={`/prasad?temple=${temple.id}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 flex items-center justify-center gap-2 transition-all min-h-[44px]"
            >
              <ShoppingBag className="w-4 h-4 text-[#D5A63A]" />
              <span>{t('prasad.orderNow', { defaultValue: 'Order Mahaprasad' })}</span>
            </Link>
            <button
              onClick={() => setIsDonationModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#D5A63A] to-[#B8871E] hover:from-[#B8871E] hover:to-[#966E14] text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all min-h-[44px]"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{t('temples.donate', { defaultValue: 'E-Hundi / Donate' })}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* 1b. Live Darshan Section — near top, high value */}
        <div>
          <LiveDarshanPlayer initialTemple={temple.id} />
        </div>
        
        {/* 2. Live Telemetry & Weather Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LiveCrowdMeter
              percentage={liveStatus?.crowdPercentage || 58}
              waitMinutes={liveStatus?.estimatedWaitMinutes || 28}
              activeCount={liveStatus?.activePilgrimsInPremise || 3840}
              templeName={name}
              statusLabel={liveStatus?.statusLabel || "Optimal Flow"}
            />
          </div>

          {/* Weather & Live Environmental Telemetry */}
          <div className="bg-white rounded-3xl border border-[#E5DED0] p-6 shadow-luxury flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#EBE4D5]">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#E97820]">
                  Live Environmental Status
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Favorable
                </span>
              </div>

              <div className="py-4 flex items-center justify-between">
                <div>
                  <strong className="font-serif text-4xl font-extrabold text-[#102A56]">
                    {weather?.temp || 28}°C
                  </strong>
                  <p className="text-xs font-medium text-slate-600 mt-1">
                    {weather?.condition || "Pleasant Breeze"}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-[#E97820]">
                  <Sun className="w-8 h-8 animate-spin-slow" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EBE4D5]">
                  <span className="text-gray-500 text-[10.5px] block">Humidity</span>
                  <strong className="text-slate-800 font-bold">{weather?.humidity || "62%"}</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EBE4D5]">
                  <span className="text-gray-500 text-[10.5px] block">Wind Velocity</span>
                  <strong className="text-slate-800 font-bold">{weather?.windSpeed || "18 km/h"}</strong>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#102A56] text-white text-[11px] space-y-1">
              <span className="font-bold text-[#D5A63A] block">Today's Peak Hours</span>
              <p className="text-gray-300">{liveStatus?.peakHoursToday || "06:30 PM - 08:30 PM"}</p>
            </div>
          </div>
        </div>

        {/* 3. Interactive 3D Premise Viewer */}
        <Temple3DViewer templeId={temple.id} templeName={name} />

        {/* 4. Timings & Aarti Schedule + Available Slots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Timings & Aarti Card */}
          <div className="bg-white rounded-3xl border border-[#E5DED0] p-6 sm:p-8 shadow-luxury space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE4D5]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#E97820]">
                  Daily Rituals
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#102A56]">
                  Aarti & Darshan Timings
                </h3>
              </div>
              <Clock className="w-6 h-6 text-[#E97820]" />
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EBE4D5] flex items-center justify-between">
                <span className="font-semibold text-slate-700">General Darshan Hours</span>
                <strong className="text-[#102A56] font-bold">{timings.darshanOpen} - {timings.darshanClose}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EBE4D5] flex items-center justify-between">
                <span className="font-semibold text-slate-700">Morning Mangala Aarti</span>
                <strong className="text-[#E97820] font-bold">{timings.morningAarti}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EBE4D5] flex items-center justify-between">
                <span className="font-semibold text-slate-700">Afternoon Bhog Aarti</span>
                <strong className="text-[#102A56] font-bold">{timings.afternoonAarti}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EBE4D5] flex items-center justify-between">
                <span className="font-semibold text-slate-700">{t('temples.nextAarti', { defaultValue: 'Evening Maha Aarti' })}</span>
                <strong className="text-[#E97820] font-bold">{displayEveningAarti || timings.eveningAarti}</strong>
              </div>
              {timings.soundAndLightShow && (
                <div className="p-3.5 rounded-xl bg-[#102A56] text-white flex items-center justify-between">
                  <span className="font-semibold text-[#D5A63A]">Sound & Light Projection</span>
                  <strong className="font-bold">{timings.soundAndLightShow}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Available Slots Preview */}
          <div className="bg-white rounded-3xl border border-[#E5DED0] p-6 sm:p-8 shadow-luxury space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE4D5]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#E97820]">
                  Real-time Quota
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#102A56]">
                  Available Darshan Slots
                </h3>
              </div>
              <Link to={`/booking?temple=${temple.id}`} className="text-xs font-bold text-[#E97820] hover:underline">
                {t('common.viewAll', { defaultValue: 'View All' })} &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {darshanSlots.slice(0, 4).map((slot) => (
                <div
                  key={slot.id}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-sm text-[#102A56] block">{slot.title}</span>
                    <span className="text-gray-500">{slot.time}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
                      {slot.availableSlots} left
                    </span>
                    <span className="block text-[11px] text-gray-500 mt-0.5">Free / VIP ₹{slot.vipPrice}</span>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to={`/booking?temple=${temple.id}`}
              className="w-full py-3 rounded-xl bg-[#E97820] hover:bg-[#D36A18] text-white font-bold text-xs sm:text-sm text-center shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <span>{t('temples.bookDarshan', { defaultValue: 'Reserve Darshan Slot Online' })}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 5. Zone Congestion Map & Live CCTV Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ZoneCongestionMap zones={zones} templeName={displayTitle} />
          <SimulatedCCTVStream cams={cctvCams} templeName={displayTitle} />
        </div>

        {/* 6. Overview & Sacred Facilities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E5DED0] p-6 sm:p-8 shadow-luxury space-y-4">
            <h3 className="font-serif text-2xl font-bold text-[#102A56]">
              About the Sacred Shrine
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {displayDescription}
            </p>
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border-l-4 border-[#D5A63A] text-xs text-slate-700 leading-relaxed">
              <strong className="text-[#102A56] block mb-1 font-serif text-sm">Historical Significance:</strong>
              {displayHistoricalSignificance}
            </div>
          </div>

          {/* Facilities Card */}
          <div className="bg-white rounded-3xl border border-[#E5DED0] p-6 sm:p-8 shadow-luxury space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#102A56]">
              Pilgrim Facilities
            </h3>
            <div className="space-y-2.5">
              {facilities.map((fac, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{fac.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6.5. Temple Trust E-Hundi & Sacred Seva Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#102A56] via-[#1B3F78] to-[#102A56] p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-[#D5A63A]/10 blur-3xl pointer-events-none" />
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D5A63A]/20 text-[#D5A63A] text-xs font-bold uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Direct Temple Trust Contribution</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              Support {displayTitle} Trust
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Contribute directly to the Annakshetra (daily free pilgrim meals), sacred Goshala, temple maintenance, and Vedic rituals. All offerings are eligible for 50% tax exemption under Section 80G.
            </p>
          </div>
          <button
            onClick={() => setIsDonationModalOpen(true)}
            className="shrink-0 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#D5A63A] to-[#B8871E] hover:from-[#B8871E] hover:to-[#966E14] text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] min-h-[48px] relative z-10"
          >
            <HeartHandshake className="w-5 h-5" />
            <span>{t('temples.donate', { defaultValue: 'Make a Sacred Donation' })}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 7. Photo Gallery */}
        <TempleGallery templeId={temple.id} templeName={displayTitle} />
      </div>

      {/* Interactive E-Hundi Donation Modal */}
      <TempleDonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        temple={temple}
      />
    </div>
  );
};
