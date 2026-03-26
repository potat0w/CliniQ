'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, UserCog, Stethoscope } from 'lucide-react'
import { AuthInput } from '@/components/ui/AuthInput'

type UserRole = 'patient' | 'admin' | 'doctor'
type AuthMode = 'login' | 'signup'

const roleConfig = {
  patient: { icon: Heart, label: 'Patient', dashboard: '/dashboard' },
  admin: { icon: UserCog, label: 'Admin', dashboard: '/admin/dashboard' },
  doctor: { icon: Stethoscope, label: 'Doctor', dashboard: '/doctor/dashboard' },
}

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const roleToggleInactive =
  'flex-1 flex items-center justify-center gap-1 h-8 rounded-lg transition-all text-xs bg-zinc-900/50 text-muted-foreground border border-zinc-800/60 hover:bg-zinc-800/50 hover:text-foreground'

const roleToggleActive =
  'flex-1 flex items-center justify-center gap-1 h-8 rounded-lg transition-all text-xs font-medium border border-primary/60 bg-primary/15 text-foreground shadow-[0_0_20px_-4px_rgba(55,105,163,0.4)]'

const submitBtnClass =
  'w-full h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium mt-2 text-xs transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_24px_-6px_rgba(55,105,163,0.4)]'

type AuthFormProps = {
  initialMode?: AuthMode
}

const AuthForm = ({ initialMode = 'signup' }: AuthFormProps) => {
  const router = useRouter()
  const [role, setRole] = useState<UserRole>('patient')
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: 'male',
    doctorId: '',
    specialty: '',
    experience: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData((p) => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const dashboard = roleConfig[role].dashboard
      
      if (mode === 'signup') {
        let apiUrl = ''
        let payload: Record<string, any> = {
          email: formData.email,
          password: formData.password,
          role,
        }

        switch (role) {
          case 'patient':
            apiUrl = 'https://cliniq-1-hmus.onrender.com/api/patients/register'
            payload.name = formData.name
            payload.phone = formData.phone || null
            payload.age = formData.age ? parseInt(formData.age) : null
            payload.gender = formData.gender || null
            break
          case 'doctor':
            apiUrl = 'https://cliniq-1-hmus.onrender.com/api/doctors/signup'
            payload.doctorId = formData.doctorId
            break
          case 'admin':
            apiUrl = 'https://cliniq-1-hmus.onrender.com/api/admin/register'
            payload.name = formData.name
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
        localStorage.setItem('user', JSON.stringify(data[role === 'doctor' ? 'doctor' : role === 'patient' ? 'patient' : 'admin']))
        localStorage.setItem('userRole', role)
        
        router.push(dashboard)
      } else {
        let apiUrl = ''
        
        switch (role) {
          case 'patient':
            apiUrl = 'https://cliniq-1-hmus.onrender.com/api/patients/login'
            break
          case 'doctor':
            apiUrl = 'https://cliniq-1-hmus.onrender.com/api/doctors/login'
            break
          case 'admin':
            apiUrl = 'https://cliniq-1-hmus.onrender.com/api/admin/login'
            break
        }

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Login failed')
        }

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data[role === 'doctor' ? 'doctor' : role === 'patient' ? 'patient' : 'admin']))
        localStorage.setItem('userRole', role)
        
        router.push(dashboard)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-1">
          {React.createElement(roleConfig[role].icon, {
            className: 'w-4 h-4 text-primary-bright',
          })}
          <span className="text-xs font-medium text-zinc-200">{roleConfig[role].label}</span>
        </div>
        <h1 className="text-lg font-semibold text-zinc-50 tracking-tight">
          {mode === 'signup' ? 'Create a new account' : 'Welcome back'}
        </h1>
      </div>

      <div className="flex gap-4 mb-3 border-b border-zinc-800/60">
        {(['login', 'signup'] as AuthMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`pb-1.5 text-xs font-medium transition-colors relative capitalize ${
              mode === m ? 'text-foreground' : 'text-muted-foreground hover:text-zinc-300'
            }`}
          >
            {m}
            {mode === m && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-bright" />}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* Role Toggle */}
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">I am a:</label>
          <div className="flex gap-1.5">
            {(Object.keys(roleConfig) as UserRole[]).map((r) => {
              const Icon = roleConfig[r].icon
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={role === r ? roleToggleActive : roleToggleInactive}
                >
                  <Icon className={`w-3.5 h-3.5 ${role === r ? '' : 'opacity-80'}`} />
                  <span className="font-medium">{roleConfig[r].label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {mode === 'signup' && (
          <>
            {role === 'doctor' && (
              <AuthInput label="Doctor ID" type="text" placeholder="Enter your doctor ID" value={formData.doctorId} onChange={update('doctorId')} />
            )}
            
            <AuthInput 
              label={role === 'admin' ? 'Admin Name' : role === 'doctor' ? 'Doctor Name (Optional)' : 'Full Name'} 
              type="text" 
              placeholder={role === 'doctor' ? 'Optional: Enter your name' : `Enter your ${role === 'admin' ? 'admin' : 'full'} name`}
              value={formData.name} 
              onChange={update('name')} 
            />
          </>
        )}

        <AuthInput label="Email" type="email" placeholder="your@email.com" value={formData.email} onChange={update('email')} />
        <AuthInput label="Password" showPasswordToggle placeholder="••••••" value={formData.password} onChange={update('password')} />

        {/* Patient-specific fields */}
        {mode === 'signup' && role === 'patient' && (
          <>
            <AuthInput label="Phone Number" type="tel" placeholder="+1234567890" value={formData.phone} onChange={update('phone')} />
            <div className="grid grid-cols-2 gap-2">
              <AuthInput label="Age" type="number" placeholder="25" value={formData.age} onChange={update('age')} />
              <div>
                <label className="text-xs text-muted-foreground">Gender</label>
                <select
                  value={formData.gender}
                  onChange={update('gender')}
                  className="flex h-9 w-full rounded-lg px-3 py-2 text-sm text-foreground bg-zinc-900/60 border border-zinc-800/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="bg-destructive/15 border border-destructive/40 text-red-200 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={submitBtnClass}
        >
          {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-[11px] text-zinc-500 mt-3">
        {mode === 'signup' ? (
          <>
            Already have an account?{' '}
            <button type="button" onClick={() => setMode('login')} className="text-primary-bright hover:text-sky-300">
              Sign in
            </button>
          </>
        ) : (
          <>
            Don&apos;t have an account?{' '}
            <button type="button" onClick={() => setMode('signup')} className="text-primary-bright hover:text-sky-300">
              Sign up
            </button>
          </>
        )}
      </p>
    </div>
  )
}

export default AuthForm
