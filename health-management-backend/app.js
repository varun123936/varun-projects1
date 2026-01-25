require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/db');
const redisClient = require('./redisClient');

const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const medicalRoutes = require('./routes/medical.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical', medicalRoutes);

initDB()
  .then(() => console.log('Oracle DB Connected'))
  .catch(err => console.error(err));

  (async () => {
  try {
    await redisClient.set('testKey', 'Hello Redis');
    const value = await redisClient.get('testKey');
    console.log('Redis test value:', value);
  } catch (err) {
    console.error('Redis test failed:', err);
  }
})();


app.listen(3000, () => {
  console.log('Server running on port 3000');
});
