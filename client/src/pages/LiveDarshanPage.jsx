import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LiveDarshanPlayer } from '../components/darshan/LiveDarshanPlayer';
import { useLiveDarshanStreams } from '../services/liveDarshanService';
import { Clock, ExternalLink, Radio, Play } from 'lucide-react';

const TEMPLE_ORDER = ['somnath', 'dwarka', 'ambaji', 'pavagadh'];

export const LiveDarshanPage = () => {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState('somnath');
  const { streams } = useLiveDarshanStreams();

  return (
    <div className="min-h-screen bg-[#F8F5EF] pb-24">
      
      {/* Page Header */}
      <div className="bg-white border-b border-[#EBE5D8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#E97820] mb-2">
            {t('liveDarshan.sectionLabel')}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#102A56]">
            {t('liveDarshan.sectionHeading')}
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl">
            Connect to official live darshan from Somnath, Dwarka, Ambaji, and Pavagadh — streamed dynamically from verified temple channels. When a live feed is offline, we display upcoming Aarti timings and direct channel access.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 space-y-10">

        {/* Main Player */}
        <LiveDarshanPlayer initialTemple={activeId} />

        {/* All four temple cards */}
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#102A56] mb-5">
            All Temple Darshan Channels
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLE_ORDER.map((id) => {
              const s = streams[id] || {};
              return (
                <div
                  key={id}
                  className={`bg-white rounded-xl border p-4 space-y-3 transition-colors flex flex-col justify-between ${
                    s.isCurrentlyLive ? 'border-red-200 shadow-sm' : 'border-[#E5DED0] hover:border-[#E97820]/40'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#102A56]">{s.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{s.channelName}</p>
                      </div>
                      {s.isCurrentlyLive ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 shrink-0 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-live-pulse" />
                          {t('common.liveTag')}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5 shrink-0">
                          {t('liveDarshan.unavailable')}
                        </span>
                      )}
                    </div>

                    {s.isCurrentlyLive && s.streamTitle ? (
                      <div className="p-2 bg-red-50/60 rounded border border-red-100 text-[11px] text-red-900 line-clamp-2">
                        <span className="font-semibold text-red-700">🔴 Live: </span>
                        {s.streamTitle}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                    )}
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-[#E97820] shrink-0" />
                      <span className="leading-snug">{s.aartiNote}</span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          setActiveId(id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                          activeId === id
                            ? 'bg-[#102A56] text-white'
                            : s.isCurrentlyLive
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'border border-[#102A56]/20 text-[#102A56] hover:bg-[#102A56] hover:text-white'
                        }`}
                      >
                        {s.isCurrentlyLive && activeId !== id && <Play className="w-3 h-3 fill-white" />}
                        {activeId === id ? 'Watching' : s.isCurrentlyLive ? 'Watch Live' : 'Watch'}
                      </button>
                      <a
                        href={s.liveVideoUrl || s.officialChannelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg border border-[#E5DED0] text-slate-500 hover:text-[#E97820] hover:border-[#E97820]/30 transition-colors flex items-center justify-center"
                        title={s.isCurrentlyLive ? 'Open Live on YouTube' : t('liveDarshan.openChannel')}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note about live streams */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-sm text-amber-800 leading-relaxed">
          <strong className="font-semibold">About Live Darshan:</strong> Live streams are broadcast directly from official temple channels on YouTube during scheduled Aarti hours. When a shrine is not actively broadcasting, we display the upcoming Aarti timings and direct access to their official verified channel.
        </div>

      </div>
    </div>
  );
};
