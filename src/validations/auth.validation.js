const joi = require('joi');


const registerSchema = joi.object({
    email:joi.string().email().required(),
    password: joi.string().required()
})


module.exports ={
    registerSchema
}