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
 * Get recommended doctors based on specialty with advanced scoring
 * @param {string} specialty - Doctor specialty
 * @returns {Array} - Array of recommended doctors
 */
const getRecommendedDoctors = async (specialty) => {
  try {
    const csvPath = path.join(__dirname, '../doctors_processed_data.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV properly handling quoted fields
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);
    
    const doctors = [];
    
    // Qualification scoring system
    const qualificationScores = {
      'MBBS': 1,
      'FCPS': 2,
      'MD': 3,
      'MS': 2.5,
      'PHD': 3.5,
      'BCS': 1.5,
      'MCPS': 1.8,
      'CCD': 1.2,
      'PGT': 1.3,
      'BDS': 1,
      'MPH': 1.5
    };
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length >= headers.length) {
        const doctor = {};
        headers.forEach((header, index) => {
          doctor[header.trim()] = values[index] ? values[index].trim() : '';
        });
        
        // Match specialty (case-insensitive, partial match with common variations)
        const specialtyNormalized = specialty.toLowerCase().trim();
        const doctorSpecialty = doctor.Speciality ? doctor.Speciality.toLowerCase().trim() : '';
        
        // Handle common specialty variations
        const specialtyMatches = 
          doctorSpecialty.includes(specialtyNormalized) ||
          specialtyNormalized.includes(doctorSpecialty) ||
          (specialtyNormalized.includes('cardio') && doctorSpecialty.includes('cardio')) ||
          (specialtyNormalized.includes('neuro') && doctorSpecialty.includes('neuro')) ||
          (specialtyNormalized.includes('medic') && doctorSpecialty.includes('medic')) ||
          (specialtyNormalized.includes('surge') && doctorSpecialty.includes('surge')) ||
          (specialtyNormalized.includes('pedia') && doctorSpecialty.includes('pedia')) ||
          (specialtyNormalized.includes('gynae') && doctorSpecialty.includes('gynae')) ||
          (specialtyNormalized.includes('ortho') && doctorSpecialty.includes('ortho'));
        
        if (doctor.Speciality && specialtyMatches) {
          
          // Calculate qualification score
          let qualificationScore = 0;
          const education = doctor.Education || '';
          
          for (const [qualification, score] of Object.entries(qualificationScores)) {
            if (education.toLowerCase().includes(qualification.toLowerCase())) {
              qualificationScore += score;
            }
          }
          
          // Calculate experience score (normalized)
          const experience = parseInt(doctor.Experience) || 0;
          const maxExperience = 50; // Assumed max experience for normalization
          const normalizedExperience = experience / maxExperience;
          
          // Calculate qualification score (normalized)
          const maxQualificationScore = 10; // Assumed max qualification score
          const normalizedQualification = Math.min(qualificationScore / maxQualificationScore, 1);
          
          // Weighted recommendation score (60% experience, 40% qualification)
          const recommendationScore = (0.6 * normalizedExperience) + (0.4 * normalizedQualification);
          
          doctors.push({
            id: doctor['Doctor ID'],
            name: doctor['Doctor Name'],
            education: doctor.Education,
            specialty: doctor.Speciality,
            experience: experience,
            chamber: doctor.Chamber,
            location: doctor.Location,
            concentration: doctor.Concentration,
            qualificationScore: qualificationScore,
            recommendationScore: recommendationScore
          });
        }
      }
    }
    
    // Sort by recommendation score (descending)
    doctors.sort((a, b) => b.recommendationScore - a.recommendationScore);
    
    // Return top 10 doctors (more options for patients)
    return doctors.slice(0, 10);
    
  } catch (error) {
    console.error('Error reading doctors CSV:', error);
    return [];
  }
};

// Helper function to parse CSV lines with quoted fields
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

module.exports = {
  processMedicalSymptoms
};
