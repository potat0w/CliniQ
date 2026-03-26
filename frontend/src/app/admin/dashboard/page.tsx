'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Calendar, Building, Clock, UserPlus, TrendingUp } from 'lucide-react'
import type { Admin, DashboardStats } from '@/components/admin/dashboard/types'

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

      const response = await fetch('https://cliniq-1-hmus.onrender.com/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Doctors', 
      value: stats.totalDoctors,
      icon: UserPlus,
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Total Chambers',
      value: stats.totalChambers,
      icon: Building,
      change: '+2%',
      changeType: 'positive'
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Pending Appointments',
      value: stats.pendingAppointments,
      icon: Clock,
      change: '-3%',
      changeType: 'negative'
    }
  ]

  const quickActions = [
    {
      title: 'Manage Patients',
      description: 'View and manage patient records',
      icon: Users,
      href: '/admin/patients'
    },
    {
      title: 'Manage Doctors',
      description: 'Add and manage doctor profiles',
      icon: UserPlus,
      href: '/admin/doctors'
    },
    {
      title: 'Manage Chambers',
      description: 'Configure clinic locations',
      icon: Building,
      href: '/admin/chambers'
    },
    {
      title: 'View Appointments',
      description: 'Schedule and manage appointments',
      icon: Calendar,
      href: '/admin/appointments'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-primary-bright" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-foreground leading-tight">Dashboard</h1>
                <p className="text-xs text-muted-foreground truncate">
                  Welcome back, {admin?.name || 'Admin'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {admin?.email && (
                <span className="hidden sm:inline text-xs text-muted-foreground max-w-[240px] truncate">
                  {admin.email}
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 bg-secondary text-foreground rounded-lg border border-border hover:bg-secondary/80 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="glass-panel rounded-xl overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Overview</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Key totals and today’s workload</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y divide-border sm:divide-y-0 sm:divide-x">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="p-4 hover:bg-secondary/30 transition-colors text-foreground"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{stat.title}</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">
                        {stat.value.toLocaleString()}
                      </p>
                      <div className="mt-2 text-xs">
                        <span className={stat.changeType === 'positive' ? 'text-emerald-400' : 'text-destructive'}>
                          {stat.change}
                        </span>
                        <span className="text-muted-foreground"> vs last period</span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-secondary/70 border border-border flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary-bright" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Jump to common admin tasks</p>
            </div>

            <div className="divide-y divide-border">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => router.push(action.href)}
                    className="w-full px-4 py-3 text-left hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-secondary/70 border border-border flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary-bright" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{action.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                        </div>
                      </div>
                      <span className="text-muted-foreground text-sm shrink-0">›</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel rounded-xl overflow-hidden text-foreground">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest changes across the system</p>
          </div>

          <div className="divide-y divide-border">
            <div className="px-4 py-3 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-secondary/70 border border-border flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-primary-bright" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">New appointment scheduled</p>
                    <p className="text-xs text-muted-foreground truncate">2 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-secondary/70 border border-border flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-primary-bright" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">New patient registered</p>
                    <p className="text-xs text-muted-foreground truncate">15 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-secondary/70 border border-border flex items-center justify-center shrink-0">
                    <Building className="w-4 h-4 text-primary-bright" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">Chamber updated</p>
                    <p className="text-xs text-muted-foreground truncate">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
