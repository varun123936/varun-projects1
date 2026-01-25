const oracledb = require('oracledb');

/**
 * Book an appointment
 */
async function bookAppointment(data) {
  let conn;

  try {
    conn = await oracledb.getConnection();

    await conn.execute(
      `INSERT INTO APPOINTMENTS
       (PATIENT_ID, DOCTOR_ID, APPOINTMENT_DATE)
       VALUES (:patientId, :doctorId, :appointmentDate)`,
      {
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentDate: new Date(data.appointmentDate)
      },
      { autoCommit: true }
    );

  } catch (err) {
    if (err.errorNum === 1) {
      throw new Error('Doctor already booked for this time');
    }
    throw err;

  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Get appointments for a doctor
 */
async function getAppointmentsByDoctor(doctorId) {
  let conn;

  try {
    conn = await oracledb.getConnection();

    const result = await conn.execute(
      `SELECT A.APPOINTMENT_ID,
              A.APPOINTMENT_DATE,
              A.STATUS,
              P.NAME AS PATIENT_NAME
       FROM APPOINTMENTS A
       JOIN PATIENTS P ON A.PATIENT_ID = P.PATIENT_ID
       WHERE A.DOCTOR_ID = :doctorId
       ORDER BY A.APPOINTMENT_DATE`,
      { doctorId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;

  } catch (err) {
    throw err;

  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Get appointments for a patient
 */
async function getAppointmentsByPatient(patientId) {
  let conn;

  try {
    conn = await oracledb.getConnection();

    const result = await conn.execute(
      `SELECT A.APPOINTMENT_ID,
              A.APPOINTMENT_DATE,
              A.STATUS,
              D.NAME AS DOCTOR_NAME,
              D.SPECIALIZATION
       FROM APPOINTMENTS A
       JOIN DOCTORS D ON A.DOCTOR_ID = D.DOCTOR_ID
       WHERE A.PATIENT_ID = :patientId
       ORDER BY A.APPOINTMENT_DATE`,
      { patientId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;

  } catch (err) {
    throw err;

  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Get appointment only if it belongs to the given doctor
 * Used while creating medical records
 */
async function getAppointmentForDoctor(appointmentId, doctorId) {
  let conn;

  try {
    conn = await oracledb.getConnection();

    const result = await conn.execute(
      `SELECT APPOINTMENT_ID,
              PATIENT_ID,
              STATUS
       FROM APPOINTMENTS
       WHERE APPOINTMENT_ID = :appointmentId
         AND DOCTOR_ID = :doctorId`,
      { appointmentId, doctorId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows[0];

  } catch (err) {
    throw err;

  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Mark appointment as COMPLETED
 */
async function completeAppointment(appointmentId) {
  let conn;

  try {
    conn = await oracledb.getConnection();

    await conn.execute(
      `UPDATE APPOINTMENTS
       SET STATUS = 'COMPLETED'
       WHERE APPOINTMENT_ID = :appointmentId`,
      { appointmentId },
      { autoCommit: true }
    );

  } catch (err) {
    throw err;

  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

module.exports = {
  bookAppointment,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
  getAppointmentForDoctor,
  completeAppointment
};
