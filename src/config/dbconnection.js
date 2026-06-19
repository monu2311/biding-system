const {Pool} = require('pg');

const pool = new Pool({
    user:process.env.DBUSERNAME,
    password:process.env.DBPASSWORD,
    database:process.env.DBDATABASE,
    host : process.env.DBHOST,
    port :process.env.DBPORT,
    onConnect: ()=>{
        console.log("Connected to postgress SQl")
    }
});

pool.on('connect', () => {
    console.log('Connected to the database');
})

pool.on('error', (err) => {
    console.error('Database connection error:', err);
})

const db = (text,params) =>  pool.query(text,params);


module.exports = db;