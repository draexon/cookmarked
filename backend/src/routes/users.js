const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const authenticateToken = require('../middleware/authenticateToken');
const { db } = require('../db/database');

const router = express.Router();
const PASSWORD_SALT_ROUNDS = 12;
const avatarDir = path.join(__dirname, '../../uploads/avatars');

fs.mkdirSync(avatarDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const upload = multer({ storage });

router.use(authenticateToken);

function ok(res, data) {
  return res.json({ success: true, data });
}

function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
  };
}

function getCurrentUser(userId) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
}

router.patch('/users/me', (req, res, next) => {
  try {
    const user = getCurrentUser(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const name = req.body?.name === undefined ? user.name : String(req.body.name).trim();
    const avatarUrl = req.body?.avatar_url === undefined ? user.avatar_url : String(req.body.avatar_url).trim();

    db.prepare('UPDATE users SET name = ?, avatar_url = ? WHERE id = ?')
      .run(name, avatarUrl, req.user.id);

    return ok(res, sanitizeUser(getCurrentUser(req.user.id)));
  } catch (err) {
    return next(err);
  }
});

router.patch('/users/me/password', async (req, res, next) => {
  try {
    const currentPassword = String(req.body?.current_password || '');
    const newPassword = String(req.body?.new_password || '');

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    const user = getCurrentUser(req.user.id);
    if (!user || !user.password_hash) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, req.user.id);

    return ok(res, sanitizeUser(getCurrentUser(req.user.id)));
  } catch (err) {
    return next(err);
  }
});

router.patch('/users/me/avatar', upload.single('avatar'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Avatar file is required' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatarUrl, req.user.id);

    return ok(res, sanitizeUser(getCurrentUser(req.user.id)));
  } catch (err) {
    return next(err);
  }
});

router.get('/users/me/stats', (req, res, next) => {
  try {
    const totalReels = db.prepare('SELECT COUNT(*) AS count FROM reels WHERE user_id = ?')
      .get(req.user.id).count;
    const totalCollections = db.prepare('SELECT COUNT(*) AS count FROM collections WHERE user_id = ?')
      .get(req.user.id).count;
    const favoriteReels = db.prepare('SELECT COUNT(*) AS count FROM reels WHERE user_id = ? AND is_favorite = 1')
      .get(req.user.id).count;
    const favoriteCollections = db.prepare('SELECT COUNT(*) AS count FROM collections WHERE user_id = ? AND is_favorite = 1')
      .get(req.user.id).count;

    return ok(res, {
      total_reels: totalReels,
      total_collections: totalCollections,
      total_favorites: favoriteReels + favoriteCollections,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
