const express = require('express');
const validationMiddleware = require('../middlewares/validation.middleware');
const {registerSchema} = require('../validations/auth.validation')
const {registerController} = require('../controllers/auth.controllers')
const { route } = require('..');

const routes = express.Router();


route.post("register",validationMiddleware(registerSchema),registerController)



module.exports = {routes}