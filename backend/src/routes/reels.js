const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const { db } = require('../db/database');
const { scrapeMetadata } = require('../services/metadataScraper');
const { categorizeReel } = require('../services/geminiService');
const { detectPlatform } = require('../services/urlExtractor');

const router = express.Router();

router.use(authenticateToken);

function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function normalizeReel(reel) {
  if (!reel) return null;

  return {
    ...reel,
    is_favorite: Boolean(reel.is_favorite),
    is_made: Boolean(reel.is_made),
  };
}

function getReelForUser(id, userId) {
  return db.prepare('SELECT * FROM reels WHERE id = ? AND user_id = ?').get(id, userId);
}

function normalizeCategoryFilter(category) {
  const value = String(category || '').trim();
  if (!value) return null;
  return CATEGORY_COLLECTIONS[value.toLowerCase()]?.name || value;
}

function reelsTableHasColumn(columnName) {
  return db.prepare('PRAGMA table_info(reels)').all().some((column) => column.name === columnName);
}

const CATEGORY_COLLECTIONS = {
  food: { name: 'Food', emoji: '🍳' },
  fitness: { name: 'Fitness', emoji: '💪' },
  travel: { name: 'Travel', emoji: '✈️' },
  fashion: { name: 'Fashion', emoji: '👗' },
  tech: { name: 'Tech', emoji: '💻' },
  music: { name: 'Music', emoji: '🎵' },
  comedy: { name: 'Comedy', emoji: '😂' },
  diy: { name: 'DIY', emoji: '🔨' },
  beauty: { name: 'Beauty', emoji: '💄' },
  education: { name: 'Education', emoji: '📚' },
  gaming: { name: 'Gaming', emoji: '🎮' },
  other: { name: 'Other', emoji: '📌' },
};

function normalizeCategory(category) {
  const value = String(category || '').trim();
  if (!value) return 'Other';

  return CATEGORY_COLLECTIONS[value.toLowerCase()]?.name || value;
}

