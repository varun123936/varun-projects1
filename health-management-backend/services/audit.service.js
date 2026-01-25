const oracledb = require('oracledb');

/**
 * Generic audit logger for medical records
 */
async function logMedicalAudit({ recordId, action, actionBy, role }) {
  const conn = await oracledb.getConnection();

  await conn.execute(
    `INSERT INTO MEDICAL_AUDIT_LOG
     (AUDIT_ID, RECORD_ID, ACTION, ACTION_BY, ACTION_ROLE)
     VALUES
     (MEDICAL_AUDIT_SEQ.NEXTVAL, :recordId, :action, :actionBy, :role)`,
    { recordId, action, actionBy, role },
    { autoCommit: true }
  );

  await conn.close();
}

module.exports = {
  logMedicalAudit
};
