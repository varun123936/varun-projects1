const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authGuard } = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authGuard(), authController.logout);
router.get('/users', authController.getAllUser);

module.exports = router;
