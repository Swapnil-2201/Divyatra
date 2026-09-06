/**
 * Vercel Serverless Function: GET /api/darshan/live-status
 * 
 * Accurately detects active YouTube live streams for temple channels.
 * 
 * Pipeline:
 * 1. Official YouTube Data API v3 (if apiKey configured)
 * 2. Channel /streams tab scan (parses active "LIVE" badges vs "Upcoming" vs ended)
 * 3. Direct /live URL resolution with strict playability and isLiveNow verification
 * 4. Channel RSS feed multi-candidate verification
 * 
 * Distinguishes strictly between:
 * - Active live streams (isLiveNow === true, playabilityStatus === 'OK')
 * - Upcoming scheduled events (isUpcoming === true, playabilityStatus === 'LIVE_STREAM_OFFLINE')
 * - Ended / recorded streams
 */

const CHANNELS = {
  somnath: {
    channelId: 'UCT1egsvA08YcdMLiEu1DTRg',
    handle: '@SomnathTempleOfficialChannel',
    name: 'Shree Somnath Jyotirlinga',
    defaultTitle: 'Live Darshan — Shree Somnath Jyotirlinga',
  },
  dwarka: {
    channelId: 'UCBAvMHZO3BIfMMhOK9LMOYQ',
    handle: '@shridwarkadhishmandirofficial',
    name: 'Shree Dwarkadhish Jagat Mandir',
    defaultTitle: 'Live Darshan — Shree Dwarkadhish Jagat Mandir',
  },
  ambaji: {
    channelId: 'UCUge9PCf1By7w1DEP95xXoA',
    handle: '@officialambajitemple',
    name: 'Shree Arasuri Ambaji Mata Temple',
    defaultTitle: 'Live Darshan — Shree Arasuri Ambaji Mata Temple',
  },
  pavagadh: {
    channelId: '',
    handle: '',
    name: 'Shree Mahakali Mata Mandir, Pavagadh',
    defaultTitle: 'Live Darshan — Pavagadh Mahakali Mandir',
  },
};

const YOUTUBE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+999; SOCS=CAESEwgDEgk0ODEzNzk5NDQaAmVuIAEaBgiA_LyaBg',
};

let cache = {
  timestamp: 0,
  data: null,
};
const CACHE_TTL_MS = 60 * 1000;

/**
 * Validates whether a specific YouTube videoId is ACTUALLY streaming live right now.
 * Rejects upcoming scheduled broadcasts, ended streams, and offline videos.
 */
async function verifyVideoIsLive(videoId) {
  if (!videoId || typeof videoId !== 'string' || videoId.length !== 11) {
    return { isLive: false };
  }
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: YOUTUBE_HEADERS,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { isLive: false };

    const html = await res.text();
    const pm = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
    if (!pm) return { isLive: false };

    const p = JSON.parse(pm[1]);
    const details = p.videoDetails;
    const playability = p.playabilityStatus;
    const liveDetails = p.microformat?.playerMicroformatRenderer?.liveBroadcastDetails;

    // Reject if scheduled upcoming or playability is offline/error
    if (details?.isUpcoming || playability?.status !== 'OK') {
      return { isLive: false, reason: 'upcoming_or_offline' };
    }

    // If liveBroadcastDetails is present, check isLiveNow
    if (liveDetails && liveDetails.isLiveNow === false) {
      return { isLive: false, reason: 'broadcast_ended_or_future' };
    }

    // Must be actively live
    const isLive = Boolean(details?.isLive || liveDetails?.isLiveNow === true);
    return {
      isLive,
      videoId,
      title: details?.title || null,
    };
  } catch (e) {
    return { isLive: false, error: e.message };
  }
}

