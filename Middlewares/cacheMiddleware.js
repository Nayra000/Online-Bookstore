const redisClient = require('../Configs/CachingDB');



 exports.cacheBooks= async (req, res, next) => {

    const cachedData = await redisClient.get('books');

    if (cachedData) {
        return res.json(JSON.parse(cachedData));
    }

    next();
};

exports.cacheBookById = async (req, res, next) => {
    const id = req.params.id;
    const cachedData = await redisClient.get(`book:${id}`);

    if (cachedData) {
        return res.json(JSON.parse(cachedData));
    }

    next();
}
