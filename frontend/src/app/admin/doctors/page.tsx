'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import '@/styles/admin-theme.css'
import Swal from 'sweetalert2'
import Pagination from '../../../components/ui/Pagination'

interface Doctor {
  doctor_id: number
  doctor_name: string
  email: string
  speciality: string
  experience?: number | null
  chamber_id?: number | null
  chambers?: {
    chamber_id: number
    chamber_name: string
    location: string
  } | null
  chamber?: string | null
  location?: string | null
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [chambers, setChambers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10
  const [editForm, setEditForm] = useState({
    doctor_name: '',
    email: '',
    speciality: '',
    experience: '',
    chamber_id: '',
    chamber: '',
    location: ''
  })
  const router = useRouter()

  // Toast helper function
  const showToast = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info') => {
    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })
    
    toast.fire({
      icon,
      title,
      text
    })
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')

    if (!token || userRole !== 'admin') {
      router.push('/admin/login')
      return
    }

    fetchDoctors()
    fetchChambers()
  }, [router])

  const fetchChambers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/admin/chambers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const chambersData = data.data || data
        setChambers(chambersData)
      }
    } catch (error) {
      console.error('Error fetching chambers:', error)
    }
  }

  const fetchDoctors = async (page: number = currentPage) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const specialtyParam = selectedSpeciality !== 'all' ? `&specialty=${encodeURIComponent(selectedSpeciality)}` : ''
      const response = await fetch(`http://localhost:5000/api/admin/doctors?page=${page}&limit=${itemsPerPage}${specialtyParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const processedData = data.data?.map((doctor: any) => ({
          ...doctor,
          doctor_id: doctor.doctor_id || doctor.id // Use doctor_id if present, otherwise use id
        })) || data.map((doctor: any) => ({
          ...doctor,
          doctor_id: doctor.doctor_id || doctor.id
        }))
        console.log('Fetched doctors:', processedData) // Debug log
        setDoctors(processedData)
        
        // Set pagination info if available
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages)
          setTotalItems(data.pagination.totalItems)
          setCurrentPage(data.pagination.currentPage)
        } else {
          // Fallback for non-paginated response
          setTotalPages(1)
          setTotalItems(processedData.length)
          setCurrentPage(1)
        }
        
        showToast('Success', 'Doctors loaded successfully', 'success')
      } else {
        setError('Failed to fetch doctors')
        showToast('Error', 'Failed to fetch doctors', 'error')
      }
    } catch (error) {
      setError('Error fetching doctors')
      showToast('Error', 'Error fetching doctors', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchDoctors(page)
  }

  // Reset to page 1 when specialty changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
    fetchDoctors(1)
  }, [selectedSpeciality])

  // Get unique specialities from doctors data
  const getUniqueSpecialities = () => {
    const specialities = [...new Set(doctors.map(doctor => doctor.speciality).filter(Boolean))]
    return specialities.sort()
  }

  // Group doctors by speciality (only for 'all' view)
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
      // For filtered view, return all doctors under the selected specialty
      return {
        [selectedSpeciality]: doctors
      }
    }
  }

  const deleteDoctor = async (doctorId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) return

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
        showToast('Deleted!', 'Doctor has been deleted.', 'success')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete doctor')
        showToast('Error', errorData.error || 'Failed to delete doctor', 'error')
      }
    } catch (error) {
      setError('Error deleting doctor')
      showToast('Error', 'Error deleting doctor', 'error')
    }
  }

  const startEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setEditForm({
      doctor_name: doctor.doctor_name || '',
      email: doctor.email || '',
      speciality: doctor.speciality || '',
      experience: doctor.experience?.toString() || '',
      chamber_id: doctor.chamber_id?.toString() || doctor.chambers?.chamber_id?.toString() || '',
      chamber: doctor.chambers?.chamber_name || doctor.chamber || '',
      location: doctor.chambers?.location || doctor.location || ''
    })
  }

  const cancelEdit = () => {
    setEditingDoctor(null)
    setEditForm({
      doctor_name: '',
      email: '',
      speciality: '',
      experience: '',
      chamber_id: '',
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
        showToast('Success', 'Doctor information updated successfully', 'success')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update doctor')
        showToast('Error', errorData.error || 'Failed to update doctor', 'error')
      }
    } catch (error) {
      setError('Error updating doctor')
      showToast('Error', 'Error updating doctor', 'error')
    }
  }

  if (loading) {
    return (
      <div className="admin-dashboard-body min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          {/* Animated Loading Icon */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-admin-border/30 border-t-admin-accent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-admin-blue3 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          
          {/* Loading Text with Animation */}
          <div className="space-y-2">
            <div className="text-xl font-semibold text-admin-text animate-pulse">
              Loading Doctors...
            </div>
            <div className="text-sm text-admin-muted animate-pulse" style={{ animationDelay: '0.5s' }}>
              Please wait while we fetch the data
            </div>
          </div>
          
          {/* Animated Dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-admin-accent rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-admin-blue3 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-admin-blue4 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
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
                onClick={() => showToast('Info', 'Add doctor functionality coming soon!', 'info')}
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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-4 border border-gray-700 w-full max-w-md rounded-2xl bg-gray-900 shadow-[0_0_48px_-12px_rgba(0,180,255,0.25)]">
                <h3 className="text-xl font-bold text-white mb-3">Edit Doctor</h3>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={editForm.doctor_name}
                      onChange={(e) => setEditForm({...editForm, doctor_name: e.target.value})}
                      className="block w-full px-3 py-2 text-sm text-white bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="block w-full px-3 py-2 text-sm text-white bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Speciality</label>
                    <input
                      type="text"
                      value={editForm.speciality}
                      onChange={(e) => setEditForm({...editForm, speciality: e.target.value})}
                      className="block w-full px-3 py-2 text-sm text-white bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Experience (years)</label>
                    <input
                      type="number"
                      value={editForm.experience}
                      onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                      className="block w-full px-3 py-2 text-sm text-white bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Chamber</label>
                    <select
                      value={editForm.chamber_id}
                      onChange={(e) => {
                        const selectedChamber = chambers.find(c => c.chamber_id.toString() === e.target.value)
                        setEditForm({
                          ...editForm, 
                          chamber_id: e.target.value,
                          chamber: selectedChamber?.chamber_name || '',
                          location: selectedChamber?.location || ''
                        })
                      }}
                      className="block w-full px-3 py-2 text-sm text-white bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a chamber</option>
                      {chambers.map((chamber) => (
                        <option key={chamber.chamber_id} value={chamber.chamber_id}>
                          {chamber.chamber_name} - {chamber.location}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className="block w-full px-3 py-2 text-sm text-white bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-1 bg-transparent text-white border border-gray-500 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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
            <div>
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
                              {doctor.chambers ? (
                                <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <span>{doctor.chambers.chamber_name}</span>
                                </span>
                              ) : doctor.chamber ? (
                                <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <span>{doctor.chamber}</span>
                                </span>
                              ) : null}
                              {doctor.chambers?.location || doctor.location ? (
                                <span className="text-xs text-muted-foreground flex items-center space-x-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{doctor.chambers?.location || doctor.location}</span>
                                </span>
                              ) : null}
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
                            className="px-4 py-2 bg-gray-900 text-red-500 rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium flex items-center space-x-1 border border-red-500/20"
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

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
        />
      </main>
    </div>
  )
}
