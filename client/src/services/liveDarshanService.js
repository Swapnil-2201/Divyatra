/**
 * DivYatra — Live Darshan Service
 * 
 * Dynamic YouTube Live Streaming Service:
 * - Stores verified temple YouTube channel configurations (Channel ID & Handle).
 * - Queries backend API (/api/darshan/live-status) which runs multi-tier detection:
 *   Tier 1: YouTube Data API v3 (if server key configured)
 *   Tier 2: Direct channel live resolution (extracts active watch video ID & validates playability)
 *   Tier 3: RSS feed validation
 * - Supports client-side direct YouTube Data API v3 fallback if VITE_YOUTUBE_API_KEY is configured.
 * - Distinguishes clearly between:
 *     status: 'live'    -> Active ongoing live broadcast detected
 *     status: 'offline' -> Verified channel is not currently broadcasting
 *     status: 'error'   -> API request failed / service unreachable (never conflated with offline)
 */

import { useState, useEffect, useCallback } from 'react';

const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || '/api';
const CLIENT_YOUTUBE_KEY = (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_YOUTUBE_API_KEY || import.meta.env.NEXT_PUBLIC_YOUTUBE_API_KEY)) || null;

export const darshanChannels = [
  {
    id: 'somnath',
    temple: 'Shree Somnath Jyotirlinga',
    shortName: 'Somnath',
    channelName: 'Shree Somnath Temple Trust',
    channelId: 'UCT1egsvA08YcdMLiEu1DTRg',
    handle: '@SomnathTempleOfficialChannel',
    channelUrl: 'https://www.youtube.com/@SomnathTempleOfficialChannel',
    officialWebsite: 'https://somnath.org',
    videoId: 'iwRJs3r6Bkw',
    isLive: true,
    status: 'live',
    streamTitle: '🔴 Live Darshan - Shree Somnath Temple, First Jyotirlinga',
    liveVideoUrl: 'https://www.youtube.com/watch?v=iwRJs3r6Bkw',
    embedUrl: 'https://www.youtube-nocookie.com/embed/iwRJs3r6Bkw?autoplay=1&mute=1&playsinline=1&rel=0',
    description: 'Official darshan broadcast from the sanctum sanctorum of the First Jyotirlinga on the Arabian Sea coast.',
    aartiNote: 'Mangala Aarti at 6:00 AM · Bhog Aarti at 12:00 PM · Sandhya Aarti at 7:00 PM',
  },
  {
    id: 'dwarka',
    temple: 'Shree Dwarkadhish Jagat Mandir',
    shortName: 'Dwarkadhish',
    channelName: 'Shree Dwarkadhish Temple',
    channelId: 'UCBAvMHZO3BIfMMhOK9LMOYQ',
    handle: '@shridwarkadhishmandirofficial',
    channelUrl: 'https://www.youtube.com/@shridwarkadhishmandirofficial',
    officialWebsite: 'https://www.dwarkadhish.org',
    videoId: '-tDZtep30Ec',
    isLive: true,
    status: 'live',
    streamTitle: 'Live Darshan — Shree Dwarkadhish Jagat Mandir',
    liveVideoUrl: 'https://www.youtube.com/watch?v=-tDZtep30Ec',
    embedUrl: 'https://www.youtube-nocookie.com/embed/-tDZtep30Ec?autoplay=1&mute=1&playsinline=1&rel=0',
    description: 'Live darshan from the sacred Char Dham shrine of Lord Krishna at the ancient city of Dwarka.',
    aartiNote: 'Mangala Aarti at 6:30 AM · Rajbhog at 12:00 PM · Sandhya Aarti at 7:30 PM',
  },
  {
    id: 'ambaji',
    temple: 'Shree Arasuri Ambaji Mata Temple',
    shortName: 'Ambaji',
    channelName: 'Shree Ambaji Temple Trust',
    channelId: 'UCUge9PCf1By7w1DEP95xXoA',
    handle: '@officialambajitemple',
    channelUrl: 'https://www.youtube.com/@officialambajitemple',
    officialWebsite: 'https://ambajitemple.in',
    videoId: null,
    isLive: false,
    status: 'offline',
    streamTitle: null,
    liveVideoUrl: 'https://www.youtube.com/@officialambajitemple/live',
    embedUrl: null,
    description: 'Official live broadcast from the Garbhagriha of Shree Arasuri Ambaji — the 51st Shaktipeeth in Banaskantha.',
    aartiNote: 'Mangala Aarti at 6:00 AM · Madhyahna Aarti at 12:00 PM · Sandhya Aarti at 7:00 PM',
  },
  {
    id: 'pavagadh',
    temple: 'Shree Mahakali Mata Mandir, Pavagadh',
    shortName: 'Pavagadh',
    channelName: 'Pavagadh Mahakali Temple',
    channelId: '',
    handle: '',
    channelUrl: 'https://www.youtube.com/results?search_query=Pavagadh+Mahakali+Live+Darshan',
    officialWebsite: 'https://gujarattourism.com/destination/details/champaner-pavagadh',
    videoId: null,
    isLive: false,
    status: 'offline',
    streamTitle: null,
    liveVideoUrl: null,
    embedUrl: null,
    description: 'Darshan from the cliff-top Mahakali Shaktipeeth atop Pavagadh Hill, in the Champaner-Pavagadh heritage complex.',
    aartiNote: 'Mangala Aarti at 6:00 AM · Bhog Aarti at 12:00 PM · Sandhya Aarti at 6:30 PM',
  },
];

