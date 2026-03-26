'use client'

import { StatCard } from './StatCard'

interface DashboardStatsProps {
  stats: {
    totalPatients: number
    totalDoctors: number
    totalChambers: number
    todayAppointments: number
    pendingAppointments: number
  }
}

export function DashboardStatsGrid({ stats }: DashboardStatsProps) {
  return (
    <div className="admin-stats-grid">
      <StatCard
        label="Total Patients"
        value={stats.totalPatients}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
      />
      <StatCard
        label="Total Doctors"
        value={stats.totalDoctors}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h.663a2 2 0 01 2 2v1a2 2 0 01-2 2H8.664a2 2 0 01-2-2v-.25c0-.31.049-.5.125-.5H15a2 2 0 012 2v.25a2 2 0 01-2 2v1a2 2 0 01-2 2.664zm-4.66-4.66a2 2 0 022.25 0 2.25 2.25 0 01-.803 1.148 2.25 2.25 0 01-1.496.802c-.309 0-.59-.07-.85-.187A2.25 2.25 0 0113.84 7h-3.6a2.25 2.25 0 01-2.25-2.25V2.25a2.25 2.25 0 012.25-2.25h1.451c.288 0 .525.117.725.351.2.233.35.525.44.85a.75.75 0 00.44-.85V1.5a2.25 2.25 0 012.25-2.25h3.6a2.25 2.25 0 012.25 2.25v.663c.309 0 .59.07.85.187a2.25 2.25 0 001.496.802 2.25 2.25 0 01.803 1.148z" />
          </svg>
        }
      />
      <StatCard
        label="Total Chambers"
        value={stats.totalChambers}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
      />
      <StatCard
        label="Today's Appts"
        value={stats.todayAppointments}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />
      <StatCard
        label="Pending Appts"
        value={stats.pendingAppointments}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  )
}
