const mysql = require('mysql2/promise');
require('dotenv').config(); // libreria para leer las variables de entorno del .env

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

module.exports = pool;