const crypto = require('crypto');
const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const { db } = require('../db/database');

const router = express.Router();

function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function toBool(value) {
  return Boolean(value);
}

const CATEGORY_IDS = {
  fitness: 'fitness',
  travel: 'travel',
  fashion: 'fashion',
  tech: 'tech',
  music: 'music',
  comedy: 'comedy',
  diy: 'diy',
  beauty: 'beauty',
  education: 'education',
  gaming: 'gaming',
  other: 'other',
};

function categoryIdForCollectionName(name) {
  const normalized = String(name || '').trim().toLowerCase();
  return CATEGORY_IDS[normalized] || normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'other';
}

function normalizeCollection(collection) {
  if (!collection) return null;

  return {
    ...collection,
    category: categoryIdForCollectionName(collection.name),
    is_favorite: toBool(collection.is_favorite),
  };
}

function getCollectionMeta(collectionId) {
  const reelCount = db.prepare('SELECT COUNT(*) AS count FROM reels WHERE collection_id = ?')
    .get(collectionId).count;
  const platforms = db.prepare(`
    SELECT DISTINCT platform
    FROM reels
    WHERE collection_id = ? AND platform IS NOT NULL AND platform != ''
  `).all(collectionId).map((row) => row.platform);
  const cover = db.prepare(`
    SELECT thumbnail
    FROM reels
    WHERE collection_id = ? AND thumbnail IS NOT NULL AND thumbnail != ''
    ORDER BY datetime(created_at) DESC, id DESC
    LIMIT 1
  `).get(collectionId);
  const latestReel = db.prepare(`
    SELECT created_at
    FROM reels
    WHERE collection_id = ?
    ORDER BY datetime(created_at) DESC, id DESC
    LIMIT 1
  `).get(collectionId);
  const collection = db.prepare('SELECT created_at, last_opened_at FROM collections WHERE id = ?')
    .get(collectionId);
  const activityDates = [
    latestReel?.created_at,
    collection?.last_opened_at,
    collection?.created_at,
  ].filter(Boolean);

  return {
    reel_count: reelCount,
    platforms,
    cover_image: cover?.thumbnail || null,
    updated_at: activityDates.sort((a, b) => new Date(b) - new Date(a))[0] || null,
  };
}

function normalizeCollectionWithMeta(collection) {
  const normalized = normalizeCollection(collection);
  if (!normalized) return null;

  return {
    ...normalized,
    ...getCollectionMeta(normalized.id),
  };
}

function normalizeReel(reel) {
  if (!reel) return null;
  const legacyCompletionColumn = ['is', 'made'].join('_');

  return {
    ...reel,
    is_favorite: toBool(reel.is_favorite),
    is_watched: toBool(reel.is_watched ?? reel[legacyCompletionColumn]),
  };
}

function getCollectionForUser(id, userId) {
  const value = String(id || '').trim();
  if (/^\d+$/.test(value)) {
    return db.prepare('SELECT * FROM collections WHERE id = ? AND user_id = ?').get(value, userId);
  }

  const name = value.replace(/-/g, ' ');
  return db.prepare(`
    SELECT *
    FROM collections
    WHERE user_id = ?
      AND (
        LOWER(name) = LOWER(?)
        OR LOWER(REPLACE(name, ' ', '-')) = LOWER(?)
      )
  `).get(userId, name, value);
}

function getOrCreateOtherCollection(userId, excludeCollectionId) {
  const existing = db.prepare(`
    SELECT *
    FROM collections
    WHERE user_id = ?
      AND LOWER(name) = 'other'
      AND id != ?
    ORDER BY datetime(created_at) ASC, id ASC
    LIMIT 1
  `).get(userId, excludeCollectionId || 0);

  if (existing) return existing;

  const result = db.prepare(`
    INSERT INTO collections (user_id, name, description, emoji, is_favorite, created_at)
    VALUES (?, 'Other', 'Reels moved from deleted collections.', NULL, 0, ?)
  `).run(userId, new Date().toISOString());

  return db.prepare('SELECT * FROM collections WHERE id = ? AND user_id = ?')
    .get(result.lastInsertRowid, userId);
}

function getReelsForCollection(collectionId) {
  return db.prepare(`
    SELECT r.*, c.name AS collection_name
    FROM reels r
    LEFT JOIN collections c ON c.id = r.collection_id
    WHERE r.collection_id = ?
    ORDER BY datetime(r.created_at) DESC, r.id DESC
  `).all(collectionId).map(normalizeReel);
}

function buildShareUrl(req, shareToken) {
  return `${req.protocol}://${req.get('host')}/api/share/${shareToken}`;
}

function generateShareToken() {
  return crypto.randomBytes(18).toString('base64url');
}

