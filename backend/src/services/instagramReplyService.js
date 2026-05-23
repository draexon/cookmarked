const axios = require('axios');
const { metaPageAccessToken } = require('../config');

const GRAPH_URL = 'https://graph.facebook.com/v19.0/me/messages';

async function sendDM(recipientId, text) {
  try {
    await axios.post(
      GRAPH_URL,
      {
        recipient: { id: recipientId },
        message: { text },
        messaging_type: 'RESPONSE',
      },
      {
        params: { access_token: metaPageAccessToken },
      }
    );
  } catch (err) {
    console.error('[instagram-reply] failed to send DM', {
      recipientId,
      error: err.response?.data || err.message,
    });
  }
}

module.exports = { sendDM };
