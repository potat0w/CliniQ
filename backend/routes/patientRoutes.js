const express = require('express');
const router = express.Router();
const {
  registerPatient,
  loginPatient,
  getDoctors,
  getDoctorAvailability,
  bookAppointment,
  getAppointments,
  cancelAppointment,
  rescheduleAppointment
} = require('../controllers/patientController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.post('/register', registerPatient);
router.post('/login', loginPatient);

router.use(authenticateToken);
router.use(authorizeRole('patient'));

router.get('/doctors', getDoctors);
router.get('/doctors/:doctorId/availability', getDoctorAvailability);
router.post('/appointments', bookAppointment);
router.get('/appointments', getAppointments);
router.put('/appointments/:appointmentId/cancel', cancelAppointment);
router.put('/appointments/:appointmentId/reschedule', rescheduleAppointment);

module.exports = router;
