const express = require("express");
const helemt = require('helmet');
const morgan = require('morgan');
const cors = require('cors')
require('dotenv').config();
const app = express();


app.use(helemt());
app.use(morgan("dev"));


app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true
    })
);


app.use(express.json());


app.use(express.urlencoded({ extended: true }))










module.exports = app;
