// redisClient.js
const redis = require('redis');

const redisClient = redis.createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379
  }
});

// Listen for successful connection
redisClient.on('connect', () => {
  console.log('Redis client connected successfully');
});

// Listen for ready state (fully usable)
redisClient.on('ready', () => {
  console.log('Redis client is ready to use');
});

// Listen for errors
redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Listen for disconnect
redisClient.on('end', () => {
  console.log('Redis client disconnected');
});

redisClient.connect();

module.exports = redisClient;
