'use client'

import { useState, useEffect } from 'react'

interface Doctor {
  doctor_id: string
  doctor_name: string
  email: string
  phone?: string
  speciality: string
  experience?: number
  chamber_id?: string
  education?: string[]
  chamber?: string
  location?: string
  concentration?: string[]
  certifications?: {
    MBBS: boolean
    FCPS: boolean
    BCS: boolean
    MD: boolean
    MS: boolean
    MCPS: boolean
    CCD: boolean
    PGT: boolean
    BDS: boolean
    MPH: boolean
  }
  specializations?: {
    gynae_problems: boolean
    cardiac_medicine: boolean
    general_medicine: boolean
    aesthetic_medicine: boolean
    adolescent_medicine: boolean
    infectious_diseases: boolean
    geriatric_medicine: boolean
    pcos: boolean
    hormone_disturbances: boolean
    pediatric_health_checkup: boolean
  }
}

interface DoctorListProps {
  doctors: Doctor[]
  onBookAppointment: (doctor: Doctor) => void
}

export default function DoctorList({ doctors, onBookAppointment }: DoctorListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpeciality, setSelectedSpeciality] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [doctorsPerPage] = useState(12) // Show 12 doctors per page

  // Get unique specialities for filter
  const specialities = [...new Set(doctors.map(doctor => doctor.speciality))]

  // Filter doctors based on search and speciality
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpeciality = !selectedSpeciality || doctor.speciality === selectedSpeciality
    return matchesSearch && matchesSpeciality
  })

  // Get current doctors for pagination
  const indexOfLastDoctor = currentPage * doctorsPerPage
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedSpeciality])

  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage)

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
        {currentDoctors.map((doctor, index) => (
          <div key={`${doctor.doctor_id}-${index}`} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <h4 className="text-lg font-medium text-white mb-2">{doctor.doctor_name}</h4>
            <p className="text-gray-300 mb-1">Speciality: {doctor.speciality}</p>
            {doctor.experience && (
              <p className="text-gray-300 mb-1">Experience: {doctor.experience} years</p>
            )}
            {doctor.chamber && (
              <p className="text-gray-300 mb-1">Chamber: {doctor.chamber}</p>
            )}
            {doctor.location && (
              <p className="text-gray-300 mb-1">Location: {doctor.location}</p>
            )}
            {doctor.education && doctor.education.length > 0 && (
              <div className="mb-2">
                <p className="text-gray-300 text-sm">Education:</p>
                <div className="flex flex-wrap gap-1">
                  {doctor.education.slice(0, 3).map((edu, index) => (
                    <span key={index} className="bg-blue-600 text-xs px-2 py-1 rounded text-white">
                      {edu}
                    </span>
                  ))}
                  {doctor.education.length > 3 && (
                    <span className="text-gray-400 text-xs">+{doctor.education.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
            {doctor.certifications && (
              <div className="mb-2">
                <p className="text-gray-300 text-sm">Certifications:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(doctor.certifications).filter(([_, value]) => value).slice(0, 4).map(([cert]) => (
                    <span key={cert} className="bg-green-600 text-xs px-2 py-1 rounded text-white">
                      {cert}
                    </span>
                  ))}
                  {Object.values(doctor.certifications).filter(Boolean).length > 4 && (
                    <span className="text-gray-400 text-xs">
                      +{Object.values(doctor.certifications).filter(Boolean).length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
            {doctor.concentration && doctor.concentration.length > 0 && (
              <div className="mb-3">
                <p className="text-gray-300 text-sm">Areas of Focus:</p>
                <div className="flex flex-wrap gap-1">
                  {doctor.concentration.slice(0, 2).map((conc, index) => (
                    <span key={index} className="bg-purple-600 text-xs px-2 py-1 rounded text-white">
                      {conc}
                    </span>
                  ))}
                  {doctor.concentration.length > 2 && (
                    <span className="text-gray-400 text-xs">+{doctor.concentration.length - 2} more</span>
                  )}
                </div>
              </div>
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
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Previous
          </button>
          
          <span className="text-gray-300">
            Page {currentPage} of {totalPages} ({filteredDoctors.length} doctors)
          </span>
          
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        </div>
      )}
      
      {currentDoctors.length === 0 && (
        <p className="text-gray-400 text-center py-8">
          {filteredDoctors.length === 0 ? 'No doctors available at the moment.' : 'No doctors match your filters.'}
        </p>
      )}
    </div>
  )
}
