const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER, // Just the username: zainaazhansa
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER, // Fully qualified: e.g. microservice-server.database.windows.net
  database: process.env.DB_NAME,
  port: 1433, // Explicit Azure SQL port
  options: {
    encrypt: true, // Required for Azure
    trustServerCertificate: false, // Must be false for production (and Azure enforces cert checks)
  },
  authentication: {
    type: 'default' // Use SQL Login (NOT Azure AD or Windows Auth)
  }
};

let poolPromise;

try {
  poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
      console.log('✔ Connected to Azure SQL \n  http://localhost:5000/api/auth/google');
      return pool;
    })
    .catch(err => {
      console.error('❌ Database connection failed:', err.message);
    });
} catch (e) {
  console.error('❌ Fatal DB Config Error:', e.message);
}

module.exports = {
  sql,
  poolPromise
};
