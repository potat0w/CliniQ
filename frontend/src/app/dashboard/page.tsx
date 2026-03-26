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
      const response = await fetch(`https://cliniq-1-hmus.onrender.com/api/patients/doctors/${doctorId}/availability`, {
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
      const token = localStorage.getItem('token')
      const response = await fetch('https://cliniq-1-hmus.onrender.com/api/patients/doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Doctors data from API:', data)
        
        if (data.doctors && Array.isArray(data.doctors)) {
          const doctors = data.doctors.map((doctor: any): Doctor => ({
            doctor_id: doctor.doctor_id,
            doctor_name: doctor.doctor_name,
            email: doctor.email || `${doctor.doctor_name.replace(/[^a-zA-Z\s]/g, '').toLowerCase().replace(/\s+/g, '.')}@hospital.com`,
            speciality: doctor.speciality,
            experience: doctor.experience,
            chamber: doctor.chamber,
            location: doctor.location,
            education: doctor.education || [],
            concentration: doctor.concentration || [],
            certifications: doctor.certifications || {},
            specializations: doctor.specializations || {}
          }))
          
          console.log('Processed doctors:', doctors.length)
          console.log('First doctor:', doctors[0])
          setDoctors(doctors)
        } else {
          console.error('Invalid doctors data format:', data)
          setDoctors([])
        }
      } else {
        console.error('Failed to fetch doctors from API, status:', response.status)
        // Fallback to empty array
        setDoctors([])
      }
    } catch (error) {
      console.error('Error fetching doctors from API:', error)
      setDoctors([])
    }
  }

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('https://cliniq-1-hmus.onrender.com/api/patients/appointments', {
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
      
      const slotsResponse = await fetch(`https://cliniq-1-hmus.onrender.com/api/patients/doctors/${selectedDoctor.doctor_id}/availability`, {
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
      
      const response = await fetch('https://cliniq-1-hmus.onrender.com/api/patients/appointments', {
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 shadow-xl">
          {notification}
        </div>
      )}
      
      <nav className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">CliniQ — Patient</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400">Welcome, {user.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 sm:p-5 mb-6 hover:border-zinc-600 transition-colors duration-150">
            <h2 className="text-sm font-semibold text-zinc-100 mb-3 tracking-tight">Your profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-zinc-500 text-xs uppercase tracking-wide">Name</span>
                <p className="text-zinc-100 mt-0.5">{user.name}</p>
              </div>
              <div>
                <span className="text-zinc-500 text-xs uppercase tracking-wide">Email</span>
                <p className="text-zinc-100 mt-0.5">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <span className="text-zinc-500 text-xs uppercase tracking-wide">Phone</span>
                  <p className="text-zinc-100 mt-0.5">{user.phone}</p>
                </div>
              )}
              {user.age && (
                <div>
                  <span className="text-zinc-500 text-xs uppercase tracking-wide">Age</span>
                  <p className="text-zinc-100 mt-0.5">{user.age}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg mb-6 overflow-hidden hover:border-zinc-600 transition-colors duration-150">
            <div className="flex flex-wrap border-b border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('doctors')}
                className={`px-5 py-3 text-xs font-medium transition-colors ${
                  activeTab === 'doctors'
                    ? 'text-primary-bright border-b-2 border-primary-bright bg-zinc-950/50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Find Doctors
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('appointments')}
                className={`px-5 py-3 text-xs font-medium transition-colors ${
                  activeTab === 'appointments'
                    ? 'text-primary-bright border-b-2 border-primary-bright bg-zinc-950/50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                My Appointments
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('voice')}
                className={`px-5 py-3 text-xs font-medium transition-colors ${
                  activeTab === 'voice'
                    ? 'text-primary-bright border-b-2 border-primary-bright bg-zinc-950/50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Voice Assistant
              </button>
              {user.email === 'admin@pillz.com' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('import')}
                  className={`px-5 py-3 text-xs font-medium transition-colors ${
                    activeTab === 'import'
                      ? 'text-primary-bright border-b-2 border-primary-bright bg-zinc-950/50'
                      : 'text-zinc-400 hover:text-zinc-200'
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
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 sm:p-5 hover:border-zinc-600 transition-colors duration-150">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4 tracking-tight">Your appointments</h3>
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.appointment_id}
                    className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-4 flex flex-col gap-3 hover:border-zinc-600 transition-colors duration-150"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-semibold text-zinc-100 leading-snug">
                          Appointment #{appointment.appointment_id}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {appointment.appointment_date || new Date(appointment.booking_time).toLocaleDateString()} · {appointment.start_time} – {appointment.end_time}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {appointment.doctors?.doctor_name || `Doctor ID ${appointment.doctor_id}`}
                          {appointment.doctors?.speciality ? ` · ${appointment.doctors.speciality}` : ''}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Phone: {appointment.patients?.phone || 'Not available'}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] px-2 py-0.5 rounded border ${
                          appointment.status === 'scheduled'
                            ? 'border-primary-bright/50 text-primary-bright bg-primary/10'
                            : appointment.status === 'completed'
                              ? 'border-primary-bright/50 text-primary-bright bg-primary/10'
                              : 'border-red-500/40 text-red-300 bg-red-500/10'
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <p className="text-zinc-500 text-center py-8 text-sm">No appointments scheduled.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 sm:p-5 hover:border-zinc-600 transition-colors duration-150">
              <h3 className="text-sm font-semibold text-zinc-100 mb-3 tracking-tight">Medical voice assistant</h3>
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-4">
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 w-full max-w-md shadow-xl">
            <h3 className="text-sm font-semibold text-zinc-100 mb-4 tracking-tight">Book with Dr. {selectedDoctor.doctor_name}</h3>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Select date</label>
                {loadingSlots ? (
                  <div className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-500 text-sm">
                    Loading available dates...
                  </div>
                ) : (
                  <DatePicker
                    selected={bookingData.date ? new Date(bookingData.date) : null}
                    onChange={handleDateChange}
                    includeDates={availableDates}
                    placeholderText="Select a date"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 text-sm focus:outline-none focus:border-zinc-600"
                    wrapperClassName="w-full"
                  />
                )}
                {availableDates.length === 0 && !loadingSlots && (
                  <p className="text-zinc-500 text-xs mt-1">No available slots in the next 30 days</p>
                )}
              </div>

              {slotsForSelectedDate.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Select time</label>
                  <select
                    value={bookingData.time}
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 text-sm focus:outline-none focus:border-zinc-600"
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
                <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Notes (optional)</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 text-sm focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
                  placeholder="Describe your symptoms or reason for visit..."
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={!bookingData.date || !bookingData.time}
                  className="flex-1 text-sm font-medium px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                  className="flex-1 text-sm font-medium px-3 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
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
