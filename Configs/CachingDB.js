const redis = require('redis');
const logger = require('../logger');


const redisClient = redis.createClient({ url: process.env.REDIS_URI });
redisClient.connect();



redisClient.on('connect', function() {
    logger('app').info('Redis Database connected');
});

redisClient.on('reconnecting', function() {
    logger('app').info('Redis Database reconnecting');
});

redisClient.on('ready', function() {
    logger('app').info('Redis Database ready');
});

redisClient.on('error', function (err) {
    logger('error').error(`Something went wrong :${err}`);
});

redisClient.on('end', function() {
    logger('app').info('Redis Database connection closed');
});


module.exports = redisClient;