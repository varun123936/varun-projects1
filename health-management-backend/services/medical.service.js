const oracledb = require('oracledb');

/**
 * Create medical record (one per appointment)
 */
async function createMedicalRecord(data) {
  let conn;

  try {
    conn = await oracledb.getConnection();

    const result = await conn.execute(
      `INSERT INTO MEDICAL_RECORDS
       (RECORD_ID, APPOINTMENT_ID, DOCTOR_ID, PATIENT_ID, DIAGNOSIS, NOTES)
       VALUES
       (MEDICAL_REC_SEQ.NEXTVAL, :appointmentId, :doctorId, :patientId, :diagnosis, :notes)
       RETURNING RECORD_ID INTO :recordId`,
      {
        ...data,
        recordId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    return result.outBinds.recordId[0];

  } catch (err) {
    throw err;

  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Add prescription to medical record
 */
async function addPrescription(data) {
  let conn;

  try {
    conn = await oracledb.getConnection();

    await conn.execute(
      `INSERT INTO PRESCRIPTIONS
       (PRESCRIPTION_ID, RECORD_ID, DOCTOR_ID, MEDICINE_NAME, DOSAGE, DURATION, INSTRUCTIONS)
       VALUES
       (PRESCRIPTION_SEQ.NEXTVAL, :recordId, :doctorId, :medicine, :dosage, :duration, :instructions)`,
      data,
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

/**
 * Fetch patient medical history
 */
async function getPatientHistory(patientId) {
  let conn;

  try {
    conn = await oracledb.getConnection();

    const result = await conn.execute(
      `SELECT
          mr.RECORD_ID,
          mr.DIAGNOSIS,
          mr.NOTES,
          mr.CREATED_AT,
          p.MEDICINE_NAME,
          p.DOSAGE,
          p.DURATION,
          p.INSTRUCTIONS
       FROM MEDICAL_RECORDS mr
       LEFT JOIN PRESCRIPTIONS p
         ON mr.RECORD_ID = p.RECORD_ID
       WHERE mr.PATIENT_ID = :patientId
       ORDER BY mr.CREATED_AT DESC`,
      { patientId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT,
fetchInfo: { "NOTES": { type: oracledb.STRING } // convert CLOB to string 
}
       }
    );

    return result.rows; //returns plain data (strings, numbers, arrays, objects)

  } catch (err) {
    throw err;

  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

module.exports = {
  createMedicalRecord,
  addPrescription,
  getPatientHistory
};
