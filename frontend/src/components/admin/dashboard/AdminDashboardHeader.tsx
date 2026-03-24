'use client'

import type { Admin } from './types'

type AdminDashboardHeaderProps = {
  admin: Admin
  onLogout: () => void
}

export function AdminDashboardHeader({ admin, onLogout }: AdminDashboardHeaderProps) {
  return (
    <header className="admin-topbar">
      <div className="flex items-center gap-3">
        <div className="admin-avatar">
          {admin.name?.charAt(0)?.toUpperCase() || 'A'}
        </div>
        <div className="admin-brand-text">
          <h1>Admin Dashboard</h1>
          <p>CliniQ</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="admin-user-email">{admin.email}</span>
        <div className="admin-status-dot"></div>
        <button className="admin-btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}
