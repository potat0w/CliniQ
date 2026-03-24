'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthShell } from '@/components/AuthShell'
import AuthForm from '@/components/AuthForm'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')

    if (token && userRole) {
      const dashboards = {
        patient: '/dashboard',
        doctor: '/doctor/dashboard',
        admin: '/admin/dashboard',
      }
      router.push(dashboards[userRole as keyof typeof dashboards] || '/dashboard')
    }
  }, [router])

  return (
    <AuthShell layout="split">
      <AuthForm />
    </AuthShell>
  )
}
