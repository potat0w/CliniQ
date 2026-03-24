'use client'

type StatCardProps = {
  label: string
  value: number
  icon: string
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-num">{value.toLocaleString()}</div>
      <div className="admin-stat-card-glow"></div>
    </div>
  )
}
