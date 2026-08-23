const logger = require("../config/logger");

const rateLimitHandler = (req,res,next,options) => { 

    logger.warn({
        event:'rate.limit.exceeded',
        message:'Rate Limit exceeded',
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id || null
    })


    res.status(429).json({
        success: false,
        message: options.message,
        retryAfter : Math.ceil(options.windowMs/1000/60) + `minutes`
    })

}

module.exports = rateLimitHandler;