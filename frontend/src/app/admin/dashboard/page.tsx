'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminDashboardHeader } from '@/components/admin/dashboard/AdminDashboardHeader'
import { DashboardStatsGrid } from '@/components/admin/dashboard/DashboardStatsGrid'
import { QuickActions } from '@/components/admin/dashboard/QuickActions'
import { AppointmentStatus } from '@/components/admin/dashboard/AppointmentStatus'
import { WeeklyChart } from '@/components/admin/dashboard/WeeklyChart'
import type { Admin, DashboardStats } from '@/components/admin/dashboard/types'
import '@/styles/admin-theme.css'

export default function AdminDashboardPage() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalChambers: 0,
    todayAppointments: 0,
    pendingAppointments: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    const userRole = localStorage.getItem('userRole')

    if (!token || !userData || userRole !== 'admin') {
      router.push('/admin/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setAdmin(parsedUser)
      fetchDashboardStats()
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token')

      if (!token) {
        console.error('No token found')
        return
      }

      const response = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Failed to fetch dashboard stats')
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="admin-dashboard-body">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return (
    <div className="admin-dashboard-body">
      <AdminDashboardHeader admin={admin} onLogout={handleLogout} />

      <div className="admin-wrapper">
        {/* HERO */}
        <div className="admin-hero">
          <div className="admin-hero-label">Overview</div>
          <h2>Welcome back, Admin 👋</h2>
          <p>Here's what's happening with your medical practice today.</p>
        </div>

        {/* STATS */}
        <DashboardStatsGrid stats={stats} />

        {/* QUICK ACTIONS */}
        <QuickActions />

        <div className="admin-divider"></div>

        {/* BOTTOM ROW */}
        <div className="admin-bottom-row">
          <AppointmentStatus />
          <WeeklyChart />
        </div>
      </div>
    </div>
  )
}
