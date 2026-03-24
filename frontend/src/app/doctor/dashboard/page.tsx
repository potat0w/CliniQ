'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome back, Dr. {user?.name || 'User'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 bg-destructive/90 hover:bg-destructive text-white rounded-lg transition-colors text-sm"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="glass-panel rounded-xl p-4 border border-primary/20">
            <h3 className="text-sm font-semibold mb-2 text-primary-bright">Appointments</h3>
            <p className="text-2xl font-bold mb-1 tabular-nums">{stats.upcomingAppointments}</p>
            <p className="text-xs text-muted-foreground">Upcoming appointments</p>
          </div>

          <div className="glass-panel rounded-xl p-4 border border-primary/20">
            <h3 className="text-sm font-semibold mb-2 text-primary-bright">Patients</h3>
            <p className="text-2xl font-bold mb-1 tabular-nums">{stats.totalPatients}</p>
            <p className="text-xs text-muted-foreground">Total patients</p>
          </div>

          <div className="glass-panel rounded-xl p-4 border border-primary/20">
            <h3 className="text-sm font-semibold mb-2 text-primary-bright">Profile</h3>
            <p className="text-xs text-muted-foreground mb-1">Speciality: {user?.specialty || 'Not specified'}</p>
            <p className="text-xs text-muted-foreground">Email: {user?.email || 'Not available'}</p>
          </div>
        </div>

        <div className="mt-6 glass-panel rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">Patient Details</h2>
          {stats.patients && stats.patients.length > 0 ? (
            <div className="space-y-4">
              {stats.patients.map((patient) => (
                <div key={patient.patient_id} className="bg-secondary/50 rounded-lg p-3 border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Patient Name</p>
                      <p className="text-sm text-foreground font-medium">{patient.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                      <p className="text-sm text-foreground">{patient.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                      <p className="text-sm text-foreground">{patient.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Age</p>
                      <p className="text-sm text-foreground">{patient.age || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Gender</p>
                      <p className="text-sm text-foreground">{patient.gender || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Patient ID</p>
                      <p className="text-sm text-foreground font-mono">#{patient.patient_id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6 text-sm">No patients found.</p>
          )}
        </div>

        {/* Upcoming Appointments Section */}
        <div className="mt-6 glass-panel rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">Upcoming Appointments</h2>
          {stats.appointments && stats.appointments.length > 0 ? (
            <div className="space-y-4">
              {stats.appointments.map((appointment) => (
                <div key={appointment.appointment_id} className="bg-secondary/50 rounded-lg p-3 border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Appointment #{appointment.appointment_id}</h3>
                      <p className="text-xs text-muted-foreground">
                        {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'Date not set'} • {appointment.start_time} - {appointment.end_time}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      appointment.status === 'scheduled' ? 'bg-primary/25 text-primary-bright border border-primary-bright/40' :
                      appointment.status === 'rescheduled' ? 'bg-primary/15 text-primary-bright border border-primary-bright/35' :
                      'bg-secondary text-muted-foreground border border-border'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-background/50 rounded-lg p-2.5 border border-border">
                      <p className="text-xs text-muted-foreground mb-0.5">Patient</p>
                      <p className="text-sm text-foreground font-medium">{appointment.patients?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{appointment.patients?.email}</p>
                      <p className="text-xs text-muted-foreground">{appointment.patients?.phone || 'No phone'}</p>
                    </div>

                    <div className="bg-background/50 rounded-lg p-2.5 border border-border">
                      <p className="text-xs text-muted-foreground mb-0.5">Doctor</p>
                      <p className="text-sm text-foreground font-medium">{appointment.doctors?.doctor_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{appointment.doctors?.speciality}</p>
                    </div>

                    <div className="bg-background/50 rounded-lg p-2.5 border border-border">
                      <p className="text-xs text-muted-foreground mb-0.5">Chamber</p>
                      <p className="text-sm text-foreground font-medium">{appointment.chambers?.chamber_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{appointment.chambers?.location}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Booked: {new Date(appointment.booking_time).toLocaleString()}
                    </p>
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                      Payment:
                      {appointment.payment_done ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary-bright shrink-0" aria-hidden />
                          Paid
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-primary-bright shrink-0" aria-hidden />
                          Pending
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6 text-sm">No upcoming appointments found.</p>
          )}
        </div>

        <div className="mt-6 glass-panel rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">No recent activity to display.</p>
        </div>
      </div>
    </div>
  )
}
