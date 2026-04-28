const Redis = require('ioredis');
require('dotenv').config();

const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

let client = null;
let redisAvailable = false;

function getRedisClient() {
  if (!REDIS_ENABLED) return null;
  if (client) return client;

  client = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy: () => null,
    connectTimeout: 2000,
  });

  client.on('connect', () => {
    redisAvailable = true;
    console.log('Redis connected');
  });

  client.on('error', () => {
    redisAvailable = false;
  });

  client.on('close', () => {
    redisAvailable = false;
  });

  return client;
}

async function cacheGet(key) {
  if (!REDIS_ENABLED || !redisAvailable) return null;
  try {
    const val = await getRedisClient().get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds) {
  if (!REDIS_ENABLED || !redisAvailable) return;
  try {
    const ttl = ttlSeconds || parseInt(process.env.REDIS_TTL_SECONDS) || 300;
    await getRedisClient().set(key, JSON.stringify(value), 'EX', ttl);
  } catch {}
}

async function cacheDel(key) {
  if (!REDIS_ENABLED || !redisAvailable) return;
  try {
    await getRedisClient().del(key);
  } catch {}
}

module.exports = { getRedisClient, cacheGet, cacheSet, cacheDel };