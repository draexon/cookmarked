const URL_REGEX = /https?:\/\/[^\s]+/gi;

const PLATFORM_PATTERNS = {
  Instagram: /instagram\.com\/(reel|reels|p|tv)\//i,
  YouTube: /youtube\.com\/(shorts\/|watch\?)|youtu\.be\//i,
  Facebook: /facebook\.com\/(reel|watch|video)/i,
  TikTok: /tiktok\.com\/@.+\/video\/|vm\.tiktok\.com\//i,
  Netflix: /netflix\.com\/(watch|title)\//i,
  'Prime Video': /(primevideo\.com\/(detail|region)|amazon\.[a-z.]+\/.*(?:gp\/video|dp\/))/i,
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
  return 'Other';
}

module.exports = { extractUrl, detectPlatform };
