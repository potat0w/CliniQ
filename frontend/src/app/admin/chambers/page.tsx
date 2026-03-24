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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="text-primary-bright hover:text-sky-300 mr-3 text-sm"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-lg font-semibold text-foreground">Manage Chambers</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium shadow-[0_0_20px_-6px_rgba(55,105,163,0.4)]"
              >
                Add New Chamber
              </button>
            </div>
          </div>
        </div>
      </nav>

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

          {editingChamber && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border border-border w-full max-w-md rounded-xl bg-popover shadow-[0_0_48px_-12px_rgba(55,105,163,0.25)]">
                <h3 className="text-base font-bold text-foreground mb-3">Edit Chamber</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Chamber Name</label>
                    <input
                      type="text"
                      value={editForm.chamber_name}
                      onChange={(e) => setEditForm({...editForm, chamber_name: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-foreground bg-secondary/80 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-foreground bg-secondary/80 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">District</label>
                    <input
                      type="text"
                      value={editForm.district}
                      onChange={(e) => setEditForm({...editForm, district: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-foreground bg-secondary/80 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Doctor ID</label>
                    <input
                      type="number"
                      value={editForm.doctor_id}
                      onChange={(e) => setEditForm({...editForm, doctor_id: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-foreground bg-secondary/80 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
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
              {chambers.map((chamber) => (
                <li key={chamber.chamber_id}>
                  <div className="px-4 py-3 sm:px-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground">{chamber.chamber_name}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">Location: {chamber.location}</p>
                        {chamber.district && <p className="mt-0.5 text-xs text-muted-foreground">District: {chamber.district}</p>}
                        {chamber.doctor_id && <p className="mt-0.5 text-xs text-muted-foreground">Doctor ID: {chamber.doctor_id}</p>}
                      </div>
                      <div className="flex space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(chamber)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-lg text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteChamber(chamber.chamber_id)}
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

            {chambers.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">No chambers found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
