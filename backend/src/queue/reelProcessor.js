const { Worker } = require('bullmq');
const { connection } = require('./reelQueue');
const { scrapeMetadata } = require('../services/metadataScraper');
const { categorizeReel } = require('../services/geminiService');
const { sendDM } = require('../services/instagramReplyService');
const { detectPlatform } = require('../services/urlExtractor');
const db = require('../db/database');

const worker = new Worker(
  'reel-save',
  async (job) => {
    const { senderId, url, senderName } = job.data;

    // 1 — Find or create user
    const user = db.findOrCreateUser(senderId, senderName);

    // 2 — Scrape metadata from URL
    const { title, description, thumbnail } = await scrapeMetadata(url);

    // 3 — Get user's existing categories
    const existingCats = db.getUserCategories(user.id).map((c) => c.name);

    // 4 — Ask Gemini for category
    const categoryName = await categorizeReel({
      url,
      title,
      description,
      thumbnailUrl: thumbnail,
      existingCategories: existingCats,
    });

    // 5 — Find or create category
    const category = db.findOrCreateCategory(user.id, categoryName);

    // 6 — Save reel
    db.saveReel({
      userId: user.id,
      categoryId: category.id,
      url,
      title,
      thumbnail,
      platform: detectPlatform(url),
    });

    // 7 — Reply to user on Instagram
    const reelCount = db.getReelsByCategory(user.id, category.id).length;
    const isNew = existingCats.length === 0 || !existingCats.map(c => c.toLowerCase()).includes(categoryName.toLowerCase());

    await sendDM(
      senderId,
      `✅ Saved to *${categoryName}*!${isNew ? ' 🆕 New collection created!' : ''}\nYou now have ${reelCount} reel${reelCount > 1 ? 's' : ''} there. 🎬`
    );

    console.info('[worker] reel saved', { senderId, categoryName, title });
  },
  { connection, concurrency: 5 }
);

worker.on('failed', async (job, err) => {
  console.error('[worker] job failed', { jobId: job.id, error: err.message });
  // Notify user only on final failure
  if (job.attemptsMade >= job.opts.attempts) {
    await sendDM(job.data.senderId, "Oops! Couldn't save that reel 😕 Please try sending the link again!");
  }
});

console.info('[worker] reel queue worker started');

module.exports = { worker };
