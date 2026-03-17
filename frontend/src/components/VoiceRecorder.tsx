'use client';

import { useState, useRef, useCallback } from 'react';

interface TranscriptionResult {
  text: string;
  confidence: number;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  audio_duration: number;
}

interface MedicalAnalysis {
  symptom: string;
  duration: string;
  severity: string;
  doctor: string;
}

interface Doctor {
  id: string;
  name: string;
  education: string;
  specialty: string;
  experience: string;
  chamber: string;
  location: string;
  concentration: string;
}

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [medicalAnalysis, setMedicalAnalysis] = useState<MedicalAnalysis | null>(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscription(null);
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      setError('Failed to access microphone. Please allow microphone permissions.');
      console.error('Error accessing microphone:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const uploadAudio = async (audioBlob: Blob) => {
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, `recording-${Date.now()}.webm`);
      
      const response = await fetch('http://localhost:5000/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setTranscription(result.data);
        // Automatically analyze medical symptoms after transcription
        await analyzeMedicalSymptoms(result.data.text);
      } else {
        throw new Error(result.message || 'Transcription failed');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transcribe audio');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeMedicalSymptoms = async (symptoms: string) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/medical/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setMedicalAnalysis(result.data.analysis);
        setRecommendedDoctors(result.data.doctors);
      } else {
        throw new Error(result.message || 'Medical analysis failed');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze symptoms');
      console.error('Medical analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    setTranscription(null);
    setMedicalAnalysis(null);
    setRecommendedDoctors([]);
    setError(null);
    setRecordingTime(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
            Medical Assistant AI
          </h1>
          <p className="text-gray-600 text-center mb-4">
            🎤 Please describe your condition clearly:
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-gray-700 mb-2">
              <strong>What problem are you facing?</strong>
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Since how many days?</strong>
            </p>
            <p className="text-sm text-gray-700">
              <strong>How severe is it?</strong> (mild / moderate / severe)
            </p>
            <div className="mt-3 p-2 bg-white rounded border border-blue-300">
              <p className="text-xs text-gray-600 italic">
                Example: "I have chest pain for 10 days, it's mild."
              </p>
            </div>
          </div>
          
          {/* Recording Controls */}
          <div className="flex flex-col items-center space-y-6">
            {/* Recording Status */}
            <div className="text-center">
              {isRecording && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-medium text-gray-700">
                    Recording... {formatTime(recordingTime)}
                  </span>
                </div>
              )}
              
              {isUploading && (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className="text-lg font-medium text-gray-700">
                    Transcribing audio...
                  </span>
                </div>
              )}
              
              {isAnalyzing && (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                  <span className="text-lg font-medium text-gray-700">
                    Analyzing symptoms...
                  </span>
                </div>
              )}
            </div>
            
            {/* Record Button */}
            {!isRecording && !isUploading && !isAnalyzing && (
              <button
                onClick={startRecording}
                className="w-24 h-24 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/>
                </svg>
              </button>
            )}
            
            {isRecording && (
              <button
                onClick={stopRecording}
                className="w-24 h-24 bg-gray-800 hover:bg-gray-900 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd"/>
                </svg>
              </button>
            )}
            
            {/* Instructions */}
            {!isRecording && !isUploading && !isAnalyzing && !transcription && (
              <p className="text-sm text-gray-500 text-center max-w-md">
                Click the microphone button to start recording. Speak clearly and click again to stop.
              </p>
            )}
            
            {/* Reset Button */}
            {(transcription || error) && !isUploading && !isAnalyzing && (
              <button
                onClick={resetRecording}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
              >
                New Recording
              </button>
            )}
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Medical Analysis Result */}
          {medicalAnalysis && (
            <div className="mt-8 space-y-4">
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-800">Analysis Results</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-blue-600">AI Analysis</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Symptom:</h4>
                    <p className="text-gray-800">{medicalAnalysis.symptom}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Duration:</h4>
                    <p className="text-gray-800">{medicalAnalysis.duration}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Severity:</h4>
                    <p className="text-gray-800">{medicalAnalysis.severity}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Recommended Doctor:</h4>
                    <p className="text-gray-800 font-medium text-blue-600">{medicalAnalysis.doctor}</p>
                  </div>
                </div>
              </div>
              
              {/* Recommended Doctors */}
              {recommendedDoctors.length > 0 && (
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">
                    Recommended Doctor Type: {medicalAnalysis.doctor}
                  </h3>
                  <h4 className="font-medium text-gray-700 mb-3">Top Doctors:</h4>
                  <div className="space-y-3">
                    {recommendedDoctors.map((doctor, index) => (
                      <div key={doctor.id} className="bg-white p-4 rounded-lg border border-green-300">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-800">
                              {index + 1}. {doctor.name} – {doctor.experience} years – {doctor.chamber}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              📍 {doctor.location} | 🎓 {doctor.education}
                            </p>
                            {doctor.concentration && (
                              <p className="text-sm text-gray-600">
                                🔬 {doctor.concentration}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Transcription Result */}
          {transcription && (
            <div className="mt-8 space-y-4">
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-green-800">Transcription Result</h3>
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <span>Confidence:</span>
                    <span className="font-medium">{Math.round(transcription.confidence * 100)}%</span>
                  </div>
                </div>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {transcription.text}
                </p>
                <div className="mt-4 text-sm text-gray-600">
                  Duration: {Math.round(transcription.audio_duration)}s
                </div>
              </div>
              
              {/* Word-level timestamps (optional) */}
              {transcription.words && transcription.words.length > 0 && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Word Details</h4>
                  <div className="flex flex-wrap gap-2">
                    {transcription.words.map((word, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                        title={`Confidence: ${Math.round(word.confidence * 100)}%`}
                      >
                        {word.word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Voice Recording</h3>
            <p className="text-sm text-gray-600 mt-1">Crystal clear audio recording</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">AI Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">Intelligent medical symptom analysis</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100-4h-.5a1 1 0 000-2H8a2 2 0 012-2h2a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Medical Guidance</h3>
            <p className="text-sm text-gray-600 mt-1">Structured medical recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
