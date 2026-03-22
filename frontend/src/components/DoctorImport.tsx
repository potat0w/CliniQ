'use client'

import { useState } from 'react'

interface DoctorImportProps {
  onImportComplete: (message: string) => void
}

export default function DoctorImport({ onImportComplete }: DoctorImportProps) {
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      onImportComplete('Please select a CSV file first')
      return
    }

    if (!file.name.endsWith('.csv')) {
      onImportComplete('Please upload a CSV file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('csvFile', file)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/admin/doctors/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        onImportComplete(`Successfully imported ${result.imported} doctors${result.errors > 0 ? ` with ${result.errors} errors` : ''}`)
      } else {
        onImportComplete(result.error || 'Import failed')
      }
    } catch (error) {
      onImportComplete('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      setFile(null)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Import Doctors from CSV</h3>
      
      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 mb-4">
        <p className="text-gray-300 text-sm mb-2">
          CSV should contain columns: name, email, speciality, phone, experience, chamber_id
        </p>
        <p className="text-gray-400 text-xs">
          Required: name, email, speciality | Optional: phone, experience, chamber_id
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
        >
          {uploading ? 'Importing...' : 'Import CSV'}
        </button>
      </div>
    </div>
  )
}
