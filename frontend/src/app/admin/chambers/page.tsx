'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Chamber {
  chamber_id: number
  chamber_name: string
  location: string
  district?: string | null
  doctor_id?: number | null
}

export default function AdminChambersPage() {
  const [chambers, setChambers] = useState<Chamber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingChamber, setEditingChamber] = useState<Chamber | null>(null)
  const [editForm, setEditForm] = useState({
    chamber_name: '',
    location: '',
    district: '',
    doctor_id: ''
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')

    if (!token || userRole !== 'admin') {
      router.push('/admin/login')
      return
    }

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
        setChambers(data)
      } else {
        setError('Failed to fetch chambers')
      }
    } catch (error) {
      setError('Error fetching chambers')
    } finally {
      setLoading(false)
    }
  }

  const deleteChamber = async (chamberId: number) => {
    if (!confirm('Are you sure you want to delete this chamber? This might affect doctors assigned to it.')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/chambers/${chamberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setChambers(chambers.filter(c => c.chamber_id !== chamberId))
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete chamber')
      }
    } catch (error) {
      setError('Error deleting chamber')
    }
  }

  const startEdit = (chamber: Chamber) => {
    setEditingChamber(chamber)
    setEditForm({
      chamber_name: chamber.chamber_name || '',
      location: chamber.location || '',
      district: chamber.district || '',
      doctor_id: chamber.doctor_id?.toString() || ''
    })
  }

  const cancelEdit = () => {
    setEditingChamber(null)
    setEditForm({
      chamber_name: '',
      location: '',
      district: '',
      doctor_id: ''
    })
  }

  const saveEdit = async () => {
    if (!editingChamber) return

    try {
      const token = localStorage.getItem('token')
      const updateData = {
        name: editForm.chamber_name,
        address: editForm.location,
        district: editForm.district || null,
        doctor_id: editForm.doctor_id ? parseInt(editForm.doctor_id) : null
      }

      const response = await fetch(`http://localhost:5000/api/admin/chambers/${editingChamber.chamber_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        setChambers(chambers.map(c => 
          c.chamber_id === editingChamber.chamber_id 
            ? { ...c, chamber_name: updateData.name, location: updateData.address, district: updateData.district, doctor_id: updateData.doctor_id }
            : c
        ))
        cancelEdit()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update chamber')
      }
    } catch (error) {
      setError('Error updating chamber')
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
              <h1 className="text-xl font-semibold text-gray-900">Manage Chambers</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Add New Chamber
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
          {editingChamber && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Chamber</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chamber Name</label>
                    <input
                      type="text"
                      value={editForm.chamber_name}
                      onChange={(e) => setEditForm({...editForm, chamber_name: e.target.value})}
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">District</label>
                    <input
                      type="text"
                      value={editForm.district}
                      onChange={(e) => setEditForm({...editForm, district: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Doctor ID</label>
                    <input
                      type="number"
                      value={editForm.doctor_id}
                      onChange={(e) => setEditForm({...editForm, doctor_id: e.target.value})}
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
              {chambers.map((chamber) => (
                <li key={chamber.chamber_id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{chamber.chamber_name}</h3>
                        <p className="mt-1 text-sm text-gray-600">Location: {chamber.location}</p>
                        {chamber.district && <p className="mt-1 text-sm text-gray-600">District: {chamber.district}</p>}
                        {chamber.doctor_id && <p className="mt-1 text-sm text-gray-600">Doctor ID: {chamber.doctor_id}</p>}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => startEdit(chamber)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteChamber(chamber.chamber_id)}
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
            
            {chambers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No chambers found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