async function checkYouTubeChannelLive(channelInfo) {
  const { channelId, handle, name, defaultTitle } = channelInfo || {};
  if (!channelId && !handle) {
    return { isLive: false, videoId: null, streamTitle: null, status: 'offline' };
  }

  // -----------------------------------------------------------------
  // Tier 1: Official YouTube Data API v3 (if key configured)
  // -----------------------------------------------------------------
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_YOUTUBE_API_KEY;
  if (apiKey && channelId) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;
      const apiRes = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.items && apiData.items.length > 0) {
          const item = apiData.items[0];
          const candidateId = item.id?.videoId;
          if (candidateId) {
            const check = await verifyVideoIsLive(candidateId);
            if (check.isLive) {
              return {
                isLive: true,
                videoId: candidateId,
                streamTitle: check.title || item.snippet?.title || defaultTitle,
                status: 'live',
              };
            }
          }
        }
      }
    } catch (apiErr) {
      console.warn(`[YouTube Data API] Search note for ${name}:`, apiErr.message);
    }
  }

  // -----------------------------------------------------------------
  // Tier 2: Channel /streams tab scan (Most reliable across all cloud IPs)
  // -----------------------------------------------------------------
  const streamsUrls = [];
  if (handle) streamsUrls.push(`https://www.youtube.com/${handle.startsWith('@') ? handle : '@' + handle}/streams`);
  if (channelId) streamsUrls.push(`https://www.youtube.com/channel/${channelId}/streams`);

  for (const sUrl of streamsUrls) {
    try {
      const res = await fetch(sUrl, { headers: YOUTUBE_HEADERS, signal: AbortSignal.timeout(6000) });
      if (!res.ok) continue;

      const html = await res.text();
      const m = html.match(/ytInitialData\s*=\s*({.+?});/);
      if (m) {
        const data = JSON.parse(m[1]);
        const tab = data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.find(
          (t) => t.tabRenderer?.title === 'Live' || t.tabRenderer?.title === 'Streams'
        );
        const richGrid = tab?.tabRenderer?.content?.richGridRenderer;
        if (richGrid?.contents) {
          for (const item of richGrid.contents) {
            // Check lockupViewModel (modern YouTube layout)
            const vm = item.richItemRenderer?.content?.lockupViewModel;
            if (vm && vm.contentId) {
              const overlays = vm.contentImage?.thumbnailViewModel?.overlays || [];
              const badges = overlays[0]?.thumbnailBottomOverlayViewModel?.badges || [];
              const badgeText = badges[0]?.thumbnailBadgeViewModel?.text;
              const badgeStyle = badges[0]?.thumbnailBadgeViewModel?.badgeStyle;
              const isLiveBadge = badgeText === 'LIVE' || badgeStyle === 'THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE';

              if (isLiveBadge) {
                const title = vm.metadata?.lockupMetadataViewModel?.title?.content;
                const check = await verifyVideoIsLive(vm.contentId);
                if (check.isLive) {
                  return {
                    isLive: true,
                    videoId: vm.contentId,
                    streamTitle: check.title || title || defaultTitle,
                    status: 'live',
                  };
                }
              }
            }

            // Check videoRenderer (classic YouTube layout)
            const vr = item.videoRenderer || item.richItemRenderer?.content?.videoRenderer;
            if (vr && vr.videoId) {
              const vrBadges = vr.badges || [];
              const hasLiveBadge = vrBadges.some(
                (b) => b.metadataBadgeRenderer?.style === 'BADGE_STYLE_TYPE_LIVE_NOW' || b.metadataBadgeRenderer?.label === 'LIVE'
              );
              if (hasLiveBadge) {
                const title = vr.title?.runs?.[0]?.text;
                const check = await verifyVideoIsLive(vr.videoId);
                if (check.isLive) {
                  return {
                    isLive: true,
                    videoId: vr.videoId,
                    streamTitle: check.title || title || defaultTitle,
                    status: 'live',
                  };
                }
              }
            }
          }
        }
      }
    } catch (streamsErr) {
      // Fall through to next candidate
    }
  }

  // -----------------------------------------------------------------
  // Tier 3: Direct Channel /live URL Resolution
  // -----------------------------------------------------------------
  const liveUrls = [];
  if (handle) liveUrls.push(`https://www.youtube.com/${handle.startsWith('@') ? handle : '@' + handle}/live`);
  if (channelId) liveUrls.push(`https://www.youtube.com/channel/${channelId}/live`);

  for (const liveUrl of liveUrls) {
    try {
      const response = await fetch(liveUrl, {
        headers: YOUTUBE_HEADERS,
        redirect: 'follow',
        signal: AbortSignal.timeout(7000),
      });

      if (response.ok) {
        const html = await response.text();
        const canonicalMatch =
          html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) ||
          html.match(/<link\s+href="([^"]+)"\s+rel="canonical"/i);
        const ogUrlMatch = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i);
        const urlCandidate = canonicalMatch?.[1] || ogUrlMatch?.[1] || '';

        const vMatch =
          urlCandidate.match(/watch\?v=([a-zA-Z0-9_-]{11})/) ||
          urlCandidate.match(/\/live\/([a-zA-Z0-9_-]{11})/);

        if (vMatch) {
          const candidateId = vMatch[1];
          const check = await verifyVideoIsLive(candidateId);
          if (check.isLive) {
            return {
              isLive: true,
              videoId: candidateId,
              streamTitle: check.title || defaultTitle,
              status: 'live',
            };
          }
        }
      }
    } catch (liveErr) {
      // Next candidate
    }
  }

  // -----------------------------------------------------------------
  // Tier 4: Channel RSS Feed Candidate Scan
  // -----------------------------------------------------------------
  if (channelId) {
    try {
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const rssRes = await fetch(rssUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000),
      });
      if (rssRes.ok) {
        const xml = await rssRes.text();
        const videoMatches = [...xml.matchAll(/<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>/g)].map((m) => m[1]);
        const topCandidates = videoMatches.slice(0, 3);
        for (const candidateId of topCandidates) {
          const check = await verifyVideoIsLive(candidateId);
          if (check.isLive) {
            return {
              isLive: true,
              videoId: candidateId,
              streamTitle: check.title || defaultTitle,
              status: 'live',
            };
          }
        }
      }
    } catch (rssErr) {
      // Final fallback to offline
    }
  }

  return { isLive: false, videoId: null, streamTitle: null, status: 'offline' };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const forceRefresh = req.query?.refresh === 'true';
  const now = Date.now();

  if (!forceRefresh && cache.data && now - cache.timestamp < CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({
      success: true,
      cached: true,
      timestamp: new Date(cache.timestamp).toISOString(),
      streams: cache.data,
    });
  }

  try {
    const results = {};
    await Promise.all(
      Object.entries(CHANNELS).map(async ([key, info]) => {
        const liveInfo = await checkYouTubeChannelLive(info);
        const isLive = Boolean(liveInfo.isLive && liveInfo.videoId);
        const videoId = isLive ? liveInfo.videoId : null;
        const title = isLive ? (liveInfo.streamTitle || info.defaultTitle) : info.defaultTitle;

        const embedUrl =
          isLive && videoId
            ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&playsinline=1`
            : null;

        const liveVideoUrl =
          isLive && videoId
            ? `https://www.youtube.com/watch?v=${videoId}`
            : info.handle
            ? `https://www.youtube.com/${info.handle}/live`
            : null;

        results[key] = {
          id: key,
          name: info.name,
          channelId: info.channelId,
          handle: info.handle,
          isCurrentlyLive: isLive,
          liveVideoId: videoId,
          streamTitle: title,
          liveVideoUrl,
          embedUrl,
          status: isLive ? 'live' : 'offline',
        };
      })
    );

    cache = {
      timestamp: now,
      data: results,
    };

    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({
      success: true,
      cached: false,
      timestamp: new Date(now).toISOString(),
      streams: results,
    });
  } catch (error) {
    console.error('[Vercel Serverless] live-status error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
