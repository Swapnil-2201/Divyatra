/**
 * DivYatra — Live Darshan Service
 * 
 * Dynamic YouTube Live Streaming Service:
 * - Stores verified temple YouTube channel configurations (Channel ID & Handle).
 * - Queries backend API (/api/darshan/live-status) which runs multi-tier detection:
 *   Tier 1: YouTube Data API v3 (if server key configured)
 *   Tier 2: Direct channel /streams live and recorded extraction
 *   Tier 3: Direct channel /live URL resolution with playability check
 *   Tier 4: RSS feed validation
 *   Tier 5: Fallback to latest recorded broadcast
 * - Distinguishes clearly between:
 *     status: 'live'     -> Active ongoing live broadcast detected
 *     status: 'recorded' -> Live broadcast has ended, recorded stream is playable
 *     status: 'offline'  -> Channel is not currently broadcasting and has no playable stream
 *     status: 'error'    -> API request failed / service unreachable
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
    videoId: '3Uv7cZUhZ2U',
    isLive: true,
    isRecorded: false,
    status: 'live',
    streamTitle: 'Live Darshan — Shree Somnath Jyotirlinga',
    liveVideoUrl: 'https://www.youtube.com/live/3Uv7cZUhZ2U',
    embedUrl: 'https://www.youtube-nocookie.com/embed/3Uv7cZUhZ2U?autoplay=0&rel=0&playsinline=1',
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
    videoId: 'iSDLrA-EnHo',
    isLive: false,
    isRecorded: true,
    status: 'recorded',
    streamTitle: 'Shri Dwarkadhish Mandir — Live Recorded Darshan',
    liveVideoUrl: 'https://www.youtube.com/watch?v=iSDLrA-EnHo',
    embedUrl: 'https://www.youtube-nocookie.com/embed/iSDLrA-EnHo?autoplay=0&rel=0&playsinline=1',
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
    isRecorded: false,
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
    isRecorded: false,
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
    sourceType: ch.isLive ? 'live' : ch.isRecorded ? 'recorded' : 'channel_link',
    isCurrentlyLive: ch.isLive,
    isRecorded: ch.isRecorded || false,
    status: ch.status || 'loading',
    error: null,
    description: ch.description,
    aartiNote: ch.aartiNote,
  };
  return acc;
}, {});

/**
 * Queries YouTube Data API v3 directly from client if API key is provided
 */
async function queryClientYouTubeDataApi(channelId, apiKey) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      return { isLive: false, status: 'error', error: `YouTube API returned ${res.status}` };
    }
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        isLive: true,
        videoId: item.id.videoId,
        streamTitle: item.snippet.title,
        status: 'live',
      };
    }
    return { isLive: false, status: 'offline' };
  } catch (err) {
    return { isLive: false, status: 'error', error: err.message };
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
              isRecorded: false,
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
              isRecorded: false,
              liveVideoId: apiResult.videoId,
              streamTitle: apiResult.streamTitle,
              embedUrl: `https://www.youtube-nocookie.com/embed/${apiResult.videoId}?autoplay=0&rel=0&playsinline=1`,
              status: 'live',
            };
          } else {
            fallbackStreams[ch.id] = {
              id: ch.id,
              name: ch.temple,
              channelId: ch.channelId,
              handle: ch.handle,
              isCurrentlyLive: false,
              isRecorded: ch.isRecorded || false,
              liveVideoId: ch.videoId,
              streamTitle: ch.streamTitle,
              embedUrl: ch.embedUrl,
              status: apiResult?.status || ch.status || 'offline',
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
              const isServerLive = Boolean(liveInfo.isCurrentlyLive && (liveInfo.liveVideoId || liveInfo.videoId));
              const isRecorded = Boolean(!isServerLive && (liveInfo.isRecorded || liveInfo.status === 'recorded'));
              const videoId = liveInfo.liveVideoId || liveInfo.videoId;

              if (isServerLive) {
                next[key] = {
                  ...next[key],
                  isCurrentlyLive: true,
                  isRecorded: false,
                  videoId,
                  streamTitle: liveInfo.streamTitle || next[key].streamTitle,
                  liveVideoUrl: liveInfo.liveVideoUrl || `https://www.youtube.com/watch?v=${videoId}`,
                  embedUrl: liveInfo.embedUrl || `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&playsinline=1`,
                  sourceType: 'live',
                  status: 'live',
                  error: null,
                };
              } else if (isRecorded && videoId) {
                next[key] = {
                  ...next[key],
                  isCurrentlyLive: false,
                  isRecorded: true,
                  videoId,
                  streamTitle: liveInfo.streamTitle || next[key].streamTitle,
                  liveVideoUrl: liveInfo.liveVideoUrl || `https://www.youtube.com/watch?v=${videoId}`,
                  embedUrl: liveInfo.embedUrl || `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&playsinline=1`,
                  sourceType: 'recorded',
                  status: 'recorded',
                  error: null,
                };
              } else {
                next[key] = {
                  ...next[key],
                  isCurrentlyLive: false,
                  isRecorded: false,
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
            if (!next[key].isCurrentlyLive && !next[key].isRecorded) {
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

    // Also auto-refresh when window regains focus
    const handleFocus = () => {
      if (mounted) syncStatus(false);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
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
    isRecorded: stream.isRecorded,
    label: stream.isCurrentlyLive
      ? 'Live Now'
      : stream.isRecorded || stream.status === 'recorded'
      ? 'Live Recorded'
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
