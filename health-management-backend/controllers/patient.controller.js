const patientService = require('../services/patient.service');

async function createPatientProfile(req, res) {
  const userId = req.user.userId;

  await patientService.createPatient({
    userId,
    ...req.body
  });

  res.status(201).send('Patient profile created');
}

async function getMyProfile(req, res) {
  const userId = req.user.userId;
  const patient = await patientService.getPatientByUserId(userId);

  res.json(patient);
}

module.exports = { createPatientProfile, getMyProfile };
