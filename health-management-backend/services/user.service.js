const oracledb = require('oracledb');

async function findUserByUsername(username) {
  let conn;

  try {
    // 1. Get connection from pool
    conn = await oracledb.getConnection();

    // 2. Execute SELECT query
    const result = await conn.execute(
      `SELECT * FROM AUTH_USERS WHERE USERNAME = :username`,
      { username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // 3. Return first row (username is unique)
    return result.rows[0];

  } catch (err) {
    // 4. Handle DB or query errors
    console.error('Error finding user by username:', err);
    throw err;

  } finally {
    // 5. Always close connection
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error('Error closing DB connection:', closeErr);
      }
    }
  }
}

async function createUser(user) {
  let conn;

  try {
    // 1. Get DB connection from pool
    conn = await oracledb.getConnection();

    // 2. Execute INSERT query
    await conn.execute(
      `INSERT INTO AUTH_USERS (USERNAME, PASSWORD, ROLE)
       VALUES (:username, :password, :role)`,
      user,
      { autoCommit: true }
    );

  } catch (err) {
    // 3. Handle error
    console.error('Error creating user:', err);
    throw err; // rethrow so controller can handle response

  } finally {
    // 4. Always close connection
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
}

async function blacklistToken(token) {
  let conn;

  try {
    // 1. Get DB connection
    conn = await oracledb.getConnection();

    // 2. Insert token into blacklist table
    await conn.execute(
      `INSERT INTO TOKEN_BLACKLIST (TOKEN) VALUES (:token)`,
      { token },
      { autoCommit: true }
    );

  } catch (err) {
    console.error('Error blacklisting token:', err);
    throw err;

  } finally {
    // 3. Always close connection
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error('Error closing DB connection:', closeErr);
      }
    }
  }
}

async function isTokenBlacklisted(token) {
  let conn;

  try {
    // 1. Get DB connection
    conn = await oracledb.getConnection();

    // 2. Check if token exists
    const result = await conn.execute(
      `SELECT 1 FROM TOKEN_BLACKLIST WHERE TOKEN = :token`,
      { token }
    );

    return result.rows.length > 0;

  } catch (err) {
    console.error('Error checking blacklisted token:', err);
    throw err;

  } finally {
    // 3. Always close connection
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error('Error closing DB connection:', closeErr);
      }
    }
  }
}

async function getAllUsers() {
  let conn;

  try {
    // 1. Get connection from pool
    conn = await oracledb.getConnection();

    // 2. Execute SELECT query to fetch all users
    const result = await conn.execute(
      `SELECT * FROM AUTH_USERS`,
      [], // no bind parameters
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // return rows as JS objects
    );

    // 3. Return all rows
    return result.rows;

  } catch (err) {
    // 4. Handle DB or query errors
    console.error('Error fetching all users:', err);
    throw err;

  } finally {
    // 5. Always close connection
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error('Error closing DB connection:', closeErr);
      }
    }
  }
}



module.exports = { findUserByUsername, createUser, blacklistToken,
  isTokenBlacklisted, getAllUsers };
