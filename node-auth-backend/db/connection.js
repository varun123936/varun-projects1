const oracledb = require('oracledb');
require('dotenv').config();

// Disable auto-commit for better transaction control
oracledb.autoCommit = false;

// Connection pool configuration
const poolConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`,
  poolMin: parseInt(process.env.DB_POOL_MIN) || 2,
  poolMax: parseInt(process.env.DB_POOL_MAX) || 10,
  poolIncrement: parseInt(process.env.DB_POOL_INCREMENT) || 1,
  poolTimeout: 60,
  queueTimeout: 60000,
  stmtCacheSize: 30
};

let pool = null;

/**
 * Initialize Oracle connection pool
 */
async function initializePool() {
  try {
    pool = await oracledb.createPool(poolConfig);
    console.log('✅ Oracle connection pool created successfully');
    return pool;
  } catch (error) {
    console.error('❌ Error creating Oracle connection pool:', error);
    throw error;
  }
}

/**
 * Get connection from pool
 */
async function getConnection() {
  try {
    if (!pool) {
      await initializePool();
    }
    return await pool.getConnection();
  } catch (error) {
    console.error('❌ Error getting connection from pool:', error);
    throw error;
  }
}

/**
 * Close connection pool
 */
async function closePool() {
  try {
    if (pool) {
      await pool.close(10);
      console.log('✅ Oracle connection pool closed');
      pool = null;
    }
  } catch (error) {
    console.error('❌ Error closing connection pool:', error);
    throw error;
  }
}

/**
 * Execute a query with bind variables
 * @param {string} sql - SQL query with bind variables
 * @param {object|array} binds - Bind variables object or array
 * @param {object} options - Query options (autoCommit, outFormat, etc.)
 */
async function executeQuery(sql, binds = {}, options = {}) {
  let connection;
  try {
    connection = await getConnection();
    
    const defaultOptions = {
      autoCommit: options.autoCommit !== undefined ? options.autoCommit : true,
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      ...options
    };

    const result = await connection.execute(sql, binds, defaultOptions);
    return result;
  } catch (error) {
    console.error('❌ Query execution error:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('❌ Error closing connection:', error);
      }
    }
  }
}

/**
 * Execute a transaction (multiple queries)
 * @param {Function} callback - Function that receives connection and executes queries
 */
async function executeTransaction(callback) {
  let connection;
  try {
    connection = await getConnection();
    
    await callback(connection);
    
    await connection.commit();
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('❌ Error during rollback:', rollbackError);
      }
    }
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('❌ Error closing connection:', error);
      }
    }
  }
}

module.exports = {
  initializePool,
  getConnection,
  closePool,
  executeQuery,
  executeTransaction,
  oracledb
};
