'use client'

import { useRouter } from 'next/navigation'

export function QuickActions() {
  const router = useRouter()

  return (
    <>
      <div className="admin-section-title">Quick Actions</div>
      <div className="admin-actions">
        <button 
          type="button" 
          onClick={() => router.push('/admin/doctors')} 
          className="admin-action-card"
        >
          <div className="admin-action-icon-wrap">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="admin-action-text">
            <h3>Manage Doctors</h3>
            <p>View and edit doctors</p>
          </div>
          <span className="admin-action-arrow">›</span>
        </button>

        <button 
          type="button" 
          onClick={() => router.push('/admin/patients')} 
          className="admin-action-card"
        >
          <div className="admin-action-icon-wrap">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="admin-action-text">
            <h3>View Patients</h3>
            <p>Manage patient records</p>
          </div>
          <span className="admin-action-arrow">›</span>
        </button>

        <button 
          type="button" 
          onClick={() => router.push('/admin/appointments')} 
          className="admin-action-card"
        >
          <div className="admin-action-icon-wrap">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="admin-action-text">
            <h3>View Appointments</h3>
            <p>Schedule and manage</p>
          </div>
          <span className="admin-action-arrow">›</span>
        </button>

        <button 
          type="button" 
          onClick={() => router.push('/admin/chambers')} 
          className="admin-action-card"
        >
          <div className="admin-action-icon-wrap">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="admin-action-text">
            <h3>Manage Chambers</h3>
            <p>Location settings</p>
          </div>
          <span className="admin-action-arrow">›</span>
        </button>
      </div>
    </>
  )
}
