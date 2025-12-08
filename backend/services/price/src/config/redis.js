const redis = require('redis');
const { logger } = require('./logger');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  db: process.env.REDIS_DB || 2,
});

redisClient.on('error', (err) => {
  logger.error('❌ Redis error:', err.message);
});

redisClient.on('connect', () => {
  logger.info(`✅ Redis connected (DB: ${process.env.REDIS_DB || 2})`);
});

module.exports = redisClient;
