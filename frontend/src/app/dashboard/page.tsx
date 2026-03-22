'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import VoiceAgent from '@/components/VoiceAgent'
import DoctorList from '@/components/DoctorList'
import DoctorImport from '@/components/DoctorImport'
import Papa from 'papaparse'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  age?: number
  gender?: string
}

interface Doctor {
  doctor_id: string
  doctor_name: string
  email: string
  phone?: string
  speciality: string
  experience?: number
  chamber_id?: string
  education?: string[]
  chamber?: string
  location?: string
  concentration?: string[]
  certifications?: {
    MBBS: boolean
    FCPS: boolean
    BCS: boolean
    MD: boolean
    MS: boolean
    MCPS: boolean
    CCD: boolean
    PGT: boolean
    BDS: boolean
    MPH: boolean
  }
  specializations?: {
    gynae_problems: boolean
    cardiac_medicine: boolean
    general_medicine: boolean
    aesthetic_medicine: boolean
    adolescent_medicine: boolean
    infectious_diseases: boolean
    geriatric_medicine: boolean
    pcos: boolean
    hormone_disturbances: boolean
    pediatric_health_checkup: boolean
  }
}

interface Appointment {
  appointment_id: number
  doctor_id: number
  chamber_id: number
  day_of_week: number
  start_time: string
  end_time: string
  booking_time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  payment_done: boolean
  patient_id: number
  appointment_date: string | null
  doctors?: {
    doctor_id: number
    doctor_name: string
    email: string
    speciality: string
  }
  patients?: {
    patient_id: number
    name: string
    phone: string
    email: string
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'doctors' | 'appointments' | 'voice' | 'import'>('doctors')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    notes: ''
  })
  const [doctorSlots, setDoctorSlots] = useState<any[]>([])
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [slotsForSelectedDate, setSlotsForSelectedDate] = useState<any[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const router = useRouter()

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  // Generate next N dates for weekly slots
  const generateAvailableDates = (slots: any[], daysAhead = 30) => {
    const today = new Date()
    const availableDates = []

    for (let i = 0; i <= daysAhead; i++) {
      const date = new Date()
      date.setDate(today.getDate() + i)
      const day = date.getDay() // 0=Sunday, 1=Monday, ...
      
      // Check if any slot matches this day
      if (slots.some(slot => slot.day_of_week === day)) {
        availableDates.push(new Date(date))
      }
    }

    return availableDates
  }

  const fetchDoctorSlots = async (doctorId: string) => {
    setLoadingSlots(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/patients/doctors/${doctorId}/availability`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const slots = await response.json()
        if (slots.length === 0) {
          // If no slots found in database, create default slots for CSV doctors
          const defaultSlots = [
            { day_of_week: 1, start_time: "09:00", end_time: "12:00" }, // Monday
            { day_of_week: 1, start_time: "14:00", end_time: "17:00" }, // Monday
            { day_of_week: 3, start_time: "09:00", end_time: "12:00" }, // Wednesday
            { day_of_week: 3, start_time: "14:00", end_time: "17:00" }, // Wednesday
            { day_of_week: 5, start_time: "09:00", end_time: "12:00" }, // Friday
            { day_of_week: 5, start_time: "14:00", end_time: "17:00" }, // Friday
          ]
          setDoctorSlots(defaultSlots)
          const dates = generateAvailableDates(defaultSlots)
          setAvailableDates(dates)
        } else {
          setDoctorSlots(slots)
          const dates = generateAvailableDates(slots)
          setAvailableDates(dates)
        }
      } else {
        // If API fails, still provide default slots
        const defaultSlots = [
          { day_of_week: 1, start_time: "09:00", end_time: "12:00" }, // Monday
          { day_of_week: 1, start_time: "14:00", end_time: "17:00" }, // Monday
          { day_of_week: 3, start_time: "09:00", end_time: "12:00" }, // Wednesday
          { day_of_week: 3, start_time: "14:00", end_time: "17:00" }, // Wednesday
          { day_of_week: 5, start_time: "09:00", end_time: "12:00" }, // Friday
          { day_of_week: 5, start_time: "14:00", end_time: "17:00" }, // Friday
        ]
        setDoctorSlots(defaultSlots)
        const dates = generateAvailableDates(defaultSlots)
        setAvailableDates(dates)
      }
    } catch (error) {
      console.error('Error fetching doctor slots:', error)
      // Even on error, provide default slots so users can still book
      const defaultSlots = [
        { day_of_week: 1, start_time: "09:00", end_time: "12:00" }, // Monday
        { day_of_week: 1, start_time: "14:00", end_time: "17:00" }, // Monday
        { day_of_week: 3, start_time: "09:00", end_time: "12:00" }, // Wednesday
        { day_of_week: 3, start_time: "14:00", end_time: "17:00" }, // Wednesday
        { day_of_week: 5, start_time: "09:00", end_time: "12:00" }, // Friday
        { day_of_week: 5, start_time: "14:00", end_time: "17:00" }, // Friday
      ]
      setDoctorSlots(defaultSlots)
      const dates = generateAvailableDates(defaultSlots)
      setAvailableDates(dates)
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const selectedDay = date.getDay()
      const slotsForDay = doctorSlots.filter(slot => slot.day_of_week === selectedDay)
      setSlotsForSelectedDate(slotsForDay)
      setBookingData({
        ...bookingData,
        date: date.toISOString().split('T')[0],
        time: '' // Reset time when date changes
      })
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    const userRole = localStorage.getItem('userRole')

    if (!token || !userData || userRole !== 'patient') {
      router.push('/')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchDoctors()
      fetchAppointments()
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [router])

  const parseStringArray = (str: string): string[] => {
  if (!str) return []
  try {
    // Try parsing as JSON first
    return JSON.parse(str)
  } catch {
    // If that fails, it's likely using single quotes, so convert to valid JSON
    try {
      const converted = str.replace(/'/g, '"')
      return JSON.parse(converted)
    } catch {
      // If still fails, return empty array
      return []
    }
  }
}

const fetchDoctors = async () => {
    try {
      const response = await fetch('/doctors_processed_data.csv')
      const csvText = await response.text()
      
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          console.log('Raw CSV data:', results.data)
          console.log('Total rows:', results.data.length)
          
          const doctors = results.data
            .filter((doctor: any, index: number) => {
              // Skip header row and ensure we have basic data
              if (index === 0 && doctor['Doctor ID'] === 'Doctor ID') return false
              return doctor['Doctor ID'] && doctor['Doctor Name']
            })
            .map((doctor: any): Doctor => ({
              doctor_id: doctor['Doctor ID'],
              doctor_name: doctor['Doctor Name'],
              email: `${doctor['Doctor Name'].replace(/[^a-zA-Z\s]/g, '').toLowerCase().replace(/\s+/g, '.')}@hospital.com`,
              speciality: doctor['Speciality'],
              experience: doctor['Experience'] ? parseInt(doctor['Experience']) : undefined,
              chamber: doctor['Chamber'],
              location: doctor['Location'],
              education: parseStringArray(doctor['Education']),
              concentration: parseStringArray(doctor['Concentration']),
              certifications: {
                MBBS: doctor['MBBS'] === '1',
                FCPS: doctor['FCPS'] === '1',
                BCS: doctor['BCS'] === '1',
                MD: doctor['MD'] === '1',
                MS: doctor['MS'] === '1',
                MCPS: doctor['MCPS'] === '1',
                CCD: doctor['CCD'] === '1',
                PGT: doctor['PGT'] === '1',
                BDS: doctor['BDS'] === '1',
                MPH: doctor['MPH'] === '1'
              },
              specializations: {
                gynae_problems: doctor['Gynae Problems'] === '1',
                cardiac_medicine: doctor['Cardiac Medicine'] === '1',
                general_medicine: doctor['General Medicine'] === '1',
                aesthetic_medicine: doctor['Aesthetic Medicine'] === '1',
                adolescent_medicine: doctor['Adolescent Medicine'] === '1',
                infectious_diseases: doctor['Infectious Diseases'] === '1',
                geriatric_medicine: doctor['Geriatric Medicine'] === '1',
                pcos: doctor['Polycystic Ovary Syndrome (Pcos)'] === '1',
                hormone_disturbances: doctor['Hormone Dirtubances'] === '1',
                pediatric_health_checkup: doctor['Health Checkup (Pediatric)'] === '1'
              }
            }))
          
          console.log('Filtered doctors:', doctors.length)
          console.log('First doctor:', doctors[0])
          setDoctors(doctors)
        },
        error: (error: any) => {
          console.error('Error parsing CSV:', error)
        }
      })
    } catch (error) {
      console.error('Error fetching CSV:', error)
    }
  }

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/patients/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Appointments data:', data)
        setAppointments(data || [])
      } else {
        const error = await response.json()
        console.error('Error response:', error)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowBookingForm(true)
    setBookingData({ date: '', time: '', notes: '' })
    setDoctorSlots([])
    setAvailableDates([])
    setSlotsForSelectedDate([])
    fetchDoctorSlots(doctor.doctor_id)
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoctor) return

    try {
      const token = localStorage.getItem('token')
      
      const slotsResponse = await fetch(`http://localhost:5000/api/patients/doctors/${selectedDoctor.doctor_id}/availability`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!slotsResponse.ok) {
        showNotification('Failed to fetch doctor availability')
        return
      }

      const slots = await slotsResponse.json()
      
      if (slots.length === 0) {
        showNotification('No available slots for this doctor')
        return
      }

      const firstSlot = slots[0]
      
      const response = await fetch('http://localhost:5000/api/patients/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.doctor_id,
          slotId: firstSlot.slot_id,
          notes: bookingData.notes
        })
      })

      if (response.ok) {
        setShowBookingForm(false)
        setSelectedDoctor(null)
        setBookingData({ date: '', time: '', notes: '' })
        fetchAppointments()
        showNotification('Appointment booked successfully!')
      } else {
        const error = await response.json()
        showNotification(error.error || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      showNotification('Failed to book appointment')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {notification && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}
      
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">Pillz - Patient Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Profile Section */}
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-white mb-4">Your Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="font-medium text-gray-300">Name:</span>
                  <span className="ml-2 text-white">{user.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-300">Email:</span>
                  <span className="ml-2 text-white">{user.email}</span>
                </div>
                {user.phone && (
                  <div>
                    <span className="font-medium text-gray-300">Phone:</span>
                    <span className="ml-2 text-white">{user.phone}</span>
                  </div>
                )}
                {user.age && (
                  <div>
                    <span className="font-medium text-gray-300">Age:</span>
                    <span className="ml-2 text-white">{user.age}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-800 rounded-lg mb-6">
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('doctors')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'doctors'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Find Doctors
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'appointments'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                My Appointments
              </button>
              <button
                onClick={() => setActiveTab('voice')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'voice'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Voice Assistant
              </button>
              {user.email === 'admin@pillz.com' && (
                <button
                  onClick={() => setActiveTab('import')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'import'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Import Doctors
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'doctors' && (
            <DoctorList 
              doctors={doctors} 
              onBookAppointment={handleBookAppointment}
            />
          )}

          {activeTab === 'appointments' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Your Appointments</h3>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.appointment_id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">Appointment ID: {appointment.appointment_id}</p>
                        <p className="text-gray-300">Date: {appointment.appointment_date || new Date(appointment.booking_time).toLocaleDateString()}</p>
                        <p className="text-gray-300">Time: {appointment.start_time} - {appointment.end_time}</p>
                        <p className="text-gray-300">Doctor: {appointment.doctors?.doctor_name || `Dr. ID: ${appointment.doctor_id}`}</p>
                        {appointment.doctors?.speciality && (
                          <p className="text-gray-300">Speciality: {appointment.doctors.speciality}</p>
                        )}
                        <p className="text-gray-300">Phone: {appointment.patients?.phone || 'Not available'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'scheduled' ? 'bg-blue-600 text-white' :
                        appointment.status === 'completed' ? 'bg-green-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No appointments scheduled.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Medical Voice Assistant</h3>
              <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                <p className="text-gray-300 mb-4">
                  Talk to our AI medical assistant for symptom checking, medical advice, and health information.
                </p>
                <VoiceAgent />
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <DoctorImport onImportComplete={showNotification} />
          )}
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingForm && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">
              Book Appointment with Dr. {selectedDoctor.doctor_name}
            </h3>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Select Date</label>
                {loadingSlots ? (
                  <div className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400">
                    Loading available dates...
                  </div>
                ) : (
                  <DatePicker
                    selected={bookingData.date ? new Date(bookingData.date) : null}
                    onChange={handleDateChange}
                    includeDates={availableDates}
                    placeholderText="Select a date"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    wrapperClassName="w-full"
                  />
                )}
                {availableDates.length === 0 && !loadingSlots && (
                  <p className="text-gray-400 text-sm mt-1">No available slots in the next 30 days</p>
                )}
              </div>
              
              {slotsForSelectedDate.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Select Time</label>
                  <select
                    value={bookingData.time}
                    onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a time slot</option>
                    {slotsForSelectedDate.map((slot, idx) => (
                      <option key={idx} value={slot.start_time}>
                        {slot.start_time} - {slot.end_time}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes (Optional)</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your symptoms or reason for visit..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={!bookingData.date || !bookingData.time}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Book Appointment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false)
                    setSelectedDoctor(null)
                    setBookingData({ date: '', time: '', notes: '' })
                    setDoctorSlots([])
                    setAvailableDates([])
                    setSlotsForSelectedDate([])
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
