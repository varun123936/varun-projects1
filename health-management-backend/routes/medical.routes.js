const router = require('express').Router();
const { authGuard } = require('../middleware/auth.middleware');
const controller = require('../controllers/medical.controller');

// Doctor adds medical record & prescriptions
router.post(
  '/',
  authGuard('DOCTOR'),
  controller.addMedicalRecord
);

// Patient views own medical history
router.get(
  '/history',
  authGuard('PATIENT'),
  controller.getMyMedicalHistory
);

module.exports = router;
