const express = require('express');
const path = require('path');
const cors = require('cors');
const { port } = require('./config');
const authRouter = require('./routes/auth');
const collectionsRouter = require('./routes/collections');
const reelsRouter = require('./routes/reels');
const searchRouter = require('./routes/search');
const usersRouter = require('./routes/users');
const instagramWebhook = require('./routes/instagramWebhook');

// Start queue worker
// require('./queue/reelProcessor');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// ─── Webhook route: must capture rawBody BEFORE global express.json() ──────
app.use(
  '/api/webhooks/instagram',
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use('/api/webhooks/instagram', instagramWebhook);

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'cookmarked' });
});

// ─── Static uploads ──────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Global body parsers (all non-webhook routes) ────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── API routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api', collectionsRouter);
app.use('/api', reelsRouter);
app.use('/api', searchRouter);
app.use('/api', usersRouter);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[server] unhandled error', err);
  res.sendStatus(500);
});

app.listen(port, () => {
  console.info(`CookMarked API listening on http://localhost:${port}`);
  console.info(`Instagram webhook: http://localhost:${port}/api/webhooks/instagram`);
});
