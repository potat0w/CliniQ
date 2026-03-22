'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Appointment {
  appointment_id: number
  appointment_date: string | null
  start_time: string | null
  end_time: string | null
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
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [editForm, setEditForm] = useState({
    appointment_date: '',
    start_time: '',
    end_time: '',
    status: '',
    payment_done: false
  })
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

  const startEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setEditForm({
      appointment_date: appointment.appointment_date || '',
      start_time: appointment.start_time || '',
      end_time: appointment.end_time || '',
      status: appointment.status || '',
      payment_done: appointment.payment_done || false
    })
  }

  const cancelEdit = () => {
    setEditingAppointment(null)
    setEditForm({
      appointment_date: '',
      start_time: '',
      end_time: '',
      status: '',
      payment_done: false
    })
  }

  const saveEdit = async () => {
    if (!editingAppointment) return

    try {
      const token = localStorage.getItem('token')
      const updateData = {
        appointment_date: editForm.appointment_date,
        start_time: editForm.start_time,
        end_time: editForm.end_time,
        status: editForm.status,
        payment_done: editForm.payment_done
      }

      const response = await fetch(`http://localhost:5000/api/admin/appointments/${editingAppointment.appointment_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        setAppointments(appointments.map(a => 
          a.appointment_id === editingAppointment.appointment_id 
            ? { ...a, ...updateData }
            : a
        ))
        cancelEdit()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update appointment')
      }
    } catch (error) {
      setError('Error updating appointment')
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
              <button 
                onClick={() => setError('')}
                className="float-right text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          )}

          {/* Edit Form Modal */}
          {editingAppointment && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Appointment</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={editForm.appointment_date}
                      onChange={(e) => setEditForm({...editForm, appointment_date: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                      type="time"
                      value={editForm.start_time}
                      onChange={(e) => setEditForm({...editForm, start_time: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <input
                      type="time"
                      value={editForm.end_time}
                      onChange={(e) => setEditForm({...editForm, end_time: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="rescheduled">Rescheduled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.payment_done}
                        onChange={(e) => setEditForm({...editForm, payment_done: e.target.checked})}
                        className="mr-2"
                      />
                      Payment Done
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
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
                        <button 
                          onClick={() => startEdit(appointment)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
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
