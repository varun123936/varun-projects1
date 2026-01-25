const router = require('express').Router();
const { authGuard } = require('../middleware/auth.middleware');
const controller = require('../controllers/appointment.controller');

// Patient books appointment
router.post(
  '/',
  authGuard('PATIENT'),
  controller.book
);

// Doctor views appointments
router.get(
  '/doctor',
  authGuard('DOCTOR'),
  controller.doctorAppointments
);

// Patient views own appointments
router.get(
  '/patient',
  authGuard('PATIENT'),
  controller.patientAppointments
);

module.exports = router;
