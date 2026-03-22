'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditPatientModal } from '@/components/admin/patients/EditPatientModal'
import { PatientErrorBanner } from '@/components/admin/patients/PatientErrorBanner'
import { PatientRecordsList } from '@/components/admin/patients/PatientRecordsList'
import { PatientsHeader } from '@/components/admin/patients/PatientsHeader'
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <PatientsHeader />

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

        <PatientRecordsList patients={patients} onEdit={startEdit} onDelete={deletePatient} />
      </main>
    </div>
  )
}