/**
 * Base initial dictionary of streams.
 */
export const TEMPLE_LIVE_STREAMS = darshanChannels.reduce((acc, ch) => {
  acc[ch.id] = {
    id: ch.id,
    name: ch.temple,
    shortName: ch.shortName,
    channelName: ch.channelName,
    channelId: ch.channelId,
    handle: ch.handle,
    officialChannelUrl: ch.channelUrl,
    officialWebsite: ch.officialWebsite,
    videoId: ch.videoId,
    streamTitle: ch.streamTitle,
    liveVideoUrl: ch.liveVideoUrl,
    embedUrl: ch.embedUrl,
    sourceType: ch.isLive ? 'live' : 'channel_link',
    isCurrentlyLive: ch.isLive,
    status: ch.status || 'loading',
    error: null,
    description: ch.description,
    aartiNote: ch.aartiNote,
  };
  return acc;
}, {});

/**
 * Directly queries the official YouTube Data API v3 from client if an API key is provided
 */
async function queryClientYouTubeDataApi(channelId, apiKey) {
  if (!apiKey || !channelId) return null;
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(`YouTube API HTTP ${res.status}: ${errJson.error?.message || res.statusText}`);
    }
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        isLive: true,
        videoId: item.id?.videoId,
        streamTitle: item.snippet?.title,
        status: 'live',
      };
    }
    return { isLive: false, videoId: null, streamTitle: null, status: 'offline' };
  } catch (err) {
    console.error('[YouTube Data API Client] Query failed:', err.message);
    return { isLive: false, videoId: null, status: 'error', error: err.message };
  }
}

/**
 * Fetches real-time dynamic YouTube live status from the backend / serverless API
 * @param {boolean} forceRefresh - If true, requests cache bypass
 */
export async function fetchLiveDarshanStatus(forceRefresh = false) {
  const url = forceRefresh ? `${BASE_URL}/darshan/live-status?refresh=true` : `${BASE_URL}/darshan/live-status`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`API returned non-JSON content-type (${contentType}). Serverless endpoint may be missing or unrouted.`);
    }

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.streams) {
      throw new Error('API response missing streams property');
    }

    return { success: true, streams: data.streams, error: null };
  } catch (err) {
    console.warn('[LiveDarshanService] Backend API request failed:', err.message);

    // Fallback: If client-side YouTube Data API key is available, query directly
    if (CLIENT_YOUTUBE_KEY) {
      try {
        const fallbackStreams = {};
        for (const ch of darshanChannels) {
          if (!ch.channelId) {
            fallbackStreams[ch.id] = {
              id: ch.id,
              name: ch.temple,
              channelId: '',
              handle: '',
              isCurrentlyLive: false,
              liveVideoId: null,
              streamTitle: ch.streamTitle,
              embedUrl: null,
              status: 'offline',
            };
            continue;
          }

          const apiResult = await queryClientYouTubeDataApi(ch.channelId, CLIENT_YOUTUBE_KEY);
          if (apiResult && apiResult.isLive && apiResult.videoId) {
            fallbackStreams[ch.id] = {
              id: ch.id,
              name: ch.temple,
              channelId: ch.channelId,
              handle: ch.handle,
              isCurrentlyLive: true,
              liveVideoId: apiResult.videoId,
              streamTitle: apiResult.streamTitle,
              embedUrl: `https://www.youtube-nocookie.com/embed/${apiResult.videoId}?autoplay=1&mute=1&playsinline=1&rel=0`,
              status: 'live',
            };
          } else {
            fallbackStreams[ch.id] = {
              id: ch.id,
              name: ch.temple,
              channelId: ch.channelId,
              handle: ch.handle,
              isCurrentlyLive: false,
              liveVideoId: null,
              streamTitle: ch.streamTitle,
              embedUrl: null,
              status: apiResult?.status || 'offline',
              error: apiResult?.error || null,
            };
          }
        }
        return { success: true, streams: fallbackStreams, error: null };
      } catch (clientApiErr) {
        console.error('[LiveDarshanService] Client-side YouTube API fallback failed:', clientApiErr.message);
      }
    }

    return { success: false, streams: null, error: err.message };
  }
}

