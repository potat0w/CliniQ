const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../config/db');

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const mapGeminiDoctorToDbSpecialty = (doctor) => {
  const d = String(doctor || '').trim().toLowerCase();

  if (!d) return '';

  if (d.includes('derma')) return 'DERMATOLOGIST';
  if (d.includes('skin')) return 'DERMATOLOGIST';
  if (d.includes('cardio')) return 'CARDIOLOGIST';
  if (d.includes('heart')) return 'CARDIOLOGIST';
  if (d.includes('neuro')) return 'NEUROLOGIST';
  if (d.includes('gastro')) return 'GASTROENTEROLOGIST';
  if (d.includes('ortho')) return 'ORTHOPEDIC';
  if (d.includes('ent')) return 'ENT';
  if (d.includes('ophthal') || d.includes('eye')) return 'OPHTHALMOLOGIST';
  if (d.includes('psych')) return 'PSYCHIATRIST';
  if (d.includes('uro')) return 'UROLOGIST';
  if (d.includes('dent')) return 'DENTIST';
  if (d.includes('gyne')) return 'GYNECOLOGIST';
  if (d.includes('pedia')) return 'PEDIATRICIAN';
  if (d.includes('internal')) return 'INTERNAL MEDICINE';
  if (d.includes('general')) return 'GENERAL PHYSICIAN';
  if (d.includes('emergency')) return 'EMERGENCY MEDICINE';

  return doctor.toUpperCase();
};

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
   - You MUST output EXACTLY ONE value from this list:
     General Medicine, Internal Medicine, Cardiology, Gastroenterology, Neurology, Dermatology, Orthopedics, Gynecology, Pediatrics, ENT, Ophthalmology, Psychiatry, Urology, Dentistry, Emergency Medicine
   - If symptoms mention rash/rashes/skin/itching/hives/urticaria: choose Dermatology.
   - If symptoms mention chest pain: choose Cardiology UNLESS the user also explicitly mentions a red-flag:
     shortness of breath, fainting/passed out, crushing/pressure/tightness, sweating with chest pain, or pain spreading to arm/jaw/back. Then choose Emergency Medicine.
   - Do NOT default to General Medicine if a clear specialty applies.

Examples:
User: "I have rashes all over my body and itching."
Doctor: Dermatology

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
    const mappedSpecialty = mapGeminiDoctorToDbSpecialty(specialty);

    const { data, error } = await supabase
      .from('doctors')
      .select('doctor_id, doctor_name, education, speciality, experience, email, chambers(chamber_name, location)')
      .ilike('speciality', `%${mappedSpecialty}%`)
      .order('experience', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Supabase doctors query error:', error);
      return [];
    }

    return (data || []).map((d) => ({
      id: d.doctor_id,
      name: d.doctor_name,
      education: d.education,
      specialty: d.speciality,
      experience: d.experience || 0,
      chamber: d.chambers?.[0]?.chamber_name || '',
      location: d.chambers?.[0]?.location || '',
      concentration: ''
    }));
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
};

module.exports = {
  processMedicalSymptoms
};
