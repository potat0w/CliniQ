'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthShell } from '@/components/AuthShell'

export default function DoctorLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/doctors/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.doctor))
      localStorage.setItem('userRole', 'doctor')
      
      router.push('/doctor/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell layout="centered">
      <div className="space-y-6">
        <div>
          <div className="mx-auto w-14 h-14 bg-primary/15 border border-primary/30 rounded-full flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-primary-bright" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-center text-xl font-bold text-foreground">Doctor Sign In</h2>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Or{' '}
            <Link href="/doctor/signup" className="font-medium text-primary-bright hover:text-sky-300">
              create a new doctor account
            </Link>
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-destructive/15 border border-destructive/35 text-red-200 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-3 py-2.5 rounded-lg placeholder:text-muted-foreground/70 text-foreground bg-secondary/80 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-3 py-2.5 rounded-lg placeholder:text-muted-foreground/70 text-foreground bg-secondary/80 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_24px_-6px_rgba(55,105,163,0.4)]"
            >
              {loading ? 'Signing in...' : 'Sign in as Doctor'}
            </button>
          </div>
        </form>

        <div className="text-center space-y-1.5 text-xs text-muted-foreground">
          <Link href="/auth" className="block hover:text-foreground">
            ← Choose different role
          </Link>
          <div>
            <Link href="/admin/login" className="text-primary-bright hover:text-sky-300">
              Admin Login
            </Link>
            {' · '}
            <Link href="/login" className="text-primary-bright hover:text-sky-300">
              Patient Login
            </Link>
          </div>
        </div>
      </div>
    </AuthShell>
  )
}
