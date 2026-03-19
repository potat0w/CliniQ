'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [role, setRole] = useState<'patient' | 'doctor' | 'admin'>('patient')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: '',
    doctorId: '',
    specialty: '',
    experienceYears: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      let payload: any = {}

      switch (role) {
        case 'patient':
          apiUrl = 'http://localhost:5000/api/patients/register'
          userDataKey = 'patient'
          dashboardPath = '/dashboard'
          payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone || null,
            age: formData.age ? parseInt(formData.age) : null,
            gender: formData.gender || null
          }
          break
        case 'doctor':
          apiUrl = 'http://localhost:5000/api/doctors/signup'
          userDataKey = 'doctor'
          dashboardPath = '/doctor/dashboard'
          payload = {
            doctorId: formData.doctorId,
            email: formData.email,
            password: formData.password
          }
          break
        case 'admin':
          apiUrl = 'http://localhost:5000/api/admin/register'
          userDataKey = 'admin'
          dashboardPath = '/admin/dashboard'
          payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password
          }
          break
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
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
          
          <div className="space-y-4">
            {role === 'doctor' && (
              <div>
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                  Doctor ID *
                </label>
                <input
                  id="doctorId"
                  name="doctorId"
                  type="text"
                  required={role === 'doctor'}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your doctor ID"
                  value={formData.doctorId}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-500">You must have an existing doctor ID from the admin</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {role === 'admin' ? 'Admin Name' : role === 'doctor' ? 'Doctor Name (Optional)' : 'Full Name'} *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required={role !== 'doctor'}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={role === 'doctor' ? 'Optional: Enter your name' : `Enter your ${role === 'admin' ? 'admin' : 'full'} name`}
                value={formData.name}
                onChange={handleChange}
              />
              {role === 'doctor' && (
                <p className="mt-1 text-xs text-gray-500">Name is optional since your profile already exists in the system</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {role === 'patient' && (
              <>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                      Age
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      min="1"
                      max="120"
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Age"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? `Creating ${role} account...` : `Create ${role} account`}
            </button>
          </div>
        </form>
        
        <div className="text-center space-y-2">
          <Link href="/auth" className="text-sm text-gray-600 hover:text-gray-900">
            ← Choose different role
          </Link>
          <br />
          <Link href="/doctor/signup" className="text-sm text-green-600 hover:text-green-900">
            Doctor Signup
          </Link>
          {' | '}
          <Link href="/admin/signup" className="text-sm text-purple-600 hover:text-purple-900">
            Admin Signup
          </Link>
        </div>
      </div>
    </div>
  )
}
