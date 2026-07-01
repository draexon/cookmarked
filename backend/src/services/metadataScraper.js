const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config(); // Load environment variables

const STREAMING_PLATFORMS = [
  {
    name: 'Amazon Prime',
    match: /(amazon\.com\/dp\/|primevideo\.com)/i,
    logo: 'https://logo.clearbit.com/primevideo.com'
  },
  {
    name: 'Netflix',
    match: /netflix\.com\/title\//i,
    logo: 'https://logo.clearbit.com/netflix.com'
  },
  {
    name: 'Hotstar',
    match: /hotstar\.com/i,
    logo: 'https://logo.clearbit.com/hotstar.com'
  },
  {
    name: 'Zee5',
    match: /zee5\.com/i,
    logo: 'https://logo.clearbit.com/zee5.com'
  },
  {
    name: 'MX Player',
    match: /mxplayer\.in/i,
    logo: 'https://logo.clearbit.com/mxplayer.in'
  },
  {
    name: 'JioCinema',
    match: /jiocinema\.com/i,
    logo: 'https://logo.clearbit.com/jiocinema.com'
  }
];

const STRATEGY_UAS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', // Strategy 1: Mobile UA
  'facebookexternalhit/1.1', // Strategy 2.1: Social bot
  'Twitterbot/1.0'           // Strategy 2.2: Social bot
];

function isFoodOrUnrelated(url) {
  if (!url) return true;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes('food') || lowerUrl.includes('placeholder');
}

function cleanTitleForOMDB(title) {
  if (!title) return '';
  return title
    .replace(/Watch|Online|Full Movie|Prime Video|Netflix/gi, '')
    .replace(/\|.*/, '')
    .trim();
}

function extractKeywordFromUrl(url) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(p => 
      p.length > 2 && 
      !/^\d+$/.test(p) && 
      !/^(?=.*[0-9])[A-Za-z0-9]{10,30}$/.test(p) && // Filter out alphanumeric IDs
      !['title', 'detail', 'dp', 'watch', 'movies', 'in', 'video'].includes(p.toLowerCase())
    );
    if (parts.length > 0) {
      return parts[0].replace(/[-_]/g, ' ');
    }
  } catch (e) {}
  return '';
}

// --- Instagram-specific scraping ---
const INSTAGRAM_UAS = [
  'facebookexternalhit/1.1',
  'Twitterbot/1.0',
  'LinkedInBot/1.0',
];

function isInstagramLoginPage(title) {
  if (!title) return true;
  const clean = title.toLowerCase().replace(/[^a-z]/g, '');
  return clean === 'login' || clean === 'instagram' || clean === 'logininstagram' || clean.includes('login');
}

function getInstagramFallbackTitle(url) {
  const match = String(url || '').match(/instagram\.com\/([^/]+)\/(reel|p)\//i);
  if (match && match[1]) {
    return `Reel by @${match[1]}`;
  }
  return 'Instagram Reel';
}

async function attemptInstagramFetch(url, ua) {
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': ua, 'Accept-Language': 'en-US,en;q=0.9' },
    timeout: 3000,
  });
  const $ = cheerio.load(data);
  const getMeta = (prop) =>
    $(`meta[property="${prop}"]`).attr('content') || $(`meta[name="${prop}"]`).attr('content') || '';

  const title = getMeta('og:title') || $('title').text();
  const description = getMeta('og:description');
  const thumbnail = getMeta('og:image');

  if (isInstagramLoginPage(title)) {
    throw new Error('Hit Instagram login wall');
  }
  if (!title && !thumbnail) {
    throw new Error('No metadata found');
  }
  return { title, description, thumbnail };
}

async function scrapeInstagram(url) {
  try {
    // Promise.any: first UA that returns real data wins
    const result = await Promise.any(INSTAGRAM_UAS.map((ua) => attemptInstagramFetch(url, ua)));
    return {
      title: result.title || getInstagramFallbackTitle(url),
      description: result.description || '',
      thumbnail: null,
      platform: 'instagram',
    };
  } catch (e) {
    // All 3 UAs hit the login wall or timed out — let user manually name it
    return { title: getInstagramFallbackTitle(url), description: '', thumbnail: null, platform: 'instagram' };
  }
}


