'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthShell } from '@/components/AuthShell'

export default function AdminLoginPage() {
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
      const response = await fetch('http://localhost:5000/api/admin/login', {
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
      localStorage.setItem('user', JSON.stringify(data.admin))
      localStorage.setItem('userRole', 'admin')
      
      router.push('/admin/dashboard')
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-center text-xl font-bold text-foreground">Admin Sign In</h2>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Or{' '}
            <Link href="/admin/signup" className="font-medium text-primary-bright hover:text-sky-300">
              create a new admin account
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
              {loading ? 'Signing in...' : 'Sign in as Admin'}
            </button>
          </div>

          <div className="text-center space-y-1.5 text-xs">
            <Link href="/" className="block text-muted-foreground hover:text-foreground">
              ← Choose different role
            </Link>
            <div className="text-muted-foreground">
              <Link href="/doctor/login" className="text-primary-bright hover:text-sky-300">
                Doctor Login
              </Link>
              {' · '}
              <Link href="/login" className="text-primary-bright hover:text-sky-300">
                Patient Login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthShell>
  )
}
