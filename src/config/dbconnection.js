const {Pool} = require('pg');
const logger = require('./logger');



const pool = new Pool({
    user:process.env.DBUSERNAME,
    password:process.env.DBPASSWORD,
    database:process.env.DBDATABASE,
    host : process.env.DBHOST,
    port :process.env.DBPORT,
   
});

pool.on('connect', () => {
    // console.log('Connected to the database');
    logger.debug({
        event:'db.pool.connect',
        message:'New pool connection opened'
    })
})

pool.on('error', (err) => {
        logger.error({ 
        event: 'db.pool.error', 
        message: err.message, 
        stack: err.stack 
    });

})

const db = (text,params) =>  pool.query(text,params);


module.exports = {db, pool};