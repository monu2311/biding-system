const express = require("express");
const helemt = require('helmet');
const cors = require('cors')
const {routes} = require("./routes/auth.routes");
const errorMiddleware = require("./middlewares/error.middleware");
const cookieParser = require('cookie-parser');
const logger = require('./config/logger');
const requestLogger = require('./middlewares/requestLogger.middleware');

require('dotenv').config();
const app = express();


app.use(helemt())
app.use(requestLogger);
app.use(cookieParser()); 

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true
    })
);


app.use(express.json());


app.use(express.urlencoded({ extended: true }))



app.use('/api/v1/user',routes)


app.use(errorMiddleware)








module.exports = app;
