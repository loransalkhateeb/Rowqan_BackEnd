const { createClient } = require('redis');


const client = createClient({
  username: 'default',
  password: 'NXVbIXJuNZNA8906L4yZfvc6HvPHxxT2',  
  socket: {
    host: 'redis-15954.c322.us-east-1-2.ec2.redns.redis-cloud.com', 
    port: 15954,  
  }
});


client.on('connect', () => {
  console.log('Successfully connected to Redis!');
});


client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});


const startRedis = async () => {
  try {
 
    await client.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
};


const stopRedis = async () => {
  try {
    await client.quit();
    console.log('Redis connection closed');
  } catch (err) {
    console.error('Failed to close Redis connection:', err);
  }
};


startRedis();

module.exports = { client, startRedis, stopRedis };  
