const redisClient = require('../Configs/CachingDB');



 exports.cacheBooks= async (req, res, next) => {

    const cachedData = await redisClient.get('books');

    if (cachedData) {
        return res.json(JSON.parse(cachedData));
    }

    next();
};
