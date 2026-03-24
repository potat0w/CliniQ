'use client'

import { useRouter } from 'next/navigation'

export function PatientsHeader() {
  const router = useRouter()

  return (
    <div className="border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              className="text-muted-foreground hover:text-foreground p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Manage Patients</h1>
              <p className="text-xs text-muted-foreground">View and manage patient records</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center space-x-2 shadow-[0_0_20px_-6px_rgba(55,105,163,0.4)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add New Patient</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
