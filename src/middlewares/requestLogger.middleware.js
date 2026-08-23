const logger = require("../config/logger");
const { v4: uuid } = require('uuid');



const requestLogger = (req, res, next) => {

    req.requestId = uuid();

    const start = Date.now();


    res.on('finish', () => {

        logger.info({
            event: 'http.request',
            requestId: req.requestId,
             message: `${req.method} ${req.originalUrl} ${res.statusCode}`,  
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${Date.now() - start}ms`,
            userId: req.user?.id || null
        })
    })

    next();
}

module.exports = requestLogger;