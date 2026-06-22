const express = require('express');
const validationMiddleware = require('../middlewares/validation.middleware');
const {registerSchema,verifyEmail,resendVerifyEmailOTP} = require('../validations/auth.validation')
const {registerController,verifyEmailController,resendVerifyEmailController} = require('../controllers/auth.controllers')


const routes = express.Router();


routes.post("/register",validationMiddleware(registerSchema),registerController)
routes.post("/verify-email",validationMiddleware(verifyEmail),verifyEmailController)
routes.post("/resend-verify-email-otp",validationMiddleware(resendVerifyEmailOTP),resendVerifyEmailController)



module.exports = {routes}