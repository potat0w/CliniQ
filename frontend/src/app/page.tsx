'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CosmicBackground from '@/components/CosmicBackground'
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
        admin: '/admin/dashboard'
      }
      router.push(dashboards[userRole as keyof typeof dashboards] || '/dashboard')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-4 rounded-3xl overflow-hidden">
          <CosmicBackground />
        </div>
      </div>
    </div>
  )
}
