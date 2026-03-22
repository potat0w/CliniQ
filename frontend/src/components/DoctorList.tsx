'use client'

import { useState } from 'react'

interface Doctor {
  doctor_id: string
  doctor_name: string
  email: string
  phone?: string
  speciality: string
  experience?: number
  chamber_id?: string
}

interface DoctorListProps {
  doctors: Doctor[]
  onBookAppointment: (doctor: Doctor) => void
}

export default function DoctorList({ doctors, onBookAppointment }: DoctorListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpeciality, setSelectedSpeciality] = useState('')

  // Get unique specialities for filter
  const specialities = [...new Set(doctors.map(doctor => doctor.speciality))]

  // Filter doctors based on search and speciality
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpeciality = !selectedSpeciality || doctor.speciality === selectedSpeciality
    return matchesSearch && matchesSpeciality
  })

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search doctors by name or speciality..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedSpeciality}
          onChange={(e) => setSelectedSpeciality(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Specialities</option>
          {specialities.map(speciality => (
            <option key={speciality} value={speciality}>
              {speciality}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.doctor_id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <h4 className="text-lg font-medium text-white mb-2">{doctor.doctor_name}</h4>
            <p className="text-gray-300 mb-1">Speciality: {doctor.speciality}</p>
            {doctor.experience && (
              <p className="text-gray-300 mb-1">Experience: {doctor.experience} years</p>
            )}
            {doctor.email && (
              <p className="text-gray-300 mb-1">Email: {doctor.email}</p>
            )}
            {doctor.phone && (
              <p className="text-gray-300 mb-3">Phone: {doctor.phone}</p>
            )}
            <button
              onClick={() => onBookAppointment(doctor)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>
      
      {filteredDoctors.length === 0 && (
        <p className="text-gray-400 text-center py-8">
          {doctors.length === 0 ? 'No doctors available at the moment.' : 'No doctors match your filters.'}
        </p>
      )}
    </div>
  )
}
