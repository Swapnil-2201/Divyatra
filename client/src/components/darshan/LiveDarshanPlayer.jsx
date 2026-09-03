import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, AlertCircle, Youtube, Radio, RefreshCw, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLiveDarshanStreams } from '../../services/liveDarshanService';

const TEMPLE_ORDER = ['somnath', 'dwarka', 'ambaji', 'pavagadh'];

/**
 * LiveDarshanPlayer
 * 
 * Renders a tabbed live darshan player for all four Gujarat shrines.
 * Dynamically switches to live embed when YouTube is broadcasting live.
 * Defaults to offline / scheduled Aarti mode when not live.
 */
export const LiveDarshanPlayer = ({ initialTemple = 'somnath', compact = false }) => {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState(initialTemple);
  const [embedError, setEmbedError] = useState(false);
  const { streams, loading, isRefreshing, refreshStatus } = useLiveDarshanStreams();

  useEffect(() => {
    if (initialTemple && streams[initialTemple]) {
      setActiveId(initialTemple);
    }
  }, [initialTemple, streams]);

  const stream = streams[activeId] || streams[initialTemple] || streams['somnath'] || Object.values(streams)[0];
  if (!stream) return null;

  const canEmbed = stream.isCurrentlyLive && stream.embedUrl && !embedError;

  const handleTabChange = (id) => {
    setActiveId(id);
    setEmbedError(false);
  };

  const handleRefresh = (e) => {
    e.preventDefault();
    setEmbedError(false);
    refreshStatus();
  };

  return (
    <div className="bg-white border border-[#E5DED0] rounded-xl overflow-hidden shadow-sm">
      
      {/* Section header */}
      <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-[#EBE4D5] flex items-start justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#E97820] mb-0.5 sm:mb-1">
            {t('liveDarshan.sectionLabel')}
          </p>
          <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#102A56] leading-snug">
            {t('liveDarshan.sectionHeading')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('liveDarshan.sectionSub')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg border border-[#E5DED0] text-slate-600 hover:text-[#E97820] hover:border-[#E97820]/40 transition-colors flex items-center gap-1.5 text-xs font-medium bg-white ${
              isRefreshing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            title="Refresh dynamic live stream status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#E97820]' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Checking...' : 'Sync'}</span>
          </button>

          {stream.isCurrentlyLive ? (
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-live-pulse" />
              <span className="text-[10px] sm:text-[11px] font-bold text-red-600">{t('common.liveTag')}</span>
            </div>
          ) : (
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">Offline / Awaiting Aarti</span>
            </div>
          )}
        </div>
      </div>

      {/* Temple Tabs */}
      <div className="flex border-b border-[#EBE4D5] bg-[#FAFAF8] overflow-x-auto touch-scroll no-scrollbar">
        {TEMPLE_ORDER.map((id) => {
          const s = streams[id] || {};
          const isActive = id === activeId;
          const tabLabel = t(`templeData.${id}.shortName`, { defaultValue: s.shortName || id });
          return (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex-1 min-w-max px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all border-b-2 whitespace-nowrap min-h-[44px] flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'border-[#E97820] text-[#E97820] bg-white font-semibold'
                  : 'border-transparent text-slate-500 hover:text-[#102A56] hover:bg-white'
              }`}
            >
              <span>{tabLabel}</span>
              {s.isCurrentlyLive && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Player Area */}
      <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">

        {/* Live Stream Title Banner (when actively broadcasting) */}
        {stream.isCurrentlyLive && stream.streamTitle && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50/70 border border-red-100 rounded-lg text-xs text-red-900">
            <Radio className="w-4 h-4 text-red-600 shrink-0 animate-pulse" />
            <span className="font-semibold shrink-0">Live Broadcast:</span>
            <span className="truncate">{stream.streamTitle}</span>
          </div>
        )}

        {/* Embed or Fallback */}
        {canEmbed ? (
          <div className="space-y-2">
            <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-video shadow-inner">
              <iframe
                key={`${activeId}-${stream.embedUrl}`}
                className="absolute inset-0 w-full h-full"
                src={stream.embedUrl}
                title={`Live Darshan — ${stream.name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                onError={() => setEmbedError(true)}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live dynamic stream active
              </span>
              {stream.liveVideoUrl && (
                <a
                  href={stream.liveVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#E97820] hover:underline font-semibold text-[11px]"
                >
                  <Play className="w-3 h-3 fill-[#E97820]" />
                  Open Live on YouTube
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ) : (
          /* Standby / Offline State */
          <div className="rounded-lg bg-[#F8F5EF] border border-[#E5DED0] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8 sm:py-10 space-y-3 sm:space-y-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#102A56]/8 flex items-center justify-center">
              <Youtube className="w-6 h-6 sm:w-7 sm:h-7 text-[#102A56]/50" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-[#102A56] text-xs sm:text-sm">
                Stream Currently Offline / Awaiting Aarti
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 max-w-sm">
                Live darshan broadcasts dynamically during scheduled Aarti timings. You can visit the official channel to watch previous recordings and upcoming broadcasts.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-lg border border-[#102A56]/20 bg-white text-[#102A56] text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm min-h-[40px]"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#E97820]' : ''}`} />
                <span>{isRefreshing ? 'Checking live status...' : 'Check Live Status'}</span>
              </button>
              <a
                href={stream.officialChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-[#102A56] text-white text-xs sm:text-sm font-semibold hover:bg-[#1B3B74] transition-colors shadow-sm min-h-[40px]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Visit Official Channel</span>
              </a>
            </div>
          </div>
        )}

        {/* Details and Aarti Info */}
        <div className="pt-2 border-t border-[#EBE4D5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-[#102A56]">{stream.name}</span>
            {stream.aartiNote && (
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-[#E97820] shrink-0" />
                <span>{stream.aartiNote}</span>
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              Source: Official Temple Channel
            </span>
            <a
              href={stream.officialChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E97820] hover:underline flex items-center gap-0.5 font-medium"
            >
              Open Official Channel
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiveDarshanPlayer;
