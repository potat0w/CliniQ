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
      const response = await fetch('https://cliniq-1-hmus.onrender.com/api/admin/doctors/import', {
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition-colors duration-150">
      <h3 className="text-sm font-semibold text-zinc-100 mb-3 tracking-tight">Import doctors from CSV</h3>

      <div className="bg-zinc-950/80 rounded-lg p-3 border border-zinc-800 mb-3">
        <p className="text-zinc-400 text-xs mb-2 leading-relaxed">
          CSV should contain columns: name, email, speciality, phone, experience, chamber_id
        </p>
        <p className="text-zinc-500 text-[11px]">
          Required: name, email, speciality · Optional: phone, experience, chamber_id
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-300 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="text-sm font-medium px-3 py-2 rounded-md border border-primary-bright/45 bg-primary/10 text-primary-bright hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Importing...' : 'Import CSV'}
        </button>
      </div>
    </div>
  )
}
