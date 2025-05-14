const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // Required for Azure
    trustServerCertificate: false
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✔ Connected to Azure SQL');
    return pool;
  })
  .catch(err => {
    console.error('❌ Database connection failed: ', err.message);
  });

module.exports = {
  sql, poolPromise
};
