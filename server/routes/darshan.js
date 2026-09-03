import express from 'express';

const router = express.Router();

// Cache live statuses for 60 seconds to avoid excessive requests
let cache = {
  timestamp: 0,
  data: {},
};
const CACHE_TTL_MS = 60 * 1000;

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

/**
 * Checks if a specific YouTube channel is currently streaming live.
 * 
 * Pipeline:
 * Tier 1: YouTube Data API v3 (if process.env.YOUTUBE_API_KEY is configured)
 * Tier 2: Direct channel live resolution (/channel/{id}/live & @{handle}/live)
 *         Extracting canonical watch URL and validating player status.
 * Tier 3: RSS Feed verification (/feeds/videos.xml?channel_id={id})
 * 
 * Never returns an old/static recording as live.
 */
async function checkYouTubeChannelLive(channelInfo) {
  const { channelId, handle } = channelInfo || {};
  if (!channelId && !handle) {
    return { isLive: false, videoId: null, streamTitle: null };
  }

  // -------------------------------------------------------------
  // Tier 1: Official YouTube Data API v3 (server-side environment key)
  // -------------------------------------------------------------
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
  if (apiKey && channelId) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;
      const apiRes = await fetch(apiUrl, { headers: { 'Accept': 'application/json' } });
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.items && apiData.items.length > 0) {
          const item = apiData.items[0];
          const videoId = item.id?.videoId;
          const streamTitle = item.snippet?.title;
          if (videoId) {
            return {
              isLive: true,
              videoId,
              streamTitle: streamTitle || channelInfo.defaultTitle,
            };
          }
        } else {
          // Official API definitively confirmed no active live broadcast right now
          return { isLive: false, videoId: null, streamTitle: null };
        }
      }
    } catch (apiErr) {
      console.warn(`[YouTube Data API] Search failed for ${channelInfo.name}:`, apiErr.message);
    }
  }

  // -------------------------------------------------------------
  // Tier 2: Direct YouTube Channel /live Resolution
  // -------------------------------------------------------------
  const urlsToTry = [];
  if (channelId && !channelId.includes('UCxxxxxxxx')) {
    urlsToTry.push(`https://www.youtube.com/channel/${channelId}/live`);
  }
  if (handle) {
    urlsToTry.push(`https://www.youtube.com/${handle.startsWith('@') ? handle : '@' + handle}/live`);
  }

  for (const liveUrl of urlsToTry) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(liveUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok && response.status !== 200) {
        continue;
      }

      const html = await response.text();
      if (!html || html.length < 500) continue;

      let videoId = null;
      let streamTitle = null;
      let isLive = false;

      // 1. Extract videoId from canonical URL or og:url meta tags
      const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) ||
                             html.match(/<link\s+href="([^"]+)"\s+rel="canonical"/i);
      const ogUrlMatch = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i);
      const urlCandidate = canonicalMatch?.[1] || ogUrlMatch?.[1] || '';

      const vMatchFromUrl = urlCandidate.match(/watch\?v=([a-zA-Z0-9_-]{11})/) ||
                            urlCandidate.match(/\/live\/([a-zA-Z0-9_-]{11})/);
      if (vMatchFromUrl) {
        videoId = vMatchFromUrl[1];
      }

      // 2. Extract og:title
      const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
      if (ogTitleMatch) {
        streamTitle = ogTitleMatch[1];
      }

      // 3. Parse ytInitialPlayerResponse for authoritative live state and video details
      const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
      if (playerMatch) {
        try {
          const playerData = JSON.parse(playerMatch[1]);
          const details = playerData?.videoDetails;
          const playability = playerData?.playabilityStatus;

          if (details?.videoId) {
            videoId = details.videoId;
          }
          if (details?.title) {
            streamTitle = details.title;
          }

          const isPlayerLive = Boolean(details?.isLive || details?.isLiveContent);
          const isPlayable = playability?.status === 'OK';

          if (isPlayerLive && isPlayable) {
            isLive = true;
          }
        } catch (e) {
          // JSON parse failed, proceed to fallback checks
        }
      }

      // 4. Secondary live indicators
      if (!isLive && videoId) {
        const hasLiveTextMarker =
          html.includes('"isLive":true') ||
          html.includes('"isLiveBroadcast":true') ||
          (html.includes('{"text":" LIVE"}') && html.includes('watch?v='));

        const isEndedStream =
          html.includes('Streamed live') && !html.includes('"isLive":true');

        if (hasLiveTextMarker && !isEndedStream) {
          isLive = true;
        }
      }

      // If YouTube redirected to channel home page (not /watch or /live), the channel is offline
      if (!vMatchFromUrl && !isLive) {
        return { isLive: false, videoId: null, streamTitle: null };
      }

      if (isLive && videoId) {
        return { isLive: true, videoId, streamTitle: streamTitle || channelInfo.defaultTitle };
      }
    } catch (err) {
      // Continue to next URL candidate
    }
  }

  // -------------------------------------------------------------
  // Tier 3: RSS Feed Validation
  // -------------------------------------------------------------
  if (channelId) {
    try {
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const rssRes = await fetch(rssUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000),
      });
      if (rssRes.ok) {
        const xml = await rssRes.text();
        const firstVideoMatch = xml.match(/<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>/);
        if (firstVideoMatch) {
          const candidateVideoId = firstVideoMatch[1];
          // Quick check on candidate video watch page to verify if it's currently live
          const watchRes = await fetch(`https://www.youtube.com/watch?v=${candidateVideoId}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(5000),
          });
          if (watchRes.ok) {
            const watchHtml = await watchRes.text();
            if (watchHtml.includes('"isLive":true') && !watchHtml.includes('Streamed live')) {
              const titleMatch = watchHtml.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
              return {
                isLive: true,
                videoId: candidateVideoId,
                streamTitle: titleMatch ? titleMatch[1] : channelInfo.defaultTitle,
              };
            }
          }
        }
      }
    } catch (rssErr) {
      // Silently fall through to offline state
    }
  }

  return { isLive: false, videoId: null, streamTitle: null };
}

/**
 * GET /api/darshan/live-status
 * Returns real-time status of all temple channels.
 * Supports ?refresh=true query to bypass cache immediately.
 */
router.get('/live-status', async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';
  const now = Date.now();

  if (!forceRefresh && now - cache.timestamp < CACHE_TTL_MS && Object.keys(cache.data).length > 0) {
    return res.json({
      success: true,
      cached: true,
      timestamp: new Date(cache.timestamp).toISOString(),
      streams: cache.data,
    });
  }

  const results = {};
  await Promise.all(
    Object.entries(CHANNELS).map(async ([key, info]) => {
      const liveInfo = await checkYouTubeChannelLive(info);
      const isLive = Boolean(liveInfo.isLive && liveInfo.videoId);
      const videoId = isLive ? liveInfo.videoId : null;
      const title = isLive ? (liveInfo.streamTitle || info.defaultTitle) : info.defaultTitle;

      const embedUrl = isLive && videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0`
        : null;

      const liveVideoUrl = isLive && videoId
        ? `https://www.youtube.com/watch?v=${videoId}`
        : (info.handle ? `https://www.youtube.com/${info.handle}/live` : null);

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
      };
    })
  );

  cache = {
    timestamp: now,
    data: results,
  };

  res.json({
    success: true,
    cached: false,
    timestamp: new Date(now).toISOString(),
    streams: results,
  });
});

export default router;
