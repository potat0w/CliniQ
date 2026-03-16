const express = require('express');
const multer = require('multer');
const path = require('path');
const { transcribeAudio, getTranscriptionResult } = require('../controllers/transcriptionController');

const router = express.Router();

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `audio-${uniqueSuffix}${ext}`);
  }
});

// File filter to accept only audio files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'audio/mpeg',      // mp3
    'audio/wav',       // wav
    'audio/webm',      // webm
    'audio/ogg',       // ogg
    'audio/mp4',       // m4a
    'audio/x-m4a',     // m4a
    'audio/aac',       // aac
    'audio/flac',      // flac
    'audio/x-flac'     // flac
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'), false);
  }
};

// Initialize multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: fileFilter
});

/**
 * @route   POST /api/transcribe
 * @desc    Transcribe audio file using AssemblyAI
 * @access  Public (you can add auth middleware if needed)
 * @body    Audio file (multipart/form-data)
 */
router.post('/transcribe', upload.single('audio'), transcribeAudio);

/**
 * @route   GET /api/transcribe/:transcriptId
 * @desc    Get transcription result by ID
 * @access  Public (you can add auth middleware if needed)
 * @param   transcriptId - AssemblyAI transcript ID
 */
router.get('/transcribe/:transcriptId', getTranscriptionResult);

/**
 * @route   GET /api/transcribe
 * @desc    Health check for transcription service
 * @access  Public
 */
router.get('/transcribe', (req, res) => {
  res.json({
    success: true,
    message: 'Transcription service is running',
    supportedFormats: [
      'mp3', 'wav', 'webm', 'ogg', 'm4a', 'aac', 'flac'
    ],
    maxFileSize: '25MB'
  });
});

module.exports = router;
