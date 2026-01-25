const oracledb = require('oracledb');

async function createPatient(patient) {
  let conn;

  try {
    conn = await oracledb.getConnection();

    await conn.execute(
      `INSERT INTO PATIENTS 
       (USER_ID, NAME, AGE, GENDER, PHONE, ADDRESS)
       VALUES (:userId, :name, :age, :gender, :phone, :address)`,
      patient,
      { autoCommit: true }
    );

  } catch (err) {
    console.error('Error creating patient:', err);
    throw err; // propagate error to controller

  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error('Error closing DB connection:', closeErr);
      }
    }
  }
}

async function getPatientByUserId(userId) {
  let conn;

  try {
    conn = await oracledb.getConnection();

    const result = await conn.execute(
      `SELECT * FROM PATIENTS WHERE USER_ID = :userId`,
      { userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows[0] || null;

  } catch (err) {
    console.error('Error fetching patient:', err);
    throw err;

  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error('Error closing DB connection:', closeErr);
      }
    }
  }
}

module.exports = { createPatient, getPatientByUserId };
