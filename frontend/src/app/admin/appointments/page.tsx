'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'

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
    const result = await Swal.fire({
      title: 'Delete appointment?',
      text: "This action can't be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    })

    if (!result.isConfirmed) return

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
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true
        })
      } else {
        setError('Failed to delete appointment')
        Swal.fire({
          icon: 'error',
          title: 'Failed to delete',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true
        })
      }
    } catch (error) {
      setError('Error deleting appointment')
      Swal.fire({
        icon: 'error',
        title: 'Error deleting',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      })
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="text-muted-foreground hover:text-foreground p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-bold text-foreground">Manage Appointments</h1>
                <p className="text-xs text-muted-foreground">View and manage appointment schedules</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center space-x-2 shadow-[0_0_20px_-6px_rgba(55,105,163,0.4)]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add New Appointment</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-5 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          {error && (
            <div className="bg-destructive/15 border border-destructive/35 text-red-200 px-3 py-2 rounded-lg mb-4 text-sm flex justify-between items-start gap-2">
              <span>{error}</span>
              <button type="button" onClick={() => setError('')} className="text-red-200 hover:text-white shrink-0">
                ×
              </button>
            </div>
          )}

          {editingAppointment && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border border-border w-full max-w-md rounded-xl bg-popover shadow-[0_0_48px_-12px_rgba(55,105,163,0.25)]">
                <h3 className="text-base font-bold text-foreground mb-3">Edit Appointment</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Date</label>
                    <input
                      type="date"
                      value={editForm.appointment_date}
                      onChange={(e) => setEditForm({...editForm, appointment_date: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 [color-scheme:dark]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Start Time</label>
                    <input
                      type="time"
                      value={editForm.start_time}
                      onChange={(e) => setEditForm({...editForm, start_time: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 [color-scheme:dark]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">End Time</label>
                    <input
                      type="time"
                      value={editForm.end_time}
                      onChange={(e) => setEditForm({...editForm, end_time: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-zinc-100 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 [color-scheme:dark]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      className="mt-1 block w-full cursor-pointer px-3 py-2 text-sm text-zinc-100 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 [color-scheme:dark]"
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

                <div className="flex justify-end space-x-2 mt-5">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-3 py-1.5 bg-secondary text-foreground rounded-lg border border-border hover:bg-secondary/80 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm shadow-[0_0_20px_-6px_rgba(55,105,163,0.4)]"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="glass-panel overflow-hidden rounded-xl">
            <ul className="divide-y divide-border">
              {appointments.map((appointment) => (
                <li key={appointment.appointment_id}>
                  <div className="px-4 py-3 sm:px-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-medium text-foreground">
                            Appointment #{appointment.appointment_id}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              appointment.status === 'scheduled'
                                ? 'bg-primary/20 text-primary-bright border border-primary-bright/40'
                                : appointment.status === 'completed'
                                  ? 'bg-primary/20 text-primary-bright border border-primary-bright/40'
                                  : appointment.status === 'cancelled'
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                    : 'bg-secondary text-muted-foreground border border-border'
                            }`}
                          >
                            {appointment.status}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              appointment.payment_done
                                ? 'bg-primary/20 text-primary-bright border border-primary-bright/40'
                                : 'bg-primary/10 text-primary-bright border border-primary-bright/35'
                            }`}
                          >
                            {appointment.payment_done ? 'Paid' : 'Pending'}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {appointment.appointment_date} • {appointment.start_time} - {appointment.end_time}
                        </p>

                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                          {appointment.patients && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Patient</p>
                              <p className="text-xs text-foreground">{appointment.patients.name}</p>
                              <p className="text-xs text-muted-foreground">{appointment.patients.email}</p>
                              {appointment.patients.phone && (
                                <p className="text-xs text-muted-foreground">{appointment.patients.phone}</p>
                              )}
                            </div>
                          )}

                          {appointment.doctors && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Doctor</p>
                              <p className="text-xs text-foreground">{appointment.doctors.doctor_name}</p>
                              <p className="text-xs text-muted-foreground">{appointment.doctors.speciality}</p>
                            </div>
                          )}

                          {appointment.chambers && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Chamber</p>
                              <p className="text-xs text-foreground">{appointment.chambers.chamber_name}</p>
                              <p className="text-xs text-muted-foreground">{appointment.chambers.location}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(appointment)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-lg text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAppointment(appointment.appointment_id)}
                          className="bg-destructive hover:bg-destructive/90 text-white px-2.5 py-1 rounded-lg text-xs"
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
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">No appointments found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
