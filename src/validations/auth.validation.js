const joi = require('joi');


const registerSchema = joi.object({
    name:joi.string().max(30).required(),
    email:joi.string().email().required(),
    password: joi.string().required()
})


const verifyEmail = joi.object({
    id:joi.string().required(),
    otp:joi.string().required(),
    
})


const resendVerifyEmailOTP = joi.object({
    purpose:joi.string().required(),
    email:joi.string().required(),
    
})


module.exports ={
    registerSchema,
    verifyEmail,
    resendVerifyEmailOTP
}