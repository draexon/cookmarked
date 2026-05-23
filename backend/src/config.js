require('dotenv').config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  metaAppSecret: process.env.META_APP_SECRET || 'dummy_secret',
  metaVerifyToken: process.env.META_VERIFY_TOKEN || 'dummy_token',
  metaPageAccessToken: process.env.META_PAGE_ACCESS_TOKEN || 'dummy_token',
  geminiApiKey: requireEnv('GEMINI_API_KEY'),
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
};