router.get('/collections', authenticateToken, (req, res, next) => {
  try {
    const favoriteOnly = String(req.query.favorite || '').toLowerCase() === 'true';
    const category = String(req.query.category || '').trim().toLowerCase();
    const platform = String(req.query.platform || '').trim().toLowerCase();
    const limit = Math.max(0, Math.min(Number.parseInt(req.query.limit, 10) || 0, 100));
    const sort = String(req.query.sort || 'recent').trim().toLowerCase();
    const params = [req.user.id];
    const conditions = ['c.user_id = ?'];

    if (favoriteOnly) {
      conditions.push('c.is_favorite = 1');
    }

    if (category) {
      conditions.push('LOWER(c.name) = LOWER(?)');
      params.push(category);
    }

    if (platform) {
      conditions.push(`EXISTS (
        SELECT 1
        FROM reels r_platform
        WHERE r_platform.collection_id = c.id
          AND LOWER(r_platform.platform) = ?
      )`);
      params.push(platform);
    }

    const orderBy = {
      oldest: 'datetime(c.created_at) ASC, c.id ASC',
      name: 'LOWER(c.name) ASC, c.id ASC',
      favorites: 'c.is_favorite DESC, datetime(c.created_at) DESC, c.id DESC',
      recent: 'datetime(c.created_at) DESC, c.id DESC',
    }[sort] || 'datetime(c.created_at) DESC, c.id DESC';

    const collections = db.prepare(`
      SELECT c.*
      FROM collections c
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderBy}
      ${limit ? 'LIMIT ?' : ''}
    `).all(...(limit ? [...params, limit] : params)).map(normalizeCollectionWithMeta);

    return ok(res, collections);
  } catch (err) {
    return next(err);
  }
});

router.get('/collections/:id', authenticateToken, (req, res, next) => {
  try {
    const collection = getCollectionForUser(req.params.id, req.user.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    db.prepare('UPDATE collections SET last_opened_at = ? WHERE id = ? AND user_id = ?')
      .run(new Date().toISOString(), collection.id, req.user.id);
    const updatedCollection = getCollectionForUser(collection.id, req.user.id);

    return ok(res, {
      ...normalizeCollectionWithMeta(updatedCollection),
      reels: getReelsForCollection(collection.id),
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/collections', authenticateToken, (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const description = req.body?.description == null ? null : String(req.body.description).trim();
    const emoji = req.body?.emoji == null ? null : String(req.body.emoji).trim();

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const result = db.prepare(`
      INSERT INTO collections (user_id, name, description, emoji, is_favorite, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(req.user.id, name, description, emoji, new Date().toISOString());

    const collection = db.prepare('SELECT * FROM collections WHERE id = ?').get(result.lastInsertRowid);
    return ok(res, normalizeCollectionWithMeta(collection), 201);
  } catch (err) {
    return next(err);
  }
});

router.patch('/collections/:id', authenticateToken, (req, res, next) => {
  try {
    const collection = getCollectionForUser(req.params.id, req.user.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const nextName = req.body?.name === undefined ? collection.name : String(req.body.name).trim();
    const nextDescription = req.body?.description === undefined ? collection.description : String(req.body.description).trim();
    const nextEmoji = req.body?.emoji === undefined ? collection.emoji : String(req.body.emoji).trim();

    if (!nextName) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    db.prepare(`
      UPDATE collections
      SET name = ?, description = ?, emoji = ?
      WHERE id = ? AND user_id = ?
    `).run(nextName, nextDescription, nextEmoji, collection.id, req.user.id);

    const updated = getCollectionForUser(collection.id, req.user.id);
    return ok(res, normalizeCollectionWithMeta(updated));
  } catch (err) {
    return next(err);
  }
});

router.delete('/collections/:id', authenticateToken, (req, res, next) => {
  try {
    const collection = getCollectionForUser(req.params.id, req.user.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const deleted = db.transaction(() => {
      const fallback = getOrCreateOtherCollection(req.user.id, collection.id);
      db.prepare(`
        UPDATE reels
        SET collection_id = ?, category = ?
        WHERE user_id = ? AND collection_id = ?
      `).run(fallback.id, fallback.name, req.user.id, collection.id);

      db.prepare('DELETE FROM collections WHERE id = ? AND user_id = ?').run(collection.id, req.user.id);
      return { id: collection.id, moved_to_collection_id: fallback.id };
    })();

    return ok(res, deleted);
  } catch (err) {
    return next(err);
  }
});

router.post('/collections/:id/favorite', authenticateToken, (req, res, next) => {
  try {
    const collection = getCollectionForUser(req.params.id, req.user.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const nextFavorite = collection.is_favorite ? 0 : 1;
    db.prepare(`
      UPDATE collections
      SET is_favorite = ?
      WHERE id = ? AND user_id = ?
    `).run(nextFavorite, collection.id, req.user.id);

    const updated = getCollectionForUser(collection.id, req.user.id);
    return ok(res, normalizeCollectionWithMeta(updated));
  } catch (err) {
    return next(err);
  }
});

router.post('/share/:id', authenticateToken, (req, res, next) => {
  try {
    const collection = getCollectionForUser(req.params.id, req.user.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    let shareToken = collection.share_token;

    while (!shareToken) {
      const candidate = generateShareToken();
      const existing = db.prepare('SELECT id FROM collections WHERE share_token = ?').get(candidate);
      if (!existing) shareToken = candidate;
    }

    if (shareToken !== collection.share_token) {
      db.prepare('UPDATE collections SET share_token = ? WHERE id = ? AND user_id = ?')
        .run(shareToken, collection.id, req.user.id);
    }

    return ok(res, { share_url: buildShareUrl(req, shareToken) });
  } catch (err) {
    return next(err);
  }
});

router.get('/share/:shareToken', (req, res, next) => {
  try {
    const collection = db.prepare('SELECT * FROM collections WHERE share_token = ?').get(req.params.shareToken);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Shared collection not found' });
    }

    return ok(res, {
      ...normalizeCollectionWithMeta(collection),
      reels: getReelsForCollection(collection.id),
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
