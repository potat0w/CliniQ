'use client'

import { StatCard } from './StatCard'
import type { DashboardStats } from './types'

type DashboardStatsGridProps = {
  stats: DashboardStats
}

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="admin-stats">
      <StatCard
        label="Total Patients"
        value={stats.totalPatients}
        icon="👥"
      />
      <StatCard
        label="Total Doctors"
        value={stats.totalDoctors}
        icon="🩺"
      />
      <StatCard
        label="Total Chambers"
        value={stats.totalChambers}
        icon="🏥"
      />
      <StatCard
        label="Today's Appts"
        value={stats.todayAppointments}
        icon="📅"
      />
      <StatCard
        label="Pending Appts"
        value={stats.pendingAppointments}
        icon="🕐"
      />
    </div>
  )
}
