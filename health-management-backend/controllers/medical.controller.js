const medicalService = require('../services/medical.service');
const doctorService = require('../services/doctor.service');
const appointmentService = require('../services/appointment.service');
const patientService = require('../services/patient.service');
const auditService = require('../services/audit.service');

/**
 * Doctor creates medical record + prescriptions
 */
async function addMedicalRecord(req, res) {
  try {
    // 1️⃣ Logged-in doctor
    const doctor = await doctorService.getDoctorByUserId(req.user.userId);
    console.log("Varun ",doctor)
    if (!doctor) {
      return res.status(403).json({ message: 'Doctor not authorized' });
    }
    
    const { appointmentId, diagnosis, notes, prescriptions } = req.body;

    // 2️⃣ Validate appointment belongs to this doctor
    const appointment = await appointmentService.getAppointmentForDoctor(
      appointmentId,
      doctor.DOCTOR_ID
    );

    if (!appointment) {
      return res.status(403).json({ message: 'Unauthorized appointment access' });
    }

    if (appointment.STATUS !== 'BOOKED') {
      return res.status(400).json({ message: 'Medical record already exists' });
    }

    // 3️⃣ Create medical record
    const recordId = await medicalService.createMedicalRecord({
      appointmentId,
      doctorId: doctor.DOCTOR_ID,
      patientId: appointment.PATIENT_ID,
      diagnosis,
      notes
    });

    // 4️⃣ Add prescriptions (optional)
    if (Array.isArray(prescriptions)) {
      for (const med of prescriptions) {
        await medicalService.addPrescription({
          recordId,
          doctorId: doctor.DOCTOR_ID,
          medicine: med.medicine,
          dosage: med.dosage,
          duration: med.duration,
          instructions: med.instructions
        });
      }
    }

    // 5️⃣ Mark appointment completed
    await appointmentService.completeAppointment(appointmentId);

      await auditService.logMedicalAudit({
          recordId,
          action: 'CREATE',
          actionBy: req.user.userId,
          role: 'DOCTOR'
      });

    res.status(201).json({
      message: 'Medical record and prescriptions saved successfully'
    });
  } catch (err) {
    console.error('Add medical record error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Patient views own medical history
 */
async function getMyMedicalHistory(req, res) {
  try {
    const patient = await patientService.getPatientByUserId(req.user.userId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const history = await medicalService.getPatientHistory(patient.PATIENT_ID);

    res.json(history);
  } catch (err) {
    console.error('Fetch medical history error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  addMedicalRecord,
  getMyMedicalHistory
};
