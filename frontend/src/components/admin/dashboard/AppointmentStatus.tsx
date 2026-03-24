'use client'

export function AppointmentStatus() {
  return (
    <div className="admin-mini-card">
      <h4>Appointment Status</h4>
      <div className="admin-pill-row">
        <span className="admin-pill active">Pending (9)</span>
        <span className="admin-pill">Confirmed</span>
        <span className="admin-pill">Completed</span>
        <span className="admin-pill">Cancelled</span>
      </div>
    </div>
  )
}
