const express = require('express');
const router = express.Router();
const { processMedicalSymptoms } = require('../controllers/medicalAssistantController');

/**
 * @route   POST /api/medical/analyze
 * @desc    Process medical symptoms and provide structured guidance
 * @access  Public
 */
router.post('/analyze', processMedicalSymptoms);

module.exports = router;
