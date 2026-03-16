const { AssemblyAI } = require('assemblyai');
const path = require('path');
const fs = require('fs');

// Initialize AssemblyAI client
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Transcribe audio file using AssemblyAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    // Check if AssemblyAI API key is configured
    if (!process.env.ASSEMBLYAI_API_KEY || process.env.ASSEMBLYAI_API_KEY === 'your_assemblyai_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'AssemblyAI API key not configured'
      });
    }

    const audioFilePath = req.file.path;
    
    console.log('Transcribing audio file:', audioFilePath);

    // Transcribe the audio file
    const transcript = await client.transcripts.transcribe({
      audio: audioFilePath,
      language_code: 'en', // You can make this dynamic based on user preference
      speech_models: ['universal-2'] // Required speech models parameter as array
    });

    if (transcript.status === 'error') {
      console.error('Transcription error:', transcript.error);
      return res.status(500).json({
        success: false,
        message: 'Transcription failed',
        error: transcript.error
      });
    }

    // Clean up the uploaded file after transcription
    fs.unlinkSync(audioFilePath);

    res.json({
      success: true,
      data: {
        text: transcript.text,
        confidence: transcript.confidence,
        words: transcript.words,
        audio_duration: transcript.audio_duration
      }
    });

  } catch (error) {
    console.error('Transcription controller error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during transcription',
      error: error.message
    });
  }
};

/**
 * Get transcription status and result
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTranscriptionResult = async (req, res) => {
  try {
    const { transcriptId } = req.params;

    if (!transcriptId) {
      return res.status(400).json({
        success: false,
        message: 'Transcript ID is required'
      });
    }

    const transcript = await client.transcripts.get(transcriptId);

    res.json({
      success: true,
      data: transcript
    });

  } catch (error) {
    console.error('Get transcription result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transcription result',
      error: error.message
    });
  }
};

module.exports = {
  transcribeAudio,
  getTranscriptionResult
};
