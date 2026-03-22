'use client'

import { PatientRow } from './PatientRow'
import type { Patient } from './types'

type PatientRecordsListProps = {
  patients: Patient[]
  onEdit: (patient: Patient) => void
  onDelete: (patientId: number) => void
}

export function PatientRecordsList({ patients, onEdit, onDelete }: PatientRecordsListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Patient Records</h2>
        <p className="text-sm text-gray-500 mt-1">Manage all patient information and records</p>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-lg font-medium">No patients found</p>
          <p className="text-gray-400 text-sm mt-1">Get started by adding your first patient</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {patients.map((patient) => (
            <PatientRow key={patient.patient_id} patient={patient} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
