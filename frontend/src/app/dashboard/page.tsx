'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import VoiceAgent from '@/components/VoiceAgent'

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
  const [activeTab, setActiveTab] = useState<'doctors' | 'appointments' | 'voice'>('doctors')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    notes: ''
  })
  const router = useRouter()

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

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDoctors(data.doctors || [])
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
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
        console.log('Appointments data:', data) // Debug log
        setAppointments(data || []) // Changed from data.appointments to data
      } else {
        const error = await response.json()
        console.error('Error response:', error)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoctor) return

    try {
      const token = localStorage.getItem('token')
      
      // First get available slots for the selected doctor
      const slotsResponse = await fetch(`http://localhost:5000/api/patients/doctors/${selectedDoctor.doctor_id}/availability`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!slotsResponse.ok) {
        alert('Failed to fetch doctor availability')
        return
      }

      const slots = await slotsResponse.json()
      
      if (slots.length === 0) {
        alert('No available slots for this doctor')
        return
      }

      // Book the first available slot (simplified for demo)
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
        alert('Appointment booked successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('Failed to book appointment')
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
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'doctors' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Available Doctors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doctor) => (
                  <div key={doctor.doctor_id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <h4 className="text-lg font-medium text-white mb-2">{doctor.doctor_name}</h4>
                    <p className="text-gray-300 mb-1">Speciality: {doctor.speciality}</p>
                    {doctor.experience && (
                      <p className="text-gray-300 mb-1">Experience: {doctor.experience} years</p>
                    )}
                    {doctor.email && (
                      <p className="text-gray-300 mb-3">Email: {doctor.email}</p>
                    )}
                    <button
                      onClick={() => {
                        setSelectedDoctor(doctor)
                        setShowBookingForm(true)
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Book Appointment
                    </button>
                  </div>
                ))}
              </div>
              {doctors.length === 0 && (
                <p className="text-gray-400 text-center py-8">No doctors available at the moment.</p>
              )}
            </div>
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
                        <p className="text-gray-300">Booking Date: {new Date(appointment.booking_time).toLocaleDateString()}</p>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={bookingData.date}
                  onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={bookingData.time}
                  onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Book Appointment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false)
                    setSelectedDoctor(null)
                    setBookingData({ date: '', time: '', notes: '' })
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
