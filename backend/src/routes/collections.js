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

function normalizeCollection(collection) {
  if (!collection) return null;

  return {
    ...collection,
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

  return {
    reel_count: reelCount,
    platforms,
    cover_image: cover?.thumbnail || null,
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

  return {
    ...reel,
    is_favorite: toBool(reel.is_favorite),
    is_made: toBool(reel.is_made),
  };
}

function getCollectionForUser(id, userId) {
  return db.prepare('SELECT * FROM collections WHERE id = ? AND user_id = ?').get(id, userId);
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

    const collections = db.prepare(`
      SELECT *
      FROM collections
      WHERE user_id = ?
      ${favoriteOnly ? 'AND is_favorite = 1' : ''}
      ORDER BY datetime(created_at) DESC, id DESC
    `).all(req.user.id).map(normalizeCollectionWithMeta);

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

    return ok(res, {
      ...normalizeCollectionWithMeta(collection),
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

    db.prepare('DELETE FROM collections WHERE id = ? AND user_id = ?').run(collection.id, req.user.id);
    return ok(res, { id: collection.id });
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
