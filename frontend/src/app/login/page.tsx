'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [role, setRole] = useState<'patient' | 'doctor' | 'admin'>('patient')
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
      let apiUrl = ''
      let userDataKey = ''
      let dashboardPath = ''

      switch (role) {
        case 'patient':
          apiUrl = 'http://localhost:5000/api/patients/login'
          userDataKey = 'patient'
          dashboardPath = '/dashboard'
          break
        case 'doctor':
          apiUrl = 'http://localhost:5000/api/doctors/login'
          userDataKey = 'doctor'
          dashboardPath = '/doctor/dashboard'
          break
        case 'admin':
          apiUrl = 'http://localhost:5000/api/admin/login'
          userDataKey = 'admin'
          dashboardPath = '/admin/dashboard'
          break
      }

      const response = await fetch(apiUrl, {
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
      localStorage.setItem('user', JSON.stringify(data[userDataKey]))
      localStorage.setItem('userRole', role)
      
      router.push(dashboardPath)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>

          <div className="mt-6">
            <p className="text-center text-sm font-medium text-gray-700 mb-3">I am a:</p>
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                className={`px-6 py-3 border rounded-md text-sm font-medium ${role === 'patient' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                onClick={() => setRole('patient')}
              >
                Patient
              </button>
              <button
                type="button"
                className={`px-6 py-3 border rounded-md text-sm font-medium ${role === 'doctor' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                onClick={() => setRole('doctor')}
              >
                Doctor
              </button>
              <button
                type="button"
                className={`px-6 py-3 border rounded-md text-sm font-medium ${role === 'admin' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                onClick={() => setRole('admin')}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? `Signing in as ${role}...` : `Sign in as ${role}`}
            </button>
          </div>
        </form>
        
        <div className="text-center space-y-2">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Choose different role
          </Link>
          <br />
          <Link href="/doctor/login" className="text-sm text-green-600 hover:text-green-900">
            Doctor Login
          </Link>
          {' | '}
          <Link href="/admin/login" className="text-sm text-purple-600 hover:text-purple-900">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  )
}
