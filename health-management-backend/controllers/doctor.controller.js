const doctorService = require('../services/doctor.service');

async function createDoctorProfile(req, res) {
  const userId = req.user.userId;

  await doctorService.createDoctor({
    userId,
    ...req.body
  });

  res.status(201).send('Doctor profile created');
}

async function getMyProfile(req, res) {
  const userId = req.user.userId;
  const doctor = await doctorService.getDoctorByUserId(userId);
  res.json(doctor);
}

async function listDoctors(req, res) {
  const doctors = await doctorService.getAllDoctors();
  res.json(doctors);
}

module.exports = {
  createDoctorProfile,
  getMyProfile,
  listDoctors
};
