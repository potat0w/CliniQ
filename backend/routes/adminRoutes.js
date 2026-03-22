const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  loginAdmin,
  registerAdmin,
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAllPatients,
  getPatient,
  updatePatient,
  deletePatient,
  getAllChambers,
  createChamber,
  updateChamber,
  deleteChamber,
  getAllAppointments,
  getDashboardStats,
  importDoctorsFromCSV,
  getDoctorsFromCSV
} = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/login', loginAdmin);
router.post('/register', registerAdmin);

router.use(authenticateToken);
router.use(authorizeRole('admin'));

router.get('/dashboard/stats', getDashboardStats);

router.get('/doctors', getAllDoctors);
router.get('/doctors/csv', getDoctorsFromCSV);
router.post('/doctors', createDoctor);
router.put('/doctors/:doctorId', updateDoctor);
router.delete('/doctors/:doctorId', deleteDoctor);
router.post('/doctors/import', upload.single('csvFile'), importDoctorsFromCSV);

router.get('/patients', getAllPatients);
router.get('/patients/:patientId', getPatient);
router.put('/patients/:patientId', updatePatient);
router.delete('/patients/:patientId', deletePatient);

router.get('/chambers', getAllChambers);
router.post('/chambers', createChamber);
router.put('/chambers/:chamberId', updateChamber);
router.delete('/chambers/:chamberId', deleteChamber);

router.get('/appointments', getAllAppointments);

module.exports = router;