async function scrapeMetadata(url) {
  // Delegate Instagram URLs to dedicated scraper with social-bot UAs
  if (url && url.includes('instagram.com')) {
    return scrapeInstagram(url);
  }

  let matchedPlatform = null;

  for (const platform of STREAMING_PLATFORMS) {
    if (platform.match.test(url)) {
      matchedPlatform = platform;
      break;
    }
  }

  let title = '';
  let thumbnail = '';
  let description = '';

  const attemptFetch = async (targetUrl, ua, lang = 'en-US,en;q=0.9') => {
    const { data } = await axios.get(targetUrl, {
      headers: { 'User-Agent': ua, 'Accept-Language': lang },
      timeout: 3000
    });
    const $ = cheerio.load(data);
    const getMeta = (prop) => $(`meta[property="${prop}"]`).attr('content') || $(`meta[name="${prop}"]`).attr('content') || '';
    
    let resTitle = getMeta('og:title') || $('title').text();
    let resDescription = getMeta('og:description');
    const resThumbnail = getMeta('og:image');
    
    // Scrub useless Instagram titles (like "Login • Instagram")
    if (targetUrl.includes('instagram.com')) {
      const cleanT = resTitle.toLowerCase().replace(/[^a-z]/g, '');
      if (cleanT === 'login' || cleanT === 'instagram' || cleanT === 'logininstagram') {
        resTitle = '';
        resDescription = '';
      }
    }
    
    if (!resTitle && !resThumbnail) {
      throw new Error('No metadata found');
    }
    
    return {
      title: resTitle,
      thumbnail: resThumbnail,
      description: resDescription
    };
  };

  // Strategies 1 & 2 - Run in parallel and take first successful result
  try {
    const res = await Promise.any(STRATEGY_UAS.map(ua => attemptFetch(url, ua)));
    if (res.title) title = res.title;
    if (res.thumbnail && !isFoodOrUnrelated(res.thumbnail)) thumbnail = res.thumbnail;
    if (res.description) description = res.description;
  } catch (e) {
    // All attempts failed
  }

  // Strategy 3: Amazon ASIN
  if ((!title || !thumbnail) && matchedPlatform && matchedPlatform.name === 'Amazon Prime') {
    const match = url.match(/(?:dp\/|detail\/)([A-Z0-9]{10})/i);
    if (match && match[1]) {
      const asinUrl = `https://www.amazon.com/dp/${match[1]}`;
      try {
        const res = await attemptFetch(asinUrl, STRATEGY_UAS[1], 'en-US'); // Try with Facebook bot UA
        if (res.title && !title) title = res.title;
        if (res.thumbnail && !isFoodOrUnrelated(res.thumbnail) && !thumbnail) thumbnail = res.thumbnail;
      } catch (e) {
        // ASIN fetch failed
      }
    }
  }

  // Strategy 4: OMDB API fallback (only for streaming platforms)
  if (matchedPlatform && (!title || title.toLowerCase().includes('untitled') || !thumbnail)) {
    let searchKeyword = cleanTitleForOMDB(title) || extractKeywordFromUrl(url);
    if (searchKeyword && process.env.OMDB_API_KEY) {
      try {
        const { data } = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(searchKeyword)}&apikey=${process.env.OMDB_API_KEY}`, { timeout: 4000 });
        if (data && data.Response === 'True') {
          if (!title || title.toLowerCase().includes('untitled')) title = data.Title;
          if (!thumbnail && data.Poster && data.Poster !== 'N/A') thumbnail = data.Poster;
        }
      } catch (e) {
        console.warn('[scraper] OMDB fallback failed', e.message);
      }
    }
  }

  // Final Priorities
  if (!title || title.toLowerCase().includes('untitled')) {
    title = matchedPlatform ? `${matchedPlatform.name} Video` : 'Untitled';
  }

  if (!thumbnail) {
    thumbnail = matchedPlatform ? matchedPlatform.logo : '';
  }

  return { title, description, thumbnail };
}

module.exports = { scrapeMetadata };