function inferCategoryFromText(...parts) {
  const text = parts.filter(Boolean).join(' ').toLowerCase();

  if (/(#dance|#choreography|choreograph|dancing|dance class|semiclassical|hip hop|ballet|salsa)/i.test(text)) {
    return 'Dance';
  }

  if (/(#food|#recipe|recipe|cooking|cook|pasta|pizza|biryani|dinner|lunch|breakfast|kitchen)/i.test(text)) {
    return 'Food';
  }

  if (/(#fitness|workout|gym|exercise|training|cardio|yoga|hiit)/i.test(text)) {
    return 'Fitness';
  }

  if (/(#travel|travel|trip|hotel|flight|beach|mountain|vacation|tour)/i.test(text)) {
    return 'Travel';
  }

  if (/(chess|gambit|checkmate|knight|bishop|rook|queen sacrifice)/i.test(text)) {
    return 'Chess';
  }

  return null;
}

function getOrCreateCollectionForCategory(userId, category) {
  const normalizedCategory = normalizeCategory(category);
  const config = CATEGORY_COLLECTIONS[normalizedCategory.toLowerCase()] || {
    name: normalizedCategory,
    emoji: CATEGORY_COLLECTIONS.other.emoji,
  };
  let collection = db.prepare('SELECT * FROM collections WHERE user_id = ? AND LOWER(name) = LOWER(?)')
    .get(userId, config.name);

  if (!collection) {
    const result = db.prepare(`
      INSERT INTO collections (user_id, name, description, emoji, is_favorite, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(
      userId,
      config.name,
      `Auto-created for ${config.name.toLowerCase()} reels.`,
      config.emoji,
      new Date().toISOString()
    );

    collection = db.prepare('SELECT * FROM collections WHERE id = ? AND user_id = ?')
      .get(result.lastInsertRowid, userId);
  }

  return collection;
}

router.post('/reels', async (req, res, next) => {
  try {
    const url = String(req.body?.url || '').trim();
    const providedTitle = req.body?.title == null ? '' : String(req.body.title).trim();
    const providedThumbnail = req.body?.thumbnail == null ? '' : String(req.body.thumbnail).trim();
    const providedCategory = req.body?.category == null ? '' : String(req.body.category).trim();
    let collectionId = req.body?.collection_id ?? null;
    const note = req.body?.note == null ? null : String(req.body.note).trim();

    if (!url) {
      return res.status(400).json({ success: false, message: 'Url is required' });
    }

    let scraped = { title: '', description: '', thumbnail: '' };
    try {
      scraped = await scrapeMetadata(url);
    } catch (err) {
      console.warn('[reels] metadata scrape failed; using provided values', { url, error: err.message });
    }

    const title = scraped.title && scraped.title !== 'Untitled'
      ? scraped.title
      : providedTitle || null;
    const description = scraped.description || '';
    const thumbnail = scraped.thumbnail || providedThumbnail || null;
    const platform = detectPlatform(url);

    const existingCollections = db.prepare(`
      SELECT name
      FROM collections
      WHERE user_id = ? AND name IS NOT NULL AND name != ''
      ORDER BY datetime(created_at) DESC, id DESC
    `).all(req.user.id).map((row) => row.name);

    const inferredCategory = inferCategoryFromText(title, description, providedTitle);
    let category = normalizeCategory(providedCategory);
    try {
      const aiCategory = normalizeCategory(await categorizeReel({
        title: title || providedTitle || 'Untitled',
        description,
        thumbnailUrl: thumbnail,
        existingCollections,
      }));
      category = aiCategory || inferredCategory || category;
    } catch (err) {
      console.warn('[reels] categorization failed; using provided category', { error: err.message });
      category = inferredCategory || category;
    }

    if (collectionId) {
      const collection = db.prepare('SELECT id, name FROM collections WHERE id = ? AND user_id = ?')
        .get(collectionId, req.user.id);
      if (!collection) {
        return res.status(404).json({ success: false, message: 'Collection not found' });
      }
      if (!providedCategory) {
        category = collection.name || 'Other';
      }
    } else {
      const collection = getOrCreateCollectionForCategory(req.user.id, category);
      collectionId = collection.id;
    }

    const columns = [
      'user_id',
      'collection_id',
      'url',
      'title',
      'thumbnail',
      'platform',
      'category',
      'note',
      'is_favorite',
      'status',
      'created_at',
    ];
    const values = [
      req.user.id,
      collectionId,
      url,
      title,
      thumbnail,
      platform,
      category,
      note,
      0,
      'saved',
      new Date().toISOString(),
    ];

    if (reelsTableHasColumn('category_id')) {
      columns.splice(2, 0, 'category_id');
      values.splice(2, 0, collectionId || 0);
    }

    const placeholders = columns.map(() => '?').join(', ');
    const result = db.prepare(`
      INSERT INTO reels (${columns.join(', ')})
      VALUES (${placeholders})
    `).run(...values);

    const reel = getReelForUser(result.lastInsertRowid, req.user.id);
    return ok(res, normalizeReel(reel), 201);
  } catch (err) {
    return next(err);
  }
});

router.get('/reels/random', (req, res, next) => {
  try {
    const category = normalizeCategoryFilter(req.query.category);
    const collectionId = req.query.collection_id == null ? null : String(req.query.collection_id).trim();
    const platform = req.query.platform == null ? null : String(req.query.platform).trim().toLowerCase();

    const conditions = ['r.user_id = ?'];
    const params = [req.user.id];

    if (category) {
      conditions.push('LOWER(r.category) = LOWER(?)');
      params.push(category);
    }

    if (collectionId) {
      conditions.push('r.collection_id = ?');
      params.push(collectionId);
    }

    if (platform) {
      conditions.push('LOWER(r.platform) = LOWER(?)');
      params.push(platform);
    }

    const reel = db.prepare(`
      SELECT r.*, c.name AS collection_name
      FROM reels r
      LEFT JOIN collections c ON c.id = r.collection_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY RANDOM()
      LIMIT 1
    `).get(...params);

    if (!reel) {
      return res.status(404).json({ success: false, message: 'No reels found' });
    }

    return ok(res, normalizeReel(reel));
  } catch (err) {
    return next(err);
  }
});

router.get('/reels/favorites', (req, res, next) => {
  try {
    const reels = db.prepare(`
      SELECT r.*, c.name AS collection_name
      FROM reels r
      LEFT JOIN collections c ON c.id = r.collection_id
      WHERE r.user_id = ? AND r.is_favorite = 1
      ORDER BY datetime(r.created_at) DESC, r.id DESC
    `).all(req.user.id).map(normalizeReel);

    return ok(res, reels);
  } catch (err) {
    return next(err);
  }
});

router.delete('/reels/:id', (req, res, next) => {
  try {
    const reel = getReelForUser(req.params.id, req.user.id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    db.prepare('DELETE FROM reels WHERE id = ? AND user_id = ?').run(reel.id, req.user.id);
    return ok(res, { id: reel.id });
  } catch (err) {
    return next(err);
  }
});

router.post('/reels/:id/favorite', (req, res, next) => {
  try {
    const reel = getReelForUser(req.params.id, req.user.id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const nextFavorite = reel.is_favorite ? 0 : 1;
    db.prepare('UPDATE reels SET is_favorite = ? WHERE id = ? AND user_id = ?')
      .run(nextFavorite, reel.id, req.user.id);

    const updated = getReelForUser(reel.id, req.user.id);
    return ok(res, normalizeReel(updated));
  } catch (err) {
    return next(err);
  }
});

router.patch('/reels/:id/note', (req, res, next) => {
  try {
    const reel = getReelForUser(req.params.id, req.user.id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const note = req.body?.note == null ? null : String(req.body.note).trim();
    db.prepare('UPDATE reels SET note = ? WHERE id = ? AND user_id = ?')
      .run(note, reel.id, req.user.id);

    const updated = getReelForUser(reel.id, req.user.id);
    return ok(res, normalizeReel(updated));
  } catch (err) {
    return next(err);
  }
});

router.post('/reels/:id/made', (req, res, next) => {
  try {
    const reel = getReelForUser(req.params.id, req.user.id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const nextMade = reel.is_made ? 0 : 1;
    db.prepare('UPDATE reels SET is_made = ? WHERE id = ? AND user_id = ?')
      .run(nextMade, reel.id, req.user.id);

    const updated = db.prepare(`
      SELECT r.*, c.name AS collection_name
      FROM reels r
      LEFT JOIN collections c ON c.id = r.collection_id
      WHERE r.id = ? AND r.user_id = ?
    `).get(reel.id, req.user.id);
    return ok(res, normalizeReel(updated));
  } catch (err) {
    return next(err);
  }
});

router.get('/reels/:id/status', (req, res, next) => {
  try {
    const reel = getReelForUser(req.params.id, req.user.id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    return ok(res, {
      id: reel.id,
      status: reel.status,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
