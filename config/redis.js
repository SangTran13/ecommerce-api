import { createClient } from 'redis';

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URI
});

// Handle Redis connection events
redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

// Connect function
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
  }
};

export { redisClient, connectRedis };
export default redisClient;