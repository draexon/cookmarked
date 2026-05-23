const crypto = require('crypto');
const { metaAppSecret } = require('../config');

function safeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function verifyMetaSignature(rawBody, signatureHeader) {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', metaAppSecret)
    .update(rawBody)
    .digest('hex');

  const received = signatureHeader.slice('sha256='.length);
  return safeEqualHex(expected, received);
}

function verifyMetaSignatureMiddleware(req, res, next) {
  // DEV MODE: skip signature check if APP_SECRET is not set
  if (!metaAppSecret || process.env.NODE_ENV !== 'production') {
    console.warn('[webhook] ⚠️  META_APP_SECRET not set — skipping signature check (dev mode)');
    return next();
  }

  const signature = req.get('X-Hub-Signature-256');
  const rawBody = req.rawBody;

  if (!rawBody) {
    console.error('[webhook] ❌ No raw body — check express.json verify() is set up correctly');
    return res.sendStatus(400);
  }

  if (!signature) {
    console.error('[webhook] ❌ Missing X-Hub-Signature-256 header');
    return res.sendStatus(403);
  }

  if (!verifyMetaSignature(rawBody, signature)) {
    console.error('[webhook] ❌ Signature mismatch — META_APP_SECRET may be wrong');
    return res.sendStatus(403);
  }

  console.log('[webhook] ✅ Signature verified');
  next();
}

module.exports = {
  verifyMetaSignature,
  verifyMetaSignatureMiddleware,
};
