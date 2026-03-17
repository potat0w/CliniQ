const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Process medical symptoms and provide structured medical guidance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processMedicalSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms description is required'
      });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key not configured'
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a medical assistant AI.

The user will describe their symptoms in one sentence.

Your task is to:
1. Extract:
   - Main symptom
   - Duration
   - Severity (mild/moderate/severe if mentioned)

2. Based on the symptoms, suggest ONLY the most appropriate doctor specialty.

3. Keep the response VERY SHORT.

4. Do NOT ask follow-up questions.
5. Do NOT give long explanations.
6. Do NOT give diagnosis.

---

User input:
"${symptoms}"

---

Respond STRICTLY in this format:

Symptom: <one main symptom>
Duration: <duration or unknown>
Severity: <severity or unknown>
Doctor: <doctor specialty only>`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const medicalAnalysis = response.text();

    // Parse the structured response
    const parsedResponse = parseMedicalResponse(medicalAnalysis);

    // Get recommended doctors based on specialty
    const recommendedDoctors = await getRecommendedDoctors(parsedResponse.doctor);

    res.json({
      success: true,
      data: {
        analysis: parsedResponse,
        doctors: recommendedDoctors
      }
    });

  } catch (error) {
    console.error('Medical assistant controller error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error during medical analysis',
      error: error.message
    });
  }
};

/**
 * Parse the structured medical response into a JSON object
 * @param {string} response - The raw response from Gemini
 * @returns {Object} - Parsed response object
 */
const parseMedicalResponse = (response) => {
  const lines = response.split('\n').filter(line => line.trim());
  const parsed = {
    symptom: '',
    duration: '',
    severity: '',
    doctor: ''
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('Symptom:')) {
      parsed.symptom = trimmedLine.replace('Symptom:', '').trim();
    } else if (trimmedLine.startsWith('Duration:')) {
      parsed.duration = trimmedLine.replace('Duration:', '').trim();
    } else if (trimmedLine.startsWith('Severity:')) {
      parsed.severity = trimmedLine.replace('Severity:', '').trim();
    } else if (trimmedLine.startsWith('Doctor:')) {
      parsed.doctor = trimmedLine.replace('Doctor:', '').trim();
    }
  }

  return parsed;
};

/**
 * Get recommended doctors based on specialty
 * @param {string} specialty - Doctor specialty
 * @returns {Array} - Array of recommended doctors
 */
const getRecommendedDoctors = async (specialty) => {
  try {
    const csvPath = path.join(__dirname, '../doctors_processed_data.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    const doctors = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= headers.length) {
        const doctor = {};
        headers.forEach((header, index) => {
          doctor[header.trim()] = values[index] ? values[index].trim() : '';
        });
        
        // Match specialty (case-insensitive)
        if (doctor.Speciality && doctor.Speciality.toLowerCase() === specialty.toLowerCase()) {
          doctors.push({
            id: doctor['Doctor ID'],
            name: doctor['Doctor Name'],
            education: doctor.Education,
            specialty: doctor.Speciality,
            experience: doctor.Experience,
            chamber: doctor.Chamber,
            location: doctor.Location,
            concentration: doctor.Concentration
          });
        }
      }
    }
    
    // Sort by experience (descending)
    doctors.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
    
    // Return top 3 doctors
    return doctors.slice(0, 3);
    
  } catch (error) {
    console.error('Error reading doctors CSV:', error);
    return [];
  }
};

module.exports = {
  processMedicalSymptoms
};
