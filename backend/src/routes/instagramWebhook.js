const express = require('express');
const { metaVerifyToken } = require('../config');
const { verifyMetaSignatureMiddleware } = require('../middleware/verifyMetaSignature');
const { handleInstagramWebhook } = require('../handlers/instagramWebhookHandler');

const router = express.Router();

/**
 * Meta webhook verification (App Dashboard setup).
 * GET /api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
 */
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === metaVerifyToken && challenge) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

/**
 * Instagram / Messenger event notifications.
 * Must respond 200 quickly; Meta retries on failure for up to 36 hours.
 */
router.post('/', verifyMetaSignatureMiddleware, async (req, res) => {
  res.sendStatus(200);

  try {
    const payload = req.body;
    await handleInstagramWebhook(payload);
  } catch (err) {
    console.error('[instagram-webhook] handler error', err);
  }
});

module.exports = router;
