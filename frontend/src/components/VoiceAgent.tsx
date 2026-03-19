'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export default function VoiceAgent() {
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState("Click microphone to start");
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [medicalAnalysis, setMedicalAnalysis] = useState<any>(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const startRecording = useCallback(async () => {
    try {
      setMessage("Requesting microphone access...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Create audio blob and process
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Recording completed, blob size:', audioBlob.size);
        
        // Upload to backend for transcription and analysis
        await uploadAndAnalyze(audioBlob);
        
        // Reset timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setMessage("Recording... Click to stop");
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setMessage("❌ Microphone access denied. Please allow microphone permissions.");
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setMessage("Processing recording...");
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const uploadAndAnalyze = async (audioBlob: Blob) => {
    setIsUploading(true);
    setError("");
    setMessage("Transcribing audio...");
    
    try {
      // Step 1: Transcribe audio
      const formData = new FormData();
      formData.append('audio', audioBlob, `recording-${Date.now()}.webm`);
      
      const transcribeResponse = await fetch('http://localhost:5000/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!transcribeResponse.ok) {
        throw new Error('Transcription failed');
      }
      
      const transcribeResult = await transcribeResponse.json();
      
      if (transcribeResult.success) {
        setTranscription(transcribeResult.data.text);
        setMessage("Analyzing symptoms...");
        
        // Step 2: Analyze medical symptoms
        await analyzeSymptoms(transcribeResult.data.text);
      } else {
        throw new Error(transcribeResult.message || 'Transcription failed');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process audio';
      setError(errorMessage);
      setMessage("❌ " + errorMessage);
      setIsUploading(false);
    }
  };

  const analyzeSymptoms = async (symptoms: string) => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/medical/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms }),
      });
      
      if (!response.ok) {
        throw new Error('Medical analysis failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setMedicalAnalysis(result.data.analysis);
        setRecommendedDoctors(result.data.doctors || []);
        setMessage("✅ Analysis complete!");
      } else {
        throw new Error(result.message || 'Analysis failed');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze symptoms';
      setError(errorMessage);
      setMessage("❌ " + errorMessage);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    setRecordingTime(0);
    setMessage("Click the microphone to start");
    setTranscription("");
    setMedicalAnalysis(null);
    setRecommendedDoctors([]);
    setError("");
  };

  const bookDoctorAppointment = async (doctor: any) => {
    if (!user) {
      showToast('Please login to book an appointment', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // First get available slots for doctor
      const slotsResponse = await fetch(`http://localhost:5000/api/patients/doctors/${doctor.id}/availability`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!slotsResponse.ok) {
        showToast('Failed to fetch doctor availability', 'error');
        return;
      }

      const slots = await slotsResponse.json();
      
      if (slots.length === 0) {
        showToast('No available slots for this doctor', 'info');
        return;
      }

      // Show available slots in modal
      setAvailableSlots(slots);
      setSelectedDoctorForBooking(doctor);
      setShowBookingModal(true);
      
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      showToast('Failed to fetch doctor availability', 'error');
    }
  };

  const confirmBooking = async (slot: any) => {
    if (!selectedDoctorForBooking || !user) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/patients/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctorForBooking.id,
          slotId: slot.slot_id,
          notes: `Booked from voice assistant recommendation for ${medicalAnalysis?.symptom}`
        })
      });

      if (response.ok) {
        // Convert day number to day name
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[slot.day_of_week] || slot.day_of_week;
        
        showToast(`Appointment booked with Dr. ${selectedDoctorForBooking.name} for ${dayName} (${slot.start_time}-${slot.end_time})`, 'success');
        setShowBookingModal(false);
        setAvailableSlots([]);
        setSelectedDoctorForBooking(null);
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to book appointment', 'error');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      showToast('Failed to book appointment', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 className="text-white font-medium mb-2">🎤 Medical Voice Assistant</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <p>• Click the microphone to record your symptoms</p>
          <p>• Describe: what problem, how long, severity</p>
          <p>• Get AI analysis and doctor recommendations</p>
        </div>
      </div>
      
      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-600 text-white' :
          toast.type === 'error' ? 'bg-red-600 text-white' :
          'bg-blue-600 text-white'
        }`}>
          <div className="flex items-center">
            {toast.type === 'success' && (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 00016zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2z" clipRule="evenodd"/>
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 00016zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293z" clipRule="evenodd"/>
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
      
      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <p className="text-white mb-2">{message}</p>
          {isRecording && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}
          {isUploading && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-white font-medium">Transcribing...</span>
            </div>
          )}
          {isAnalyzing && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
              <span className="text-white font-medium">Analyzing...</span>
            </div>
          )}
        </div>
        
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isUploading || isAnalyzing}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording 
              ? 'bg-gray-600 hover:bg-gray-700 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isRecording ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd"/>
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/>
            </svg>
          )}
        </button>
        
        <p className="text-sm text-gray-400 text-center max-w-md">
          {isRecording ? "Click to stop recording" : isUploading || isAnalyzing ? "Processing..." : "Click to start recording"}
        </p>
        
        {/* Reset Button */}
        {(transcription || medicalAnalysis || error) && !isUploading && !isAnalyzing && (
          <button
            onClick={resetRecording}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            New Recording
          </button>
        )}
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-900 border border-red-700 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-300">Error</h3>
              <p className="text-sm text-red-200 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Transcription Result */}
      {transcription && (
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">📝 What you said:</h3>
          <p className="text-white leading-relaxed">{transcription}</p>
        </div>
      )}
      
      {/* Medical Analysis Result */}
      {medicalAnalysis && (
        <div className="p-6 bg-blue-900 border border-blue-700 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-300 mb-4">🩺 Analysis Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-300 mb-1">Symptom:</h4>
              <p className="text-white">{medicalAnalysis.symptom}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-300 mb-1">Duration:</h4>
              <p className="text-white">{medicalAnalysis.duration}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-300 mb-1">Severity:</h4>
              <p className="text-white">{medicalAnalysis.severity}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-300 mb-1">Recommended Doctor:</h4>
              <p className="text-white font-medium text-blue-400">{medicalAnalysis.doctor}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Recommended Doctors */}
      {recommendedDoctors.length > 0 && (
        <div className="p-6 bg-green-900 border border-green-700 rounded-lg">
          <h3 className="text-lg font-semibold text-green-300 mb-4">👨‍⚕️ Recommended Doctors</h3>
          <div className="space-y-4">
            {recommendedDoctors.map((doctor, index) => (
              <div key={doctor.id} className="bg-gray-800 p-4 rounded-lg border border-green-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">
                      {index + 1}. {doctor.name}
                    </h4>
                    <p className="text-green-400 text-sm mb-2">{doctor.specialty}</p>
                    <p className="text-gray-300 text-sm mb-1">
                      🎓 {doctor.education}
                    </p>
                    <p className="text-gray-300 text-sm mb-1">
                      🏥 {doctor.chamber}
                    </p>
                    <p className="text-gray-300 text-sm mb-1">
                      📍 {doctor.location}
                    </p>
                    <p className="text-gray-300 text-sm">
                      ⭐ Score: {doctor.recommendationScore?.toFixed(2)} | 📅 {doctor.experience} years
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => bookDoctorAppointment(doctor)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Status Display */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
        <h4 className="text-white font-medium mb-2">Status</h4>
        <p className="text-gray-300">
          {isRecording ? "🔴 Recording in progress..." : 
           isUploading ? "📤 Transcribing audio..." :
           isAnalyzing ? "🧠 Analyzing symptoms..." :
           "⚪ Ready to record"}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          {recordingTime > 0 ? `Duration: ${formatTime(recordingTime)}` : "Click microphone to begin"}
        </p>
      </div>
      
      {/* Booking Modal */}
      {showBookingModal && selectedDoctorForBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              Book Appointment with Dr. {selectedDoctorForBooking.name}
            </h3>
            <p className="text-gray-300 mb-4">Select an available time slot:</p>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {availableSlots.map((slot, index) => {
                // Convert day number to day name
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const dayName = dayNames[slot.day_of_week] || slot.day_of_week;
                
                return (
                  <button
                    key={slot.slot_id}
                    onClick={() => confirmBooking(slot)}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg text-left transition-colors duration-200"
                  >
                    <div className="font-medium">{dayName}</div>
                    <div className="text-sm text-gray-300">
                      {slot.start_time} - {slot.end_time}
                    </div>
                    <div className="text-xs text-green-400">
                      Fee: ${slot.fee || 1000}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setAvailableSlots([]);
                  setSelectedDoctorForBooking(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
