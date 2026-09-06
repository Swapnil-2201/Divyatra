import express from 'express';

const router = express.Router();

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
    defaultVideoId: '3Uv7cZUhZ2U',
    defaultStatus: 'live',
  },
  dwarka: {
    channelId: 'UCBAvMHZO3BIfMMhOK9LMOYQ',
    handle: '@shridwarkadhishmandirofficial',
    name: 'Shree Dwarkadhish Jagat Mandir',
    defaultTitle: 'Shri Dwarkadhish Mandir — Live Recorded Darshan',
    defaultVideoId: 'iSDLrA-EnHo',
    defaultStatus: 'recorded',
  },
  ambaji: {
    channelId: 'UCUge9PCf1By7w1DEP95xXoA',
    handle: '@officialambajitemple',
    name: 'Shree Arasuri Ambaji Mata Temple',
    defaultTitle: 'Live Darshan — Shree Arasuri Ambaji Mata Temple',
    defaultVideoId: 'JqjUs4PaLf4',
    defaultStatus: 'recorded',
  },
  pavagadh: {
    channelId: '',
    handle: '',
    name: 'Shree Mahakali Mata Mandir, Pavagadh',
    defaultTitle: 'Live Darshan — Pavagadh Mahakali Mandir',
    defaultVideoId: null,
    defaultStatus: 'offline',
  },
};

const YOUTUBE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function inspectVideoStatus(videoId) {
  if (!videoId || typeof videoId !== 'string' || videoId.length !== 11) {
    return { isLive: false, isRecorded: false, status: 'offline' };
  }
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: YOUTUBE_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return { isLive: false, isRecorded: false, status: 'offline' };

    const html = await res.text();
    const pm =
      html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s) ||
      html.match(/ytInitialPlayerResponse\s*=\s*({.+?})<\/script>/s);
    if (!pm) return { isLive: false, isRecorded: false, status: 'offline' };

    const p = JSON.parse(pm[1]);
    const details = p.videoDetails;
    const playability = p.playabilityStatus;
    const liveDetails = p.microformat?.playerMicroformatRenderer?.liveBroadcastDetails;

    if (playability?.status !== 'OK') {
      return { isLive: false, isRecorded: false, status: 'offline', reason: 'unplayable' };
    }

    if (details?.isUpcoming || (liveDetails && !liveDetails.startTimestamp && !liveDetails.isLiveNow)) {
      return { isLive: false, isRecorded: false, status: 'offline', reason: 'upcoming' };
    }

    const isLive = Boolean(details?.isLive || liveDetails?.isLiveNow === true);
    if (isLive) {
      return {
        isLive: true,
        isRecorded: false,
        status: 'live',
        videoId,
        title: details?.title || null,
      };
    }

    return {
      isLive: false,
      isRecorded: true,
      status: 'recorded',
      videoId,
      title: details?.title || null,
    };
  } catch (e) {
    return { isLive: false, isRecorded: false, status: 'offline', error: e.message };
  }
}

function extractCandidatesFromStreamsHtml(html) {
  if (!html) return { liveCandidate: null, recordedCandidate: null };

  const chunks = html.split(/lockupViewModel|videoRenderer/);
  let liveCandidate = null;
  let recordedCandidate = null;

  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];
    const hasLiveBadge =
      chunk.includes('THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE') ||
      chunk.includes('BADGE_STYLE_TYPE_LIVE_NOW') ||
      chunk.includes('"text":"LIVE"');
    const isUpcoming = chunk.includes('"Upcoming"') || chunk.includes('"text":"Upcoming"');

    const idMatch = chunk.match(/"(contentId|videoId)":"([a-zA-Z0-9_-]{11})"/);
    const titleMatch = chunk.match(/"(title|content)":"([^"]+)"/);
    const videoId = idMatch?.[2];
    const title = titleMatch?.[2] || null;

    if (!videoId) continue;

    if (hasLiveBadge && !isUpcoming && !liveCandidate) {
      liveCandidate = { videoId, title };
    } else if (!hasLiveBadge && !isUpcoming && !recordedCandidate) {
      recordedCandidate = { videoId, title };
    }

    if (liveCandidate && recordedCandidate) break;
  }

  return { liveCandidate, recordedCandidate };
}

