const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');

async function register(req, res) {
  const { username, password, role } = req.body;

  const hashedPwd = await bcrypt.hash(password, 10);

  await userService.createUser({
    username,
    password: hashedPwd,
    role
  });

  res.status(201).send('User registered successfully');
}

async function login(req, res) {
  const { username, password } = req.body;

  const user = await userService.findUserByUsername(username);
  if (!user) return res.status(401).send('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.PASSWORD);
  if (!isMatch) return res.status(401).send('Invalid credentials');

  const token = jwt.sign(
    { userId: user.USER_ID, role: user.ROLE },
    process.env.JWT_SECRET,
    { expiresIn: '20m' }
  );

  res.json({ token });
}

async function logout(req, res) {
  try {
    const token = req.token; // coming from middleware
    await userService.blacklistToken(token);

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
}


async function getAllUser(req, res) {
  try {
    // 1. Call service layer to fetch all users
    const users = await userService.getAllUsers();

    // 2. If no users found, return 404
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    // 3. Return users as JSON
    res.json(users);

  } catch (err) {
    // 4. Handle errors gracefully
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}


module.exports = { register, login, logout, getAllUser };
