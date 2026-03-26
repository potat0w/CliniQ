'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, Search, Filter } from 'lucide-react'
import { EditPatientModal } from '@/components/admin/patients/EditPatientModal'
import { PatientErrorBanner } from '@/components/admin/patients/PatientErrorBanner'
import { PatientRecordsList } from '@/components/admin/patients/PatientRecordsList'
import { AdminPageHeader } from '@/components/admin/shared/AdminPageHeader'
import type { Patient, PatientEditForm } from '@/components/admin/patients/types'

const emptyEditForm = (): PatientEditForm => ({
  name: '',
  email: '',
  phone: '',
  age: '',
  gender: ''
})

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [editForm, setEditForm] = useState<PatientEditForm>(emptyEditForm())
  const [searchTerm, setSearchTerm] = useState('')
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
          Authorization: `Bearer ${token}`
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
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        setPatients(patients.filter((p) => p.patient_id !== patientId))
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
    setEditForm(emptyEditForm())
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        await response.json()
        setPatients(
          patients.map((p) => (p.patient_id === editingPatient.patient_id ? { ...p, ...updateData } : p))
        )
        cancelEdit()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update patient')
      }
    } catch (error) {
      setError('Error updating patient')
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <AdminPageHeader
        title="Manage Patients"
        description="View and manage patient records"
        actionButton={{
          text: "Add New Patient",
          onClick: () => {/* TODO: Implement add patient */},
          icon: <Plus className="w-4 h-4" />
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <PatientErrorBanner message={error} onDismiss={() => setError('')} />}

        {editingPatient && (
          <EditPatientModal
            editForm={editForm}
            onChange={setEditForm}
            onCancel={cancelEdit}
            onSave={saveEdit}
          />
        )}

        {/* Search and Filter */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white hover:bg-slate-700 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Patient Records</h2>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg text-sm">
                {filteredPatients.length} patients
              </span>
            </div>
          </div>
          
          <PatientRecordsList patients={filteredPatients} onEdit={startEdit} onDelete={deletePatient} />
        </div>
      </main>
    </div>
  )
}
