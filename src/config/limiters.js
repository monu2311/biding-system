const { rateLimit } = require('express-rate-limit');
const rateLimitHandler = require('../middlewares/rateLimiter.middleware');


const basicConfig ={
    standardHeaders:true,
    legacyHeaders:false,
    message:"Too many request",
    handler: rateLimitHandler
}

const globalLimiter = rateLimit({
    windowMs: 15*60*1000,
    max:100,
    ...basicConfig
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:5,
    ...basicConfig
})

const otpLimiter = rateLimit({
    windowMs: 3 * 60 * 1000,
    max:5,
    ...basicConfig
})

module.exports ={
    globalLimiter,
    authLimiter,
    otpLimiter
}