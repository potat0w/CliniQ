'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  upcomingAppointments: number
  totalPatients: number
  patients: Array<{
    patient_id: number
    name: string
    email: string
    phone?: string
    age?: number
    gender?: string
  }>
  appointments: Array<{
    appointment_id: number
    appointment_date: string
    start_time: string
    end_time: string
    status: string
    payment_done: boolean
    booking_time: string
    patients: {
      patient_id: number
      name: string
      email: string
      phone?: string
      age?: number
      gender?: string
    }
    doctors: {
      doctor_id: number
      doctor_name: string
      speciality: string
    }
    chambers: {
      chamber_id: number
      chamber_name: string
      location: string
    }
  }>
}

export default function DoctorDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    totalPatients: 0,
    patients: [],
    appointments: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    const userRole = localStorage.getItem('userRole')

    if (!token || !userData || userRole !== 'doctor') {
      router.push('/')
      return
    }

    try {
      setUser(JSON.parse(userData))
      fetchDashboardStats()
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [router])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('Fetching dashboard stats with token:', token ? 'Token exists' : 'No token')
      
      const response = await fetch('http://localhost:5000/api/doctors/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('API Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Dashboard data received:', data)
        setStats(data)
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch dashboard stats. Status:', response.status)
        console.error('Error response:', errorText)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
            <p className="text-gray-400 mt-2">Welcome back, Dr. {user?.name || 'User'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Appointments</h3>
            <p className="text-3xl font-bold mb-2">{stats.upcomingAppointments}</p>
            <p className="text-gray-400">Upcoming appointments</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-green-400">Patients</h3>
            <p className="text-3xl font-bold mb-2">{stats.totalPatients}</p>
            <p className="text-gray-400">Total patients</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-purple-400">Profile</h3>
            <p className="text-gray-400 mb-2">Speciality: {user?.specialty || 'Not specified'}</p>
            <p className="text-gray-400">Email: {user?.email || 'Not available'}</p>
          </div>
        </div>

        {/* Patients Details Section */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Patient Details</h2>
          {stats.patients && stats.patients.length > 0 ? (
            <div className="space-y-4">
              {stats.patients.map((patient) => (
                <div key={patient.patient_id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Patient Name</p>
                      <p className="text-white font-medium">{patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Email</p>
                      <p className="text-white">{patient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Phone</p>
                      <p className="text-white">{patient.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Age</p>
                      <p className="text-white">{patient.age || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Gender</p>
                      <p className="text-white">{patient.gender || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Patient ID</p>
                      <p className="text-white font-mono">#{patient.patient_id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No patients found.</p>
          )}
        </div>

        {/* Upcoming Appointments Section */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Appointments</h2>
          {stats.appointments && stats.appointments.length > 0 ? (
            <div className="space-y-4">
              {stats.appointments.map((appointment) => (
                <div key={appointment.appointment_id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Appointment #{appointment.appointment_id}</h3>
                      <p className="text-gray-300">
                        {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'Date not set'} • {appointment.start_time} - {appointment.end_time}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'scheduled' ? 'bg-blue-600 text-white' :
                      appointment.status === 'rescheduled' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Patient Info */}
                    <div className="bg-gray-800 rounded p-3">
                      <p className="text-sm text-gray-400 mb-1">Patient</p>
                      <p className="text-white font-medium">{appointment.patients?.name || 'Unknown'}</p>
                      <p className="text-gray-300 text-sm">{appointment.patients?.email}</p>
                      <p className="text-gray-300 text-sm">{appointment.patients?.phone || 'No phone'}</p>
                    </div>
                    
                    {/* Doctor Info */}
                    <div className="bg-gray-800 rounded p-3">
                      <p className="text-sm text-gray-400 mb-1">Doctor</p>
                      <p className="text-white font-medium">{appointment.doctors?.doctor_name || 'Unknown'}</p>
                      <p className="text-gray-300 text-sm">{appointment.doctors?.speciality}</p>
                    </div>
                    
                    {/* Chamber Info */}
                    <div className="bg-gray-800 rounded p-3">
                      <p className="text-sm text-gray-400 mb-1">Chamber</p>
                      <p className="text-white font-medium">{appointment.chambers?.chamber_name || 'Unknown'}</p>
                      <p className="text-gray-300 text-sm">{appointment.chambers?.location}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-sm text-gray-400">
                      Booked: {new Date(appointment.booking_time).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      Payment: {appointment.payment_done ? '✅ Paid' : '⏳ Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No upcoming appointments found.</p>
          )}
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-400">No recent activity to display.</p>
        </div>
      </div>
    </div>
  )
}
