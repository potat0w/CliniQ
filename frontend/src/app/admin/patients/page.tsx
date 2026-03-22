'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Patient {
  patient_id: number
  name: string
  email: string
  phone?: string | null
  age?: number | null
  gender?: string | null
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: ''
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')

    if (!token || userRole !== 'admin') {
      router.push('/admin/login')
      return
    }

    fetchPatients()
  }, [router])

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/admin/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      } else {
        setError('Failed to fetch patients')
      }
    } catch (error) {
      setError('Error fetching patients')
    } finally {
      setLoading(false)
    }
  }

  const deletePatient = async (patientId: number) => {
    if (!confirm('Are you sure you want to delete this patient?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/patients/${patientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setPatients(patients.filter(p => p.patient_id !== patientId))
      } else {
        setError('Failed to delete patient')
      }
    } catch (error) {
      setError('Error deleting patient')
    }
  }

  const startEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setEditForm({
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      age: patient.age?.toString() || '',
      gender: patient.gender || ''
    })
  }

  const cancelEdit = () => {
    setEditingPatient(null)
    setEditForm({
      name: '',
      email: '',
      phone: '',
      age: '',
      gender: ''
    })
  }

  const saveEdit = async () => {
    if (!editingPatient) return

    try {
      const token = localStorage.getItem('token')
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || null,
        age: editForm.age ? parseInt(editForm.age) : null,
        gender: editForm.gender || null
      }

      const response = await fetch(`http://localhost:5000/api/admin/patients/${editingPatient.patient_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const updatedPatient = await response.json()
        setPatients(patients.map(p => 
          p.patient_id === editingPatient.patient_id 
            ? { ...p, ...updateData }
            : p
        ))
        cancelEdit()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update patient')
      }
    } catch (error) {
      setError('Error updating patient')
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
              <h1 className="text-xl font-semibold text-gray-900">Manage Patients</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Add New Patient
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
          {editingPatient && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Patient</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
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
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
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
              {patients.map((patient) => (
                <li key={patient.patient_id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
                        <p className="mt-1 text-sm text-gray-600">Email: {patient.email}</p>
                        {patient.phone && <p className="mt-1 text-sm text-gray-600">Phone: {patient.phone}</p>}
                        {patient.age && <p className="mt-1 text-sm text-gray-600">Age: {patient.age}</p>}
                        {patient.gender && <p className="mt-1 text-sm text-gray-600">Gender: {patient.gender}</p>}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => startEdit(patient)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deletePatient(patient.patient_id)}
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
            
            {patients.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No patients found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
