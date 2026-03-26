'use client'

import { useState, useEffect } from 'react'
import Pagination from './ui/Pagination'

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
  const doctorsPerPage = 12

  const specialities = [...new Set(doctors.map(d => d.speciality))]

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch =
      doctor.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpeciality = !selectedSpeciality || doctor.speciality === selectedSpeciality
    return matchesSearch && matchesSpeciality
  })

  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage)
  const currentDoctors = filteredDoctors.slice(
    (currentPage - 1) * doctorsPerPage,
    currentPage * doctorsPerPage
  )

  useEffect(() => { setCurrentPage(1) }, [searchTerm, selectedSpeciality])

  return (
    <div className="rounded-xl p-4">

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or speciality…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400"
        />
        <select
          value={selectedSpeciality}
          onChange={e => setSelectedSpeciality(e.target.value)}
          className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-sm text-zinc-100 focus:outline-none focus:border-zinc-400"
        >
          <option value="">All Specialities</option>
          {specialities.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {currentDoctors.map((doctor, index) => {
          const certs = doctor.certifications
            ? Object.entries(doctor.certifications).filter(([, v]) => v).map(([k]) => k)
            : []
          const focus = doctor.concentration ?? []

          return (
            <div
              key={`${doctor.doctor_id}-${index}`}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col gap-3 hover:border-zinc-600 transition-colors duration-150"
            >
              {/* Name + speciality */}
              <div>
                <h4 className="text-sm font-semibold text-zinc-100 leading-snug">
                  {doctor.doctor_name}
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">{doctor.speciality}</p>
              </div>

              {/* Meta */}
              <div className="flex flex-col gap-1">
                {doctor.experience !== undefined && (
                  <p className="text-xs text-zinc-400">{doctor.experience} yrs experience</p>
                )}
                {doctor.location && (
                  <p className="text-xs text-zinc-400">{doctor.location}</p>
                )}
                {doctor.chamber && (
                  <p className="text-xs text-zinc-400">{doctor.chamber}</p>
                )}
              </div>

              {/* Tags */}
              {(certs.length > 0 || focus.length > 0) && (
                <div className="flex flex-wrap gap-1">
                  {certs.slice(0, 4).map(cert => (
                    <span
                      key={cert}
                      className="text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-400"
                    >
                      {cert}
                    </span>
                  ))}
                  {focus.slice(0, 2).map((f, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-400"
                    >
                      {f}
                    </span>
                  ))}
                  {(certs.length + focus.length) > 6 && (
                    <span className="text-[10px] text-zinc-600 py-0.5">
                      +{(certs.length + focus.length) - 6} more
                    </span>
                  )}
                </div>
              )}

              {/* Button */}
              <button
                type="button"
                onClick={() => onBookAppointment(doctor)}
                className="mt-auto self-start text-xs font-medium px-3 py-1.5 rounded border border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:border-primary/90 transition-colors duration-150"
              >
                Book Appointment
              </button>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {currentDoctors.length === 0 && (
        <p className="text-zinc-500 text-center py-12 text-sm">
          {filteredDoctors.length === 0 ? 'No doctors available.' : 'No doctors match your filters.'}
        </p>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredDoctors.length}
        onPageChange={setCurrentPage}
        itemsPerPage={doctorsPerPage}
      />
    </div>
  )
}