const { Queue, Worker } = require('bullmq');
const { redisUrl } = require('../config');
const IORedis = require('ioredis');

const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

const reelQueue = new Queue('reel-save', { connection });

async function addReelJob(data) {
  await reelQueue.add('process-reel', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });
}

module.exports = { reelQueue, addReelJob, connection };
