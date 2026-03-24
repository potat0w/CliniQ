'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthShell } from '@/components/AuthShell'

export default function AuthPage() {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'admin' | null>(null)
  const router = useRouter()

  const handleRoleSelect = (role: 'patient' | 'doctor' | 'admin') => {
    setSelectedRole(role)
  }

  const handleLogin = () => {
    if (selectedRole) {
      if (selectedRole === 'admin') {
        router.push('/admin/login')
      } else if (selectedRole === 'patient') {
        router.push('/login')
      } else {
        router.push(`/${selectedRole}/login`)
      }
    }
  }

  const handleSignup = () => {
    if (selectedRole) {
      if (selectedRole === 'admin') {
        router.push('/admin/signup')
      } else if (selectedRole === 'patient') {
        router.push('/signup')
      } else {
        router.push(`/${selectedRole}/signup`)
      }
    }
  }

  return (
    <AuthShell
      layout="centered"
      cardClassName="w-full max-w-4xl rounded-2xl border border-zinc-800/50 bg-zinc-950/55 backdrop-blur-xl p-6 md:p-8 shadow-[0_0_40px_-12px_rgba(55,105,163,0.18)]"
    >
      <div>
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-50 mb-1 tracking-tight">Welcome to CliniQ</h1>
          <p className="text-sm text-zinc-400">Choose your role to get started</p>
        </div>

        <div>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div
              className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                selectedRole === 'patient'
                  ? 'border-primary/60 bg-primary/10 shadow-[0_0_28px_-8px_rgba(55,105,163,0.4)]'
                  : 'border-border hover:border-primary/30 bg-secondary/30'
              }`}
              onClick={() => handleRoleSelect('patient')}
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center mb-3 border border-primary/25">
                  <svg className="w-6 h-6 text-primary-bright" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Patient</h3>
                <p className="text-xs text-muted-foreground">Book appointments and manage your health records</p>
                {selectedRole === 'patient' && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                selectedRole === 'doctor'
                  ? 'border-primary/60 bg-primary/10 shadow-[0_0_28px_-8px_rgba(55,105,163,0.4)]'
                  : 'border-border hover:border-primary/30 bg-secondary/30'
              }`}
              onClick={() => handleRoleSelect('doctor')}
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center mb-3 border border-primary/25">
                  <svg className="w-6 h-6 text-primary-bright" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Doctor</h3>
                <p className="text-xs text-muted-foreground">Manage appointments and patient consultations</p>
                {selectedRole === 'doctor' && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                selectedRole === 'admin'
                  ? 'border-primary/60 bg-primary/10 shadow-[0_0_28px_-8px_rgba(55,105,163,0.4)]'
                  : 'border-border hover:border-primary/30 bg-secondary/30'
              }`}
              onClick={() => handleRoleSelect('admin')}
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center mb-3 border border-primary/25">
                  <svg className="w-6 h-6 text-primary-bright" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Admin</h3>
                <p className="text-xs text-muted-foreground">Manage doctors, patients, and system settings</p>
                {selectedRole === 'admin' && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedRole && (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                You selected to continue as <span className="font-semibold text-foreground capitalize">{selectedRole}</span>
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleLogin}
                  className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-[0_0_24px_-6px_rgba(55,105,163,0.4)]"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={handleSignup}
                  className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-[0_0_24px_-6px_rgba(55,105,163,0.4)]"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

          {!selectedRole && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Select a role above to continue</p>
            </div>
          )}
        </div>

        <div className="text-center mt-5">
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}
