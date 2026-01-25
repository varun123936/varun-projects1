const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');

function authGuard(requiredRole) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // 1️⃣ Token presence check
    if (!authHeader) {
      return res.sendStatus(401);
    }

    const token = authHeader.split(' ')[1];
    req.token = token; // ✅ Needed for logout

    try {
      // 2️⃣ Check blacklist (logout support)
      const isBlacklisted = await userService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return res.status(401).send('Token expired. Please login again');
      }

      // 3️⃣ Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4️⃣ Role check (same as before)
      if (requiredRole && decoded.role !== requiredRole) {
        return res.sendStatus(403);
      }

      req.user = decoded;
      next();

    } catch (err) {
      return res.sendStatus(401);
    }
  };
}

module.exports = { authGuard };
