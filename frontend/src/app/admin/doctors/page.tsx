'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
        setDoctors(data)
      } else {
        setError('Failed to fetch doctors')
      }
    } catch (error) {
      setError('Error fetching doctors')
    } finally {
      setLoading(false)
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
        setError('Failed to delete doctor')
      }
    } catch (error) {
      setError('Error deleting doctor')
    }
  }

  const startEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setEditForm({
      doctor_name: doctor.doctor_name,
      email: doctor.email,
      speciality: doctor.speciality,
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
        name: editForm.doctor_name,
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
            ? { ...d, ...updateData, doctor_name: updateData.name }
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
              <h1 className="text-xl font-semibold text-gray-900">Manage Doctors</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Add New Doctor
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
          {editingDoctor && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Doctor</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={editForm.doctor_name}
                      onChange={(e) => setEditForm({...editForm, doctor_name: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Speciality</label>
                    <input
                      type="text"
                      value={editForm.speciality}
                      onChange={(e) => setEditForm({...editForm, speciality: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
                    <input
                      type="number"
                      value={editForm.experience}
                      onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chamber</label>
                    <input
                      type="text"
                      value={editForm.chamber}
                      onChange={(e) => setEditForm({...editForm, chamber: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
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
              {doctors.map((doctor) => (
                <li key={doctor.doctor_id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{doctor.doctor_name}</h3>
                        <p className="mt-1 text-sm text-gray-600">Email: {doctor.email}</p>
                        <p className="mt-1 text-sm text-gray-600">Speciality: {doctor.speciality}</p>
                        {doctor.experience && <p className="mt-1 text-sm text-gray-600">Experience: {doctor.experience} years</p>}
                        {doctor.chamber && <p className="mt-1 text-sm text-gray-600">Chamber: {doctor.chamber}</p>}
                        {doctor.location && <p className="mt-1 text-sm text-gray-600">Location: {doctor.location}</p>}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => startEdit(doctor)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteDoctor(doctor.doctor_id)}
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
            
            {doctors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No doctors found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
