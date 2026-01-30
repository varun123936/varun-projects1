const bcrypt = require('bcrypt');
const { executeQuery, executeTransaction } = require('../db/connection');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @returns {object} Created user (without password)
 */
async function registerUser(userData) {
  const { username, email, password } = userData;

  // Check if user already exists
  const checkUserSql = `
    SELECT ID, USERNAME, EMAIL 
    FROM HMS_USERS 
    WHERE USERNAME = :username OR EMAIL = :email
  `;
  
  const existingUser = await executeQuery(checkUserSql, { username, email });
  
  if (existingUser.rows.length > 0) {
    const existing = existingUser.rows[0];
    if (existing.USERNAME === username) {
      throw new Error('Username already exists');
    }
    if (existing.EMAIL === email) {
      throw new Error('Email already exists');
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Insert user and get the generated ID
  const insertUserSql = `
    INSERT INTO HMS_USERS (USERNAME, EMAIL, PASSWORD_HASH, CREATED_AT, UPDATED_AT)
    VALUES (:username, :email, :passwordHash, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  await executeQuery(
    insertUserSql,
    { username, email, passwordHash },
    { autoCommit: true }
  );

  // Get the inserted user (using username/email since ID is auto-generated)
  const getUserSql = `
    SELECT ID, USERNAME, EMAIL, CREATED_AT, UPDATED_AT
    FROM HMS_USERS
    WHERE USERNAME = :username
  `;

  const userResult = await executeQuery(getUserSql, { username });
  
  if (userResult.rows.length === 0) {
    throw new Error('Failed to create user');
  }

  return {
    id: userResult.rows[0].ID,
    username: userResult.rows[0].USERNAME,
    email: userResult.rows[0].EMAIL,
    createdAt: userResult.rows[0].CREATED_AT
  };
}

/**
 * Login user
 * @param {object} credentials - Login credentials
 * @returns {object} User data and tokens
 */
async function loginUser(credentials) {
  const { username, password } = credentials;

  // Find user by username or email
  const getUserSql = `
    SELECT ID, USERNAME, EMAIL, PASSWORD_HASH
    FROM HMS_USERS
    WHERE USERNAME = :username OR EMAIL = :username
  `;

  const userResult = await executeQuery(getUserSql, { username });
  
  if (userResult.rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = userResult.rows[0];

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.PASSWORD_HASH);
  
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.ID,
    username: user.USERNAME,
    email: user.EMAIL
  });

  const refreshToken = generateRefreshToken({
    userId: user.ID
  });

  // Calculate expiry date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Store refresh token in database
  const insertTokenSql = `
    INSERT INTO HMS_REFRESH_TOKENS (USER_ID, TOKEN, EXPIRES_AT, CREATED_AT, IS_REVOKED)
    VALUES (:userId, :token, :expiresAt, CURRENT_TIMESTAMP, 0)
  `;

  await executeQuery(
    insertTokenSql,
    {
      userId: user.ID,
      token: refreshToken,
      expiresAt: expiresAt
    },
    { autoCommit: true }
  );

  return {
    user: {
      id: user.ID,
      username: user.USERNAME,
      email: user.EMAIL
    },
    accessToken,
    refreshToken
  };
}

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token from cookie
 * @returns {object} New access token
 */
async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }

  // Check if token exists in database and is valid
  const checkTokenSql = `
    SELECT RT.ID, RT.USER_ID, RT.EXPIRES_AT, RT.IS_REVOKED,
           U.ID AS USER_ID, U.USERNAME, U.EMAIL
    FROM HMS_REFRESH_TOKENS RT
    INNER JOIN HMS_USERS U ON RT.USER_ID = U.ID
    WHERE RT.TOKEN = :token
      AND RT.IS_REVOKED = 0
      AND RT.EXPIRES_AT > CURRENT_TIMESTAMP
  `;

  const tokenResult = await executeQuery(checkTokenSql, { token: refreshToken });
  
  if (tokenResult.rows.length === 0) {
    throw new Error('Invalid or expired refresh token');
  }

  const tokenData = tokenResult.rows[0];

  // Generate new access token
  const accessToken = generateAccessToken({
    userId: tokenData.USER_ID,
    username: tokenData.USERNAME,
    email: tokenData.EMAIL
  });

  return {
    accessToken,
    user: {
      id: tokenData.USER_ID,
      username: tokenData.USERNAME,
      email: tokenData.EMAIL
    }
  };
}

/**
 * Logout user (revoke refresh token)
 * @param {string} refreshToken - Refresh token to revoke
 */
async function logoutUser(refreshToken) {
  if (!refreshToken) {
    return;
  }

  // Revoke refresh token
  const revokeTokenSql = `
    UPDATE HMS_REFRESH_TOKENS
    SET IS_REVOKED = 1
    WHERE TOKEN = :token
      AND IS_REVOKED = 0
  `;

  await executeQuery(revokeTokenSql, { token: refreshToken }, { autoCommit: true });
}

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {object} User data
 */
async function getUserById(userId) {
  const getUserSql = `
    SELECT ID, USERNAME, EMAIL, CREATED_AT, UPDATED_AT
    FROM HMS_USERS
    WHERE ID = :userId
  `;

  const result = await executeQuery(getUserSql, { userId });
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = result.rows[0];
  return {
    id: user.ID,
    username: user.USERNAME,
    email: user.EMAIL,
    createdAt: user.CREATED_AT,
    updatedAt: user.UPDATED_AT
  };
}

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserById
};