async function checkYouTubeChannelLive(channelInfo) {
  const { channelId, handle, name, defaultTitle, defaultVideoId, defaultStatus } = channelInfo || {};
  if (!channelId && !handle) {
    return { isLive: false, isRecorded: false, videoId: null, streamTitle: null, status: 'offline' };
  }

  let recordedFallbackCandidate = null;

  const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
  if (apiKey && channelId) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;
      const apiRes = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.items && apiData.items.length > 0) {
          const candidateId = apiData.items[0].id?.videoId;
          if (candidateId) {
            const check = await inspectVideoStatus(candidateId);
            if (check.isLive) {
              return {
                isLive: true,
                isRecorded: false,
                videoId: candidateId,
                streamTitle: check.title || apiData.items[0].snippet?.title || defaultTitle,
                status: 'live',
              };
            }
          }
        }
      }

      const completedUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=completed&order=date&type=video&maxResults=1&key=${apiKey}`;
      const compRes = await fetch(completedUrl, { headers: { Accept: 'application/json' } });
      if (compRes.ok) {
        const compData = await compRes.json();
        if (compData.items && compData.items.length > 0) {
          const candidateId = compData.items[0].id?.videoId;
          if (candidateId && !recordedFallbackCandidate) {
            recordedFallbackCandidate = {
              videoId: candidateId,
              title: compData.items[0].snippet?.title || defaultTitle,
            };
          }
        }
      }
    } catch (apiErr) {
      console.warn(`[YouTube Data API] Search note for ${name}:`, apiErr.message);
    }
  }

  const streamsUrls = [];
  if (handle) streamsUrls.push(`https://www.youtube.com/${handle.startsWith('@') ? handle : '@' + handle}/streams`);
  if (channelId) streamsUrls.push(`https://www.youtube.com/channel/${channelId}/streams`);

  for (const sUrl of streamsUrls) {
    try {
      const res = await fetch(sUrl, {
        headers: YOUTUBE_HEADERS,
        redirect: 'follow',
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;

      const html = await res.text();
      const { liveCandidate, recordedCandidate } = extractCandidatesFromStreamsHtml(html);

      if (liveCandidate?.videoId) {
        const check = await inspectVideoStatus(liveCandidate.videoId);
        if (check.isLive) {
          return {
            isLive: true,
            isRecorded: false,
            videoId: liveCandidate.videoId,
            streamTitle: check.title || liveCandidate.title || defaultTitle,
            status: 'live',
          };
        }
      }

      if (recordedCandidate?.videoId && !recordedFallbackCandidate) {
        recordedFallbackCandidate = recordedCandidate;
      }
    } catch (streamsErr) {
      // Continue
    }
  }

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
          const check = await inspectVideoStatus(candidateId);
          if (check.isLive) {
            return {
              isLive: true,
              isRecorded: false,
              videoId: candidateId,
              streamTitle: check.title || defaultTitle,
              status: 'live',
            };
          } else if (check.isRecorded && !recordedFallbackCandidate) {
            recordedFallbackCandidate = { videoId: candidateId, title: check.title || defaultTitle };
          }
        }
      }
    } catch (liveErr) {
      // Next
    }
  }

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
          const check = await inspectVideoStatus(candidateId);
          if (check.isLive) {
            return {
              isLive: true,
              isRecorded: false,
              videoId: candidateId,
              streamTitle: check.title || defaultTitle,
              status: 'live',
            };
          } else if (check.isRecorded && !recordedFallbackCandidate) {
            recordedFallbackCandidate = { videoId: candidateId, title: check.title || defaultTitle };
          }
        }
      }
    } catch (rssErr) {
      // Offline
    }
  }

  const candidateToVerify = recordedFallbackCandidate?.videoId || defaultVideoId;
  if (candidateToVerify) {
    const check = await inspectVideoStatus(candidateToVerify);
    if (check.isLive) {
      return {
        isLive: true,
        isRecorded: false,
        videoId: candidateToVerify,
        streamTitle: check.title || recordedFallbackCandidate?.title || defaultTitle,
        status: 'live',
      };
    }
    if (check.isRecorded) {
      return {
        isLive: false,
        isRecorded: true,
        videoId: candidateToVerify,
        streamTitle: check.title || recordedFallbackCandidate?.title || defaultTitle,
        status: 'recorded',
      };
    }
  }

  if (defaultVideoId) {
    const isDefaultLive = defaultStatus === 'live';
    return {
      isLive: isDefaultLive,
      isRecorded: !isDefaultLive,
      videoId: defaultVideoId,
      streamTitle: defaultTitle,
      status: defaultStatus || (isDefaultLive ? 'live' : 'recorded'),
    };
  }

  return { isLive: false, isRecorded: false, videoId: null, streamTitle: null, status: 'offline' };
}

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
      
      let isLive = Boolean(liveInfo.isLive && liveInfo.videoId);
      let isRecorded = Boolean(!isLive && (liveInfo.isRecorded || liveInfo.status === 'recorded') && liveInfo.videoId);
      let videoId = (isLive || isRecorded) ? liveInfo.videoId : info.defaultVideoId;

      if (!videoId && info.defaultVideoId) {
        videoId = info.defaultVideoId;
      }

      let status = 'offline';
      if (videoId) {
        if (isLive) {
          status = 'live';
        } else if (isRecorded) {
          status = 'recorded';
        } else if (info.defaultStatus) {
          status = info.defaultStatus;
          isLive = status === 'live';
          isRecorded = status === 'recorded';
        }
      }

      const title = videoId ? (liveInfo.streamTitle || info.defaultTitle) : info.defaultTitle;

      const embedUrl = videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&playsinline=1`
        : null;

      const liveVideoUrl = videoId
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
        isRecorded,
        status,
        liveVideoId: videoId,
        videoId,
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
