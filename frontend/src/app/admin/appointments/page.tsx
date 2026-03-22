'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Appointment {
  appointment_id: number
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  payment_done: boolean
  patients?: {
    name: string
    email: string
    phone?: string
  }
  doctors?: {
    doctor_name: string
    speciality: string
  }
  chambers?: {
    chamber_name: string
    location: string
  }
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')

    if (!token || userRole !== 'admin') {
      router.push('/admin/login')
      return
    }

    fetchAppointments()
  }, [router])

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/admin/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      } else {
        setError('Failed to fetch appointments')
      }
    } catch (error) {
      setError('Error fetching appointments')
    } finally {
      setLoading(false)
    }
  }

  const deleteAppointment = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setAppointments(appointments.filter(a => a.appointment_id !== appointmentId))
      } else {
        setError('Failed to delete appointment')
      }
    } catch (error) {
      setError('Error deleting appointment')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/admin/dashboard')}
                className="text-blue-600 hover:text-blue-800 mr-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Manage Appointments</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Add New Appointment
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <li key={appointment.appointment_id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Appointment #{appointment.appointment_id}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            appointment.payment_done ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.payment_done ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-600">
                          {appointment.appointment_date} • {appointment.start_time} - {appointment.end_time}
                        </p>
                        
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {appointment.patients && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Patient</p>
                              <p className="text-sm text-gray-600">{appointment.patients.name}</p>
                              <p className="text-sm text-gray-600">{appointment.patients.email}</p>
                              {appointment.patients.phone && (
                                <p className="text-sm text-gray-600">{appointment.patients.phone}</p>
                              )}
                            </div>
                          )}
                          
                          {appointment.doctors && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Doctor</p>
                              <p className="text-sm text-gray-600">{appointment.doctors.doctor_name}</p>
                              <p className="text-sm text-gray-600">{appointment.doctors.speciality}</p>
                            </div>
                          )}
                          
                          {appointment.chambers && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Chamber</p>
                              <p className="text-sm text-gray-600">{appointment.chambers.chamber_name}</p>
                              <p className="text-sm text-gray-600">{appointment.chambers.location}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteAppointment(appointment.appointment_id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {appointments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No appointments found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
