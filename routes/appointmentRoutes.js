const express = require('express');
const router = express.Router();
const {
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getAppointmentsByDateRange,
  getTodayAppointments,
  getAppointmentStatistics,
  deleteAppointment
} = require('../controllers/appointmentController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', getAllAppointments);
router.get('/today', getTodayAppointments);
router.get('/statistics', getAppointmentStatistics);
router.get('/range', getAppointmentsByDateRange);
router.get('/:appointmentId', getAppointmentById);

router.use(authorizeRole('admin', 'doctor'));

router.put('/:appointmentId/status', updateAppointmentStatus);
router.delete('/:appointmentId', deleteAppointment);

module.exports = router;
