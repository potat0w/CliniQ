const express = require('express');
const router = express.Router();
const {
  signupDoctor,
  loginDoctor,
  getUpcomingAppointments,
  getAppointmentHistory,
  getPatientHistory,
  addAvailability,
  getAvailability,
  updateAvailability,
  deleteAvailability,
  completeAppointment,
  getDashboardStats
} = require('../controllers/doctorController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.post('/signup', signupDoctor);
router.post('/login', loginDoctor);

router.use(authenticateToken);
router.use(authorizeRole('doctor'));

router.get('/appointments/upcoming', getUpcomingAppointments);
router.get('/appointments/history', getAppointmentHistory);
router.get('/patients/:patientId/history', getPatientHistory);
router.get('/dashboard/stats', getDashboardStats);
router.post('/availability', addAvailability);
router.get('/availability', getAvailability);
router.put('/availability/:availabilityId', updateAvailability);
router.delete('/availability/:availabilityId', deleteAvailability);
router.put('/appointments/:appointmentId/complete', completeAppointment);

module.exports = router;
