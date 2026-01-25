const appointmentService = require('../services/appointment.service');
const patientService = require('../services/patient.service');
const doctorService = require('../services/doctor.service');

async function book(req, res) {
  const userId = req.user.userId;

  const patient = await patientService.getPatientByUserId(userId);
  if (!patient) return res.status(400).send('Patient profile missing');

  await appointmentService.bookAppointment({
    patientId: patient.PATIENT_ID,
    doctorId: req.body.doctorId,
    appointmentDate: req.body.appointmentDate
  });

  res.status(201).send('Appointment booked');
}

async function doctorAppointments(req, res) {
  const doctor = await doctorService.getDoctorByUserId(req.user.userId);
  const appointments = await appointmentService.getAppointmentsByDoctor(
    doctor.DOCTOR_ID
  );
  res.json(appointments);
}

async function patientAppointments(req, res) {
  const patient = await patientService.getPatientByUserId(req.user.userId);
  const appointments = await appointmentService.getAppointmentsByPatient(
    patient.PATIENT_ID
  );
  res.json(appointments);
}

module.exports = {
  book,
  doctorAppointments,
  patientAppointments
};