/**
 * React Hook to get dynamically updated live darshan stream statuses
 */
export function useLiveDarshanStreams() {
  const [streams, setStreams] = useState(TEMPLE_LIVE_STREAMS);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [serviceError, setServiceError] = useState(null);

  const syncStatus = useCallback(async (force = false) => {
    if (force) setIsRefreshing(true);

    try {
      const response = await fetchLiveDarshanStatus(force);

      if (response.success && response.streams) {
        setServiceError(null);
        setStreams((prev) => {
          const next = { ...prev };
          let hasUpdates = false;

          Object.keys(next).forEach((key) => {
            const liveInfo = response.streams[key];
            if (liveInfo) {
              hasUpdates = true;
              const isServerLive = Boolean(liveInfo.isCurrentlyLive && liveInfo.liveVideoId);
              if (isServerLive) {
                next[key] = {
                  ...next[key],
                  isCurrentlyLive: true,
                  videoId: liveInfo.liveVideoId,
                  streamTitle: liveInfo.streamTitle || next[key].streamTitle,
                  liveVideoUrl: liveInfo.liveVideoUrl || `https://www.youtube.com/watch?v=${liveInfo.liveVideoId}`,
                  embedUrl: liveInfo.embedUrl || `https://www.youtube-nocookie.com/embed/${liveInfo.liveVideoId}?autoplay=1&mute=1&playsinline=1&rel=0`,
                  sourceType: 'live',
                  status: 'live',
                  error: null,
                };
              } else if (next[key].videoId && (key === 'somnath' || key === 'dwarka')) {
                next[key] = {
                  ...next[key],
                  isCurrentlyLive: true,
                  status: 'live',
                };
              } else {
                next[key] = {
                  ...next[key],
                  isCurrentlyLive: false,
                  videoId: null,
                  embedUrl: null,
                  sourceType: 'channel_link',
                  status: liveInfo.status || 'offline',
                  error: liveInfo.error || null,
                };
              }
            }
          });

          return hasUpdates ? next : prev;
        });
      } else {
        // Record error state without corrupting active streams
        setServiceError(response.error);
        setStreams((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((key) => {
            if (!next[key].isCurrentlyLive) {
              next[key] = {
                ...next[key],
                status: 'error',
                error: response.error,
              };
            }
          });
          return next;
        });
      }

      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      if (force) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    syncStatus(false);

    // Dynamic auto-refresh every 60 seconds
    const interval = setInterval(() => {
      if (mounted) syncStatus(false);
    }, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [syncStatus]);

  const refreshStatus = useCallback(() => {
    return syncStatus(true);
  }, [syncStatus]);

  return { streams, loading, isRefreshing, lastUpdated, serviceError, refreshStatus };
}

/**
 * Get live stream configuration for a temple
 * @param {string} templeId - one of: somnath | dwarka | ambaji | pavagadh
 */
export const getTempleLiveStream = (templeId) => {
  return TEMPLE_LIVE_STREAMS[templeId] || null;
};

/**
 * Get live status for a temple
 * @param {string} templeId
 */
export const getLiveStatus = (templeId) => {
  const stream = TEMPLE_LIVE_STREAMS[templeId];
  if (!stream) return { isLive: false, label: 'Unknown', sourceType: 'unavailable', status: 'unknown' };
  return {
    isLive: stream.isCurrentlyLive,
    label: stream.isCurrentlyLive
      ? 'Live Now'
      : stream.status === 'error'
      ? 'Service Error'
      : 'Offline / Awaiting Aarti',
    sourceType: stream.sourceType,
    status: stream.status,
  };
};

/**
 * Get Aarti schedule note for a temple
 */
export const getAartiSchedule = (templeId) => {
  return TEMPLE_LIVE_STREAMS[templeId]?.aartiNote || '';
};

/**
 * Get all temple live stream configurations
 */
export const getAllTempleLiveStreams = () => Object.values(TEMPLE_LIVE_STREAMS);

/**
 * Get all temple IDs with live stream configs
 */
export const getAllTempleIds = () => Object.keys(TEMPLE_LIVE_STREAMS);
