const { level } = require("winston");
const logger = require("../config/logger");
const { v4: uuid } = require('uuid');
const { date } = require("joi");



const requestLogger = (req, res, next) => {

    req.requestId = uuidv4();

    const start = Date.now();


    res.on('finish', () => {

        logger.info({
            event: 'http.request',
            requestId: req.requestId,
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