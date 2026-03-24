'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import '@/styles/admin-theme.css'

interface Doctor {
  doctor_id: number
  doctor_name: string
  email: string
  speciality: string
  experience?: number | null
  chamber?: string | null
  location?: string | null
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>('all')
  const [editForm, setEditForm] = useState({
    doctor_name: '',
    email: '',
    speciality: '',
    experience: '',
    chamber: '',
    location: ''
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')

    if (!token || userRole !== 'admin') {
      router.push('/admin/login')
      return
    }

    fetchDoctors()
  }, [router])

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/admin/doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const processedData = data.map((doctor: any) => ({
          ...doctor,
          doctor_id: doctor.doctor_id || doctor.id // Use doctor_id if present, otherwise use id
        }))
        console.log('Fetched doctors:', processedData) // Debug log
        setDoctors(processedData)
      } else {
        setError('Failed to fetch doctors')
      }
    } catch (error) {
      setError('Error fetching doctors')
    } finally {
      setLoading(false)
    }
  }

  // Get unique specialities from doctors data
  const getUniqueSpecialities = () => {
    const specialities = [...new Set(doctors.map(doctor => doctor.speciality).filter(Boolean))]
    return specialities.sort()
  }

  // Group doctors by speciality
  const getDoctorsBySpeciality = () => {
    if (selectedSpeciality === 'all') {
      const grouped: { [key: string]: Doctor[] } = {}
      doctors.forEach(doctor => {
        const speciality = doctor.speciality || 'Other'
        if (!grouped[speciality]) {
          grouped[speciality] = []
        }
        grouped[speciality].push(doctor)
      })
      return grouped
    } else {
      return {
        [selectedSpeciality]: doctors.filter(doctor => doctor.speciality === selectedSpeciality)
      }
    }
  }

  const deleteDoctor = async (doctorId: number) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/doctors/${doctorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setDoctors(doctors.filter(d => d.doctor_id !== doctorId))
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete doctor')
      }
    } catch (error) {
      setError('Error deleting doctor')
    }
  }

  const startEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setEditForm({
      doctor_name: doctor.doctor_name || '',
      email: doctor.email || '',
      speciality: doctor.speciality || '',
      experience: doctor.experience?.toString() || '',
      chamber: doctor.chamber || '',
      location: doctor.location || ''
    })
  }

  const cancelEdit = () => {
    setEditingDoctor(null)
    setEditForm({
      doctor_name: '',
      email: '',
      speciality: '',
      experience: '',
      chamber: '',
      location: ''
    })
  }

  const saveEdit = async () => {
    if (!editingDoctor) return

    try {
      const token = localStorage.getItem('token')
      const updateData = {
        doctor_name: editForm.doctor_name,
        email: editForm.email,
        speciality: editForm.speciality,
        experience: editForm.experience ? parseInt(editForm.experience) : null,
        chamber: editForm.chamber || null,
        location: editForm.location || null
      }

      const response = await fetch(`http://localhost:5000/api/admin/doctors/${editingDoctor.doctor_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        setDoctors(doctors.map(d => 
          d.doctor_id === editingDoctor.doctor_id 
            ? { ...d, ...updateData, doctor_name: updateData.doctor_name }
            : d
        ))
        cancelEdit()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update doctor')
      }
    } catch (error) {
      setError('Error updating doctor')
    }
  }

  if (loading) {
    return (
      <div className="admin-dashboard-body">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg text-admin-text">Loading...</div>
        </div>
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
                <h1 className="text-lg font-bold text-foreground">Manage Doctors</h1>
                <p className="text-xs text-muted-foreground">View and manage doctor profiles</p>
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
                <span>Add New Doctor</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Minimal Dropdown Filter */}
        <div className="flex justify-end mb-6">
          <select
            value={selectedSpeciality}
            onChange={(e) => setSelectedSpeciality(e.target.value)}
            className="bg-secondary border border-border text-foreground px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Specialities</option>
            {getUniqueSpecialities().map(speciality => (
              <option key={speciality} value={speciality}>
                {speciality}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm flex justify-between items-start gap-2">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} className="text-red-200 hover:text-white shrink-0">
              ×
            </button>
          </div>
        )}

          {editingDoctor && (
            <div className="fixed inset-0 bg-admin-bg/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-6 border border-admin-border w-full max-w-md rounded-xl bg-admin-card shadow-[0_0_48px_-12px_rgba(0,180,255,0.25)]">
                <h3 className="text-base font-bold text-admin-text mb-4">Edit Doctor</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-admin-blue3 mb-1">Name</label>
                    <input
                      type="text"
                      value={editForm.doctor_name}
                      onChange={(e) => setEditForm({...editForm, doctor_name: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-admin-text bg-admin-card2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-blue3/40"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-admin-blue3 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-admin-text bg-admin-card2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-blue3/40"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-admin-blue3 mb-1">Speciality</label>
                    <input
                      type="text"
                      value={editForm.speciality}
                      onChange={(e) => setEditForm({...editForm, speciality: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-admin-text bg-admin-card2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-blue3/40"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-admin-blue3 mb-1">Experience (years)</label>
                    <input
                      type="number"
                      value={editForm.experience}
                      onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-admin-text bg-admin-card2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-blue3/40"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-admin-blue3 mb-1">Chamber</label>
                    <input
                      type="text"
                      value={editForm.chamber}
                      onChange={(e) => setEditForm({...editForm, chamber: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-admin-text bg-admin-card2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-blue3/40"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-admin-blue3 mb-1">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-admin-text bg-admin-card2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-blue3/40"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-3 py-1.5 bg-admin-card text-admin-text rounded-lg border border-admin-border hover:bg-admin-card2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="admin-btn-logout text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Doctors Table */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-base font-semibold text-foreground">Doctor Records</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Manage all doctor profiles and information</p>
          </div>

          {doctors.length === 0 ? (
            <div className="text-center py-10">
              <svg className="w-10 h-10 text-muted-foreground mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-muted-foreground text-sm font-medium">No doctors found</p>
              <p className="text-muted-foreground/70 text-xs mt-1">Get started by adding your first doctor</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {Object.entries(getDoctorsBySpeciality()).map(([speciality, doctorsInGroup]) => (
                <div key={speciality}>
                  {selectedSpeciality !== 'all' && (
                    <div className="px-4 py-2 bg-secondary/20">
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {speciality}
                      </h3>
                    </div>
                  )}
                  {doctorsInGroup.map((doctor) => (
                    <div key={doctor.doctor_id} className="p-4 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/15 rounded-full flex items-center justify-center border border-primary/25">
                            <span className="text-sm font-medium text-primary-bright">
                              {doctor.doctor_name?.charAt(0)?.toUpperCase() || 'D'}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-foreground">{doctor.doctor_name}</h3>
                            <p className="text-xs text-muted-foreground">{doctor.email}</p>
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5">
                              <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                                <span>{doctor.speciality}</span>
                              </span>
                              {doctor.experience && (
                                <span className="text-sm text-gray-500 flex items-center space-x-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>{doctor.experience} years</span>
                                </span>
                              )}
                              {doctor.chamber && (
                                <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <span>{doctor.chamber}</span>
                                </span>
                              )}
                              {doctor.location && (
                                <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{doctor.location}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => startEdit(doctor)}
                            className="px-2.5 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs font-medium flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteDoctor(doctor.doctor_id)}
                            className="px-2.5 py-1.5 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors text-xs font-medium flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
