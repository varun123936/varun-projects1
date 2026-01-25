const oracledb = require('oracledb');

async function createDoctor(doctor) {
  let conn;
  try {
    conn = await oracledb.getConnection();

    await conn.execute(
      `INSERT INTO DOCTORS
       (USER_ID, NAME, SPECIALIZATION, EXPERIENCE, AVAILABLE_FROM, AVAILABLE_TO)
       VALUES (:userId, :name, :specialization, :experience, :availableFrom, :availableTo)`,
      doctor,
      { autoCommit: true }
    );
  } catch (err) {
    console.error('Error creating doctor:', err);
    throw err; // rethrow so controller can handle it
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

async function getDoctorByUserId(userId) {
  let conn;
  try {
    conn = await oracledb.getConnection();

    const result = await conn.execute(
      `SELECT * FROM DOCTORS WHERE USER_ID = :userId`,
      { userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows[0];
  } catch (err) {
    console.error('Error fetching doctor by userId:', err);
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

async function getAllDoctors() {
  let conn;
  try {
    conn = await oracledb.getConnection();

    const result = await conn.execute(
      `SELECT DOCTOR_ID, NAME, SPECIALIZATION, EXPERIENCE
       FROM DOCTORS`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } catch (err) {
    console.error('Error fetching doctors:', err);
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

module.exports = {
  createDoctor,
  getDoctorByUserId,
  getAllDoctors
};
