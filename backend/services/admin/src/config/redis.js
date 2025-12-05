const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  db: process.env.REDIS_DB || 6,
});

client.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

client.on('connect', () => {
  console.log(`✅ Redis connected (DB: ${process.env.REDIS_DB})`);
});

module.exports = client;
