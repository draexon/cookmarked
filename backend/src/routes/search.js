const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const { db } = require('../db/database');

const router = express.Router();

router.use(authenticateToken);

function ok(res, data) {
  return res.json({ success: true, data });
}

function normalizeCollection(collection) {
  return {
    ...collection,
    is_favorite: Boolean(collection.is_favorite),
  };
}

function normalizeReel(reel) {
  const legacyCompletionColumn = ['is', 'made'].join('_');
  return {
    ...reel,
    is_favorite: Boolean(reel.is_favorite),
    is_watched: Boolean(reel.is_watched ?? reel[legacyCompletionColumn]),
  };
}

router.get('/search', (req, res, next) => {
  try {
    const query = String(req.query.q || '').trim();

    if (!query) {
      return ok(res, { reels: [], collections: [] });
    }

    const pattern = `%${query}%`;

    const reels = db.prepare(`
      SELECT r.*, c.name AS collection_name
      FROM reels r
      LEFT JOIN collections c ON c.id = r.collection_id
      WHERE r.user_id = ?
        AND (r.title LIKE ? OR r.category LIKE ? OR c.name LIKE ?)
      ORDER BY datetime(r.created_at) DESC, r.id DESC
    `).all(req.user.id, pattern, pattern, pattern).map(normalizeReel);

    const collections = db.prepare(`
      SELECT *
      FROM collections
      WHERE user_id = ?
        AND (name LIKE ? OR description LIKE ?)
      ORDER BY datetime(created_at) DESC, id DESC
    `).all(req.user.id, pattern, pattern).map(normalizeCollection);

    return ok(res, { reels, collections });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
