const URL_REGEX = /https?:\/\/[^\s]+/gi;

const PLATFORM_PATTERNS = {
  instagram: /instagram\.com\/(reel|p|tv)\//i,
  youtube: /youtube\.com\/shorts\/|youtu\.be\//i,
  facebook: /facebook\.com\/(reel|watch|video)/i,
  tiktok: /tiktok\.com\/@.+\/video\//i,
};

function extractUrl(message) {
  if (!message) return null;

  // Check attachments first (shared reels come as attachments)
  if (message.attachments) {
    for (const att of message.attachments) {
      const url = att?.payload?.url;
      if (url) return { url, source: 'attachment' };
    }
  }

  // Check text for pasted URL
  if (message.text) {
    const matches = message.text.match(URL_REGEX);
    if (matches) return { url: matches[0], source: 'text' };
  }

  return null;
}

function detectPlatform(url) {
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(url)) return platform;
  }
  return 'unknown';
}

module.exports = { extractUrl, detectPlatform };
