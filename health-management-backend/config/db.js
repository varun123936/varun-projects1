const oracledb = require('oracledb');

async function initDB() {
  await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT
  });
}

module.exports = { initDB };
