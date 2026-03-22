'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Chamber {
  chamber_id: number
  chamber_name: string
  location: string
  district?: string
  doctor_id?: number
}

export default function AdminChambersPage() {
  const [chambers, setChambers] = useState<Chamber[]>([])
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
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
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
