const router = require('express').Router();
const { authGuard } = require('../middleware/auth.middleware');
const controller = require('../controllers/patient.controller');

router.post(
    '/profile',
    authGuard('PATIENT'),
    controller.createPatientProfile
);

router.get(
    '/me',
    authGuard('PATIENT'),
    controller.getMyProfile
);

module.exports = router;
