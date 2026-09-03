import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, ArrowRight, HeartHandshake } from 'lucide-react';
import { getTempleImage } from '../../data/templeImages';
import { TempleDonationModal } from '../temple/TempleDonationModal';

const CROWD_LEVEL_KEYS = {
  smooth:   { dot: 'bg-emerald-500', i18nKey: 'liveStatus.smooth',   text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
  low:      { dot: 'bg-emerald-500', i18nKey: 'liveStatus.smooth',   text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
  moderate: { dot: 'bg-amber-500',   i18nKey: 'liveStatus.moderate', text: 'text-amber-700',   bg: 'bg-amber-50 border-amber-100' },
  high:     { dot: 'bg-red-500',     i18nKey: 'liveStatus.crowded',  text: 'text-red-700',     bg: 'bg-red-50 border-red-100' },
  critical: { dot: 'bg-red-600',     i18nKey: 'liveStatus.crowded',  text: 'text-red-700',     bg: 'bg-red-50 border-red-100' },
};

export const TempleCard = ({ temple }) => {
  const { t } = useTranslation();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  if (!temple) return null;

  const { id, name, shortName, deity, location, tagline, liveStatus, timings } = temple;

  // Localized temple text properties
  const displayTitle = t(`templeData.${id}.shortName`, { defaultValue: shortName || name });
  const displayDeity = t(`templeData.${id}.deity`, { defaultValue: deity });
  const displayLocation = t(`templeData.${id}.location`, { defaultValue: location });
  const displayTagline = t(`templeData.${id}.tagline`, { defaultValue: tagline });
  const displayEveningAarti = t(`templeData.${id}.eveningAarti`, { defaultValue: timings?.eveningAarti });

  const waitMin  = liveStatus?.estimatedWaitMinutes || 25;
  const level    = (liveStatus?.crowdLevel || 'moderate').toLowerCase();
  const crowdConfig = CROWD_LEVEL_KEYS[level] || CROWD_LEVEL_KEYS.moderate;
  const crowdLabel = t(crowdConfig.i18nKey, { defaultValue: 'Moderate' });

  // Use centralized image registry; fall back to server-provided image
  const imgSrc = getTempleImage(id, 'thumbnail') || temple.image;
  const fallbackSrc = getTempleImage(id, 'heroFallback');

  return (
    <>
      <article className="editorial-card group overflow-hidden flex flex-col h-full">

        {/* ── Image ── */}
        <div className="relative h-64 w-full overflow-hidden bg-slate-900">
          <img
            src={imgSrc}
            alt={`${displayTitle} — ${displayDeity}`}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => { e.target.src = fallbackSrc; }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#102A56]/80 via-[#102A56]/20 to-transparent" />

          {/* Live indicator — small, top-left */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-pulse" />
            <span className="text-[10px] font-semibold text-[#102A56]">{t('liveStatus.liveMonitored')}</span>
          </div>

          {/* Temple identity — bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8">
            <p className="text-[#D5A63A] text-[11px] font-medium uppercase tracking-wider mb-0.5 font-sans">
              {displayDeity}
            </p>
            <h3 className="font-serif text-xl font-semibold text-white leading-tight">
              {displayTitle}
            </h3>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-4 flex-1 flex flex-col gap-3">

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-[#E97820] shrink-0" />
            <span>{displayLocation}</span>
          </div>

          {/* Editorial tagline */}
          {displayTagline && (
            <p className="text-[13px] text-slate-600 leading-relaxed line-clamp-2">
              {displayTagline}
            </p>
          )}

          {/* Live status row */}
          <div className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${crowdConfig.bg}`}>
            <span className={`flex items-center gap-1.5 font-medium ${crowdConfig.text}`}>
              <span className={`w-2 h-2 rounded-full ${crowdConfig.dot}`} />
              {crowdLabel}
            </span>
            <span className="text-slate-500">
              ~<strong className="text-slate-700">{waitMin} {t('common.mins')}</strong> {t('liveStatus.wait')}
            </span>
          </div>

          {/* Next Aarti */}
          {displayEveningAarti && (
            <div className="flex items-center justify-between text-[12px] border-l-2 border-[#E97820] pl-3">
              <span className="text-slate-500">{t('temples.nextAarti')}</span>
              <span className="font-semibold text-[#102A56]">{displayEveningAarti}</span>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-auto pt-1 space-y-1.5">
            <div className="flex gap-1.5 sm:gap-2">
              <Link
                to={`/temples/${id}`}
                className="flex-1 py-2 px-1.5 sm:px-3 rounded-lg border border-[#102A56]/20 text-[#102A56] hover:bg-[#102A56] hover:text-white text-[11.5px] sm:text-xs font-semibold text-center transition-all flex items-center justify-center gap-1 min-h-[38px]"
              >
                <span className="truncate">{t('temples.viewTemple')}</span>
              </Link>
              <Link
                to={`/booking?temple=${id}`}
                className="flex-1 py-2 px-1.5 sm:px-3 rounded-lg bg-[#E97820] hover:bg-[#D36A18] text-white text-[11.5px] sm:text-xs font-semibold text-center transition-all flex items-center justify-center gap-1 shadow-sm min-h-[38px]"
              >
                <span className="truncate">{t('temples.bookDarshan')}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Link>
            </div>
            
            {/* Quick Donation Link */}
            <button
              onClick={() => setIsDonationModalOpen(true)}
              className="w-full py-1.5 px-3 rounded-lg border border-[#D5A63A]/30 bg-[#FAF7F0] hover:bg-[#D5A63A] text-[#B8871E] hover:text-white text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 min-h-[34px]"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>{t('temples.donate', { defaultValue: 'Offer E-Hundi / Donation' })}</span>
            </button>
          </div>
        </div>
      </article>

      {/* Interactive E-Hundi Donation Modal */}
      <TempleDonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        temple={temple}
      />
    </>
  );
};
