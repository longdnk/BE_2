const redis = require('redis');
const client = redis.createClient({
    url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

const setWithTime = async (key, value, ttlSeconds = 60) => {
    return await client.setEx(key, ttlSeconds, JSON.stringify(value));
}

const connectRedis = async () => {
    client.on('error', (err) => {})//console.log('Redis Client Error', err));
    client.on('ready', () => {
        console.log('redis is running');
    });
    await client.connect();
}

const getByKey = async (key) => {
    console.log('get: ' + key)
    const jsonString =  await client.get(key);
    if (jsonString) {
        return JSON.parse(jsonString)
    }
}

const deleteKey = async (key) => {
    return await client.del(key);
}

module.exports = {
    connectRedis,
    getByKey,
    setWithTime,
    deleteKey
}