'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import Pagination from '../../../components/ui/Pagination'

interface Chamber {
  chamber_id: number
  chamber_name: string
  location: string
  doctor_id?: number | null
  specialties?: string[] | string | null
}

export default function AdminChambersPage() {
  const [chambers, setChambers] = useState<Chamber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingChamber, setEditingChamber] = useState<Chamber | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10
  const [editForm, setEditForm] = useState({
    chamber_name: '',
    location: '',
    doctor_id: '',
    specialties: [] as string[]
  })
  const [createForm, setCreateForm] = useState({
    chamber_name: '',
    location: '',
    doctor_id: '',
    specialties: [] as string[]
  })
  const [openSpecialties, setOpenSpecialties] = useState<Record<number, boolean>>({})
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

  const fetchChambers = async (page: number = currentPage) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/chambers?page=${page}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const processedData = data.data?.map((chamber: any) => {
          let specialties: string[] = []
          if (chamber.specialties) {
            if (Array.isArray(chamber.specialties)) {
              specialties = chamber.specialties
            } else if (typeof chamber.specialties === 'string') {
              try {
                specialties = JSON.parse(chamber.specialties.replace(/'/g, '"'))
              } catch {
                specialties = chamber.specialties.split(',').map((s: string) => s.trim()).filter((s: string) => s)
              }
            }
          }
          return {
            ...chamber,
            specialties
          }
        }) || data.map((chamber: any) => {
          let specialties: string[] = []
          if (chamber.specialties) {
            if (Array.isArray(chamber.specialties)) {
              specialties = chamber.specialties
            } else if (typeof chamber.specialties === 'string') {
              try {
                specialties = JSON.parse(chamber.specialties.replace(/'/g, '"'))
              } catch {
                specialties = chamber.specialties.split(',').map((s: string) => s.trim()).filter((s: string) => s)
              }
            }
          }
          return {
            ...chamber,
            specialties
          }
        })
        setChambers(processedData)
        
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
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(`Failed to fetch chambers (${response.status}): ${errorData.error || 'Authentication required'}`)
      }
    } catch (error) {
      console.error('Chambers fetch error:', error)
      setError('Error fetching chambers: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchChambers(page)
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
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Chamber has been deleted successfully.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete chamber')
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: errorData.error || 'Failed to delete chamber',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        })
      }
    } catch (error) {
      setError('Error deleting chamber')
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Error deleting chamber',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    }
  }

  const startEdit = (chamber: Chamber) => {
    setEditingChamber(chamber)
    let specialties: string[] = []
    if (chamber.specialties) {
      if (Array.isArray(chamber.specialties)) {
        specialties = chamber.specialties
      } else if (typeof chamber.specialties === 'string') {
        try {
          specialties = JSON.parse(chamber.specialties.replace(/'/g, '"'))
        } catch {
          specialties = chamber.specialties.split(',').map((s: string) => s.trim()).filter((s: string) => s)
        }
      }
    }
    setEditForm({
      chamber_name: chamber.chamber_name || '',
      location: chamber.location || '',
      doctor_id: chamber.doctor_id?.toString() || '',
      specialties: specialties
    })
  }

  const cancelEdit = () => {
    setEditingChamber(null)
    setEditForm({
      chamber_name: '',
      location: '',
      doctor_id: '',
      specialties: [] as string[]
    })
  }

  const createChamber = async () => {
    try {
      const token = localStorage.getItem('token')
      const createData = {
        chamber_name: createForm.chamber_name,
        location: createForm.location,
        doctor_id: createForm.doctor_id ? parseInt(createForm.doctor_id) : null,
        specialties: createForm.specialties
      }

      const response = await fetch('http://localhost:5000/api/admin/chambers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createData)
      })

      if (response.ok) {
        const newChamber = await response.json()
        setShowCreateForm(false)
        setCreateForm({
          chamber_name: '',
          location: '',
          doctor_id: '',
          specialties: [] as string[]
        })
        fetchChambers(currentPage) // Refresh current page
        Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Chamber has been created successfully.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create chamber')
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: errorData.error || 'Failed to create chamber',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        })
      }
    } catch (error) {
      setError('Error creating chamber')
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Error creating chamber',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    }
  }

  const saveEdit = async () => {
    if (!editingChamber) return

    try {
      const token = localStorage.getItem('token')
      const updateData = {
        chamber_name: editForm.chamber_name,
        location: editForm.location,
        doctor_id: editForm.doctor_id ? parseInt(editForm.doctor_id) : null,
        specialties: editForm.specialties
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
            ? { ...c, chamber_name: updateData.chamber_name, location: updateData.location, doctor_id: updateData.doctor_id, specialties: updateData.specialties }
            : c
        ))
        cancelEdit()
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Chamber has been updated successfully.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update chamber')
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: errorData.error || 'Failed to update chamber',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        })
      }
    } catch (error) {
      setError('Error updating chamber')
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Error updating chamber',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const totalChambers = totalItems || chambers.length
  const uniqueLocations = new Set(chambers.map((c) => c.location).filter(Boolean)).size
  const totalSpecialties = chambers.reduce((acc, c) => acc + (c.specialties?.length || 0), 0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 gap-4">
            <div className="flex items-center space-x-4 min-w-0">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="text-muted-foreground hover:text-foreground p-2 hover:bg-secondary rounded-lg transition-colors shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-foreground truncate">Manage Chambers</h1>
                <p className="text-xs text-muted-foreground truncate">View and manage medical chambers</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center space-x-2 shadow-[0_0_20px_-6px_rgba(55,105,163,0.4)] shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add New Chamber</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-destructive/15 border border-destructive/35 text-red-200 px-3 py-2 rounded-lg mb-4 text-sm flex justify-between items-start gap-2">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} className="text-red-200 hover:text-white shrink-0">
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="glass-panel rounded-xl px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1.5">Total Chambers</p>
            <p className="text-2xl font-medium text-foreground">{totalChambers}</p>
          </div>
          <div className="glass-panel rounded-xl px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1.5">Unique Locations</p>
            <p className="text-2xl font-medium text-foreground">{uniqueLocations}</p>
          </div>
          <div className="glass-panel rounded-xl px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1.5">Total Specialties</p>
            <p className="text-2xl font-medium text-foreground">{totalSpecialties}</p>
          </div>
        </div>

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
                    <label className="block text-xs font-medium text-muted-foreground">Doctor ID</label>
                    <input
                      type="number"
                      value={editForm.doctor_id}
                      onChange={(e) => setEditForm({...editForm, doctor_id: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-foreground bg-secondary/80 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Specialties (comma-separated)</label>
                    <input
                      type="text"
                      value={editForm.specialties.join(', ')}
                      onChange={(e) => setEditForm({...editForm, specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                      placeholder="Cardiac Ablation, Cardiac Medicine, etc."
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

          {showCreateForm && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border border-border w-full max-w-md rounded-xl bg-popover shadow-[0_0_48px_-12px_rgba(55,105,163,0.25)]">
                <h3 className="text-base font-bold text-foreground mb-3">Create New Chamber</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Chamber Name</label>
                    <input
                      type="text"
                      value={createForm.chamber_name}
                      onChange={(e) => setCreateForm({...createForm, chamber_name: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-foreground bg-secondary/80 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Location</label>
                    <input
                      type="text"
                      value={createForm.location}
                      onChange={(e) => setCreateForm({...createForm, location: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-foreground bg-secondary/80 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Doctor ID</label>
                    <input
                      type="number"
                      value={createForm.doctor_id}
                      onChange={(e) => setCreateForm({...createForm, doctor_id: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 text-sm text-foreground bg-secondary/80 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground">Specialties (comma-separated)</label>
                    <input
                      type="text"
                      value={createForm.specialties.join(', ')}
                      onChange={(e) => setCreateForm({...createForm, specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                      placeholder="Cardiac Ablation, Cardiac Medicine, etc."
                      className="mt-1 block w-full px-3 py-2 text-sm text-foreground bg-secondary/80 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setCreateForm({
                        chamber_name: '',
                        location: '',
                        doctor_id: '',
                        specialties: [] as string[]
                      })
                    }}
                    className="px-3 py-1.5 bg-secondary text-foreground rounded-lg border border-border hover:bg-secondary/80 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={createChamber}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm shadow-[0_0_20px_-6px_rgba(55,105,163,0.4)]"
                  >
                    Create Chamber
                  </button>
                </div>
              </div>
            </div>
          )}

        <div className="flex flex-col gap-3">
          {chambers.map((chamber) => {
            const open = !!openSpecialties[chamber.chamber_id]
            const specialtyCount = chamber.specialties?.length || 0

            return (
              <div
                key={chamber.chamber_id}
                className={[
                  'glass-panel rounded-2xl overflow-hidden transition-colors duration-150',
                  open ? 'border-primary/35' : 'hover:border-primary/25'
                ].join(' ')}
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-primary-bright">
                      <rect x="3" y="4" width="14" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M10 7v6M7 10h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-1.5 truncate">
                      {chamber.chamber_name}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 opacity-60">
                          <path
                            d="M8 2C5.79 2 4 3.79 4 6c0 3.25 4 8 4 8s4-4.75 4-8c0-2.21-1.79-4-4-4z"
                            stroke="currentColor"
                            strokeWidth="1.3"
                          />
                          <circle cx="8" cy="6" r="1.4" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                        {chamber.location}
                      </span>
                      {chamber.doctor_id ? (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 opacity-60">
                            <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                            <path
                              d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                          </svg>
                          Doctor ID: {chamber.doctor_id}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenSpecialties((prev) => ({
                          ...prev,
                          [chamber.chamber_id]: !prev[chamber.chamber_id]
                        }))
                      }
                      className={[
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
                        open
                          ? 'border-primary/40 text-primary-bright bg-primary/10'
                          : 'border-border text-muted-foreground bg-secondary/60 hover:border-primary/25'
                      ].join(' ')}
                      disabled={specialtyCount === 0}
                    >
                      {specialtyCount} specialties
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className={[
                          'w-3 h-3 transition-transform duration-200',
                          open ? 'rotate-180' : ''
                        ].join(' ')}
                      >
                        <path
                          d="M4 6l4 4 4-4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => startEdit(chamber)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-foreground border border-border hover:bg-secondary/60 transition-colors"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteChamber(chamber.chamber_id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {open && Array.isArray(chamber.specialties) && chamber.specialties.length > 0 && (
                  <div className="border-t border-border/70">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                      {chamber.specialties.map((s, i) => (
                        <div
                          key={`${chamber.chamber_id}-${i}`}
                          className="flex items-center gap-2.5 px-5 py-2.5 text-xs text-muted-foreground border-b border-r border-border/70"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-bright opacity-50 shrink-0" />
                          <span className="truncate">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {chambers.length === 0 && (
            <div className="text-center py-10 glass-panel rounded-2xl">
              <p className="text-sm text-muted-foreground">No chambers found.</p>
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
