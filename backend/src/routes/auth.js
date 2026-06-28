const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const authenticateToken = require('../middleware/authenticateToken');
const { db } = require('../db/database');

const router = express.Router();
const ACCESS_TOKEN_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';
const PASSWORD_SALT_ROUNDS = 12;

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL         = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL          = process.env.BACKEND_URL  || 'http://localhost:3000';
const REDIRECT_URI         = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback";

// ─── Helper functions (must be before routes) ────────────────────────────────

function getJwtSecret() {
  if (!process.env.JWT_SECRET) throw new Error('Missing required env var: JWT_SECRET');
  return process.env.JWT_SECRET;
}

function sanitizeUser(user) {
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url, created_at: user.created_at };
}

function makeTokenPayload(user) {
  return { id: user.id, email: user.email, name: user.name };
}

function issueTokens(user) {
  const payload = makeTokenPayload(user);
  const secret = getJwtSecret();
  return {
    access_token:  jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_EXPIRES_IN }),
    refresh_token: jwt.sign({ ...payload, type: 'refresh' }, secret, { expiresIn: REFRESH_TOKEN_EXPIRES_IN }),
  };
}

function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
}

function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function usersTableHasColumn(columnName) {
  return db.prepare('PRAGMA table_info(users)').all().some((col) => col.name === columnName);
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

router.get('/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(501).json({ message: 'Google OAuth not configured — set GOOGLE_CLIENT_ID in .env' });
  }
  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${FRONTEND_URL}/login?error=google_failed`);

  try {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    });

    const { access_token: googleToken } = tokenRes.data;

    const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${googleToken}` },
    });

    const { email, name, picture } = userRes.data;

    let user = findUserByEmail(email);

    if (!user) {
      const createdAt = new Date().toISOString();
      const columns = ['email', 'name', 'avatar_url', 'created_at'];
      const values  = [email.toLowerCase(), name, picture || null, createdAt];

      if (usersTableHasColumn('instagram_id')) {
        columns.unshift('instagram_id');
        values.unshift(`google:${email}`);
      }

      const placeholders = columns.map(() => '?').join(', ');
      const result = db.prepare(`INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders})`).run(...values);
      user = findUserById(result.lastInsertRowid);
    }

    const tokens = issueTokens(user);
    const params = new URLSearchParams({
      token:         tokens.access_token,
      refresh_token: tokens.refresh_token,
      user:          JSON.stringify(sanitizeUser(user)),
    });

    res.redirect(`${FRONTEND_URL}/auth/callback?${params}`);
  } catch (err) {
    console.error('[google-oauth] error', err.response?.data || err.message);
    res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
  }
});

// ─── Email/password routes ────────────────────────────────────────────────────

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim();
    const password = String(req.body?.password || '');
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = findUserByEmail(email);
    if (!user || !user.password_hash) return res.status(401).json({ message: 'Invalid email or password' });

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) return res.status(401).json({ message: 'Invalid email or password' });

    return res.json({ ...issueTokens(user), user: sanitizeUser(user) });
  } catch (err) { return next(err); }
});

router.post('/register', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const name = String(req.body?.name || '').trim();

    if (!email || !password || !name) return res.status(400).json({ message: 'Name, email, and password are required' });
    if (findUserByEmail(email)) return res.status(409).json({ message: 'Email is already registered' });

    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    const createdAt = new Date().toISOString();
    const columns = ['email', 'password_hash', 'name', 'created_at'];
    const values = [email, passwordHash, name, createdAt];

    if (usersTableHasColumn('instagram_id')) {
      columns.unshift('instagram_id');
      values.unshift(`auth:${email}`);
    }

    const placeholders = columns.map(() => '?').join(', ');
    const result = db.prepare(`INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders})`).run(...values);
    const user = findUserById(result.lastInsertRowid);

    return res.status(201).json({ ...issueTokens(user), user: sanitizeUser(user) });
  } catch (err) {
    if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ message: 'Email is already registered' });
    return next(err);
  }
});

router.get('/me', authenticateToken, (req, res, next) => {
  try {
    const user = findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(sanitizeUser(user));
  } catch (err) { return next(err); }
});

router.post('/refresh', (req, res) => {
  const refreshToken = req.body?.refresh_token;
  if (!refreshToken) return res.status(400).json({ message: 'refresh_token is required' });
  try {
    const payload = jwt.verify(refreshToken, getJwtSecret());
    if (payload.type !== 'refresh') return res.status(401).json({ message: 'Invalid refresh token' });
    const user = findUserById(payload.id);
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });
    const access_token = jwt.sign(makeTokenPayload(user), getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
    return res.json({ access_token });
  } catch { return res.status(401).json({ message: 'Invalid or expired refresh token' }); }
});

router.post('/forgot-password', (_req, res) => res.json({ message: 'email sent' }));
router.post('/reset-password',  (_req, res) => res.json({ message: 'password reset' }));

module.exports = router;
