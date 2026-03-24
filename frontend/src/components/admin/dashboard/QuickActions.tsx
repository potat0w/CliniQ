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
          <div className="admin-action-icon-wrap">🩺</div>
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
          <div className="admin-action-icon-wrap">👥</div>
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
          <div className="admin-action-icon-wrap">📅</div>
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
          <div className="admin-action-icon-wrap">🏥</div>
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
