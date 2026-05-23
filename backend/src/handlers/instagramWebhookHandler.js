const { extractUrl } = require('../services/urlExtractor');
const { sendDM } = require('../services/instagramReplyService');

const INSTAGRAM_OBJECTS = new Set(['instagram', 'page']);

function parseWebhookPayload(payload) {
  if (!payload || !INSTAGRAM_OBJECTS.has(payload.object)) return [];

  const events = [];

  for (const entry of payload.entry || []) {
    for (const messaging of entry.messaging || []) {
      events.push({
        type: 'messaging',
        senderId: messaging.sender?.id,
        message: messaging.message,
      });
    }
    for (const change of entry.changes || []) {
      events.push({ type: 'change', field: change.field, value: change.value });
    }
  }

  return events;
}

async function handleInstagramWebhook(payload) {
  console.log('[webhook-handler] 📨 Received payload:', JSON.stringify(payload, null, 2));

  const events = parseWebhookPayload(payload);

  if (events.length === 0) {
    console.log('[webhook-handler] ℹ️  No events parsed (object type:', payload?.object, ')');
    return;
  }

  console.log('[webhook-handler] 📋 Parsed events:', events.length);

  for (const event of events) {
    if (event.type === 'messaging' && event.message) {
      await handleIncomingMessage(event);
    }
  }
}

async function handleIncomingMessage(event) {
  const { senderId, message } = event;
  console.log('[webhook-handler] 💬 Message from', senderId, ':', message?.text || '[attachment]');

  const extracted = extractUrl(message);

  if (!extracted) {
    const text = message?.text?.toLowerCase().trim();
    if (text === 'hi' || text === 'hello' || text === 'start') {
      await sendDM(senderId,
        "Hey! 👋 I'm CookMarked bot!\n\nJust send me any reel link and I'll save it to your collection automatically! 🎬✨"
      );
    } else if (text) {
      await sendDM(senderId,
        "Send me a reel link and I'll save it! 🔗\nExample: paste an Instagram, YouTube, TikTok or Facebook link!"
      );
    }
    return;
  }

  console.log('[webhook-handler] 🔗 URL detected:', extracted.url, 'via', extracted.source);
  await sendDM(senderId, "Got it! Saving your reel... 🔄");
  console.info('[webhook-handler] ✅ Reel received (queue coming soon)', { senderId, url: extracted.url });
}

module.exports = { parseWebhookPayload, handleInstagramWebhook };
