const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const BROWSER_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const THUMBNAIL_DIR = path.join(__dirname, '../../uploads/thumbnails');

function extensionFromContentType(contentType) {
  const normalized = String(contentType || '').toLowerCase();
  if (normalized.includes('image/png')) return 'png';
  if (normalized.includes('image/webp')) return 'webp';
  return 'jpg';
}

async function downloadAndSaveThumbnail(imageUrl, platform) {
  try {
    if (!imageUrl) return null;

    const headers = {
      'User-Agent': BROWSER_UA,
    };

    if (String(platform || '').toLowerCase() === 'instagram') {
      headers.Referer = 'https://www.instagram.com/';
    }

    const response = await axios.get(imageUrl, {
      headers,
      responseType: 'arraybuffer',
      timeout: 5000,
      validateStatus: (status) => status >= 200 && status < 300,
    });

    const extension = extensionFromContentType(response.headers['content-type']);
    const hash = crypto
      .createHash('sha256')
      .update(`${imageUrl}${Date.now()}`)
      .digest('hex')
      .slice(0, 20);
    const filename = `${hash}.${extension}`;

    fs.mkdirSync(THUMBNAIL_DIR, { recursive: true });
    fs.writeFileSync(path.join(THUMBNAIL_DIR, filename), response.data);

    return `/uploads/thumbnails/${filename}`;
  } catch (err) {
    console.warn('[thumbnail] download failed', imageUrl, err.message);
    return null;
  }
}

module.exports = { downloadAndSaveThumbnail };
