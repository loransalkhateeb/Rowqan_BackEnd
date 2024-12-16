const redis = require('@redis/client');


const client = redis.createClient({
  url: 'redis://localhost:6379',
});


client.connect().then(() => {
  console.log('Connected to Redis');
}).catch((err) => {
  console.error('Redis connection error:', err);
});


client.on('error', (err) => {
  console.error('Redis error:', err);
});


const ensureRedisConnection = async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
  } catch (err) {
    console.error('Error reconnecting to Redis:', err);
  }
};

module.exports = { client, ensureRedisConnection };
