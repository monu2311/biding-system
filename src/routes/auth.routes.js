const express = require('express');
const validationMiddleware = require('../middlewares/validation.middleware');
const {registerSchema,verifyEmail,resendVerifyEmailOTP,loginSchema} = require('../validations/auth.validation')
const {registerController,verifyEmailController,resendVerifyEmailController, loginController, logoutController, refreshController} = require('../controllers/auth.controllers');
const { otpLimiter,authLimiter } = require('../config/limiters');
const {authenticate} = require('../middlewares/auth.middleware')


const routes = express.Router();


routes.post("/register", authLimiter,validationMiddleware(registerSchema),registerController)
routes.post("/login",authLimiter,validationMiddleware(loginSchema),loginController)
routes.post("/verify-email", otpLimiter,validationMiddleware(verifyEmail),verifyEmailController)
routes.post("/resend-verify-email-otp",otpLimiter,validationMiddleware(resendVerifyEmailOTP),resendVerifyEmailController)
routes.post("/logout", authLimiter,  authenticate   , logoutController)
routes.post("/refresh-token",authLimiter ,authenticate, refreshController)


module.exports = {routes}