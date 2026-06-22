const express = require("express");
const helemt = require('helmet');
const morgan = require('morgan');
const cors = require('cors')
const {routes} = require("./routes/auth.routes")
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



app.use('/api/v1/user',routes)








module.exports = app;
