const router = require('express').Router();
const { authGuard } = require('../middleware/auth.middleware');
const controller = require('../controllers/doctor.controller');

// Doctor creates own profile
router.post(
  '/profile',
  authGuard('DOCTOR'),
  controller.createDoctorProfile
);

// Doctor views own profile
router.get(
  '/me',
  authGuard('DOCTOR'),
  controller.getMyProfile
);

// Public / Patient can view doctor list who have logedin
router.get(
  '/',
  authGuard(),
  controller.listDoctors
);

module.exports = router;
