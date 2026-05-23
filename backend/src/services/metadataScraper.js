const axios = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function scrapeMetadata(url) {
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 8000 });
    const $ = cheerio.load(data);

    const getMeta = (property) =>
      $(`meta[property="${property}"]`).attr('content') ||
      $(`meta[name="${property}"]`).attr('content') || '';

    return {
      title: getMeta('og:title') || $('title').text() || 'Untitled',
      description: getMeta('og:description') || '',
      thumbnail: getMeta('og:image') || '',
    };
  } catch (err) {
    console.warn('[scraper] failed to scrape metadata', { url, error: err.message });
    return { title: 'Untitled', description: '', thumbnail: '' };
  }
}

module.exports = { scrapeMetadata };
