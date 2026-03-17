# Medical Assistant AI Setup Guide

## Overview

This system integrates voice recording, transcription, and AI-powered medical symptom analysis to provide structured medical guidance.

## Architecture

```
🎤 Voice (Frontend)
   ↓
AssemblyAI → text
   ↓
Gemini API (medical analysis)
   ↓
Structured response
   ↓
Frontend display
```

## Setup Instructions

### 1. Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your API keys:
     ```env
     ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
     GEMINI_API_KEY=your_gemini_api_key_here
     ```

3. **Start Backend Server**
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Frontend**
   ```bash
   npm run dev
   ```

## API Endpoints

### Medical Analysis
- **POST** `/api/medical/analyze`
- **Body**: `{ "symptoms": "I have chest pain from 10 to 15 days..." }`
- **Response**: Structured medical analysis with symptoms, duration, severity, possible causes, follow-up questions, recommended doctor, advice, and safety notes

### Transcription
- **POST** `/api/transcribe`
- **Body**: FormData with audio file
- **Response**: Transcribed text with confidence scores

## Response Format

The medical analysis returns structured data:

```json
{
  "success": true,
  "data": {
    "parsed": {
      "symptoms": "Chest pain",
      "duration": "10-15 days",
      "severity": "Not specified",
      "possibleCauses": "Could be related to heart issues, muscle strain, acid reflux, or stress.",
      "followUpQuestions": [
        "Is the chest pain sharp, dull, or burning?",
        "Does it get worse with physical activity?",
        "Do you have shortness of breath or dizziness?"
      ],
      "recommendedDoctor": "Cardiologist",
      "advice": "Since the pain has lasted for over 10 days, it is important to get checked soon.",
      "safetyNote": "Persistent chest pain can be serious. Seek immediate medical attention if pain worsens or is accompanied by breathing difficulty."
    }
  }
}
```

## Features

1. **Voice Recording**: High-quality audio capture
2. **Transcription**: Fast speech-to-text conversion with AssemblyAI
3. **AI Analysis**: Intelligent medical symptom analysis using Gemini
4. **Structured Output**: Organized medical recommendations
5. **Safety Features**: Automatic safety warnings for serious symptoms

## Safety Notes

- ⚠️ This system provides medical guidance, NOT diagnosis
- 🚨 Always consult healthcare professionals for serious conditions
- 📋 The AI suggests doctor types but doesn't replace medical consultation
- 🔒 User data is processed securely and not stored permanently

## Testing

Test with the example input:
```
"I have chest pain from 10 to 15 days. I don't know what to do. Why is this happening?"
```

Expected output should include:
- Symptoms: Chest pain
- Duration: 10-15 days
- Recommended Doctor: Cardiologist
- Safety note about persistent chest pain

## Troubleshooting

1. **API Key Issues**: Ensure both AssemblyAI and Gemini API keys are correctly set
2. **CORS Errors**: Check that frontend origin is allowed in backend CORS settings
3. **Audio Issues**: Ensure microphone permissions are granted
4. **Analysis Errors**: Verify Gemini API quota and model availability
