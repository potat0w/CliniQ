'use client'

import { AuthShell } from '@/components/AuthShell'
import AuthForm from '@/components/AuthForm'

export default function SignupPage() {
  return (
    <AuthShell layout="centered">
      <AuthForm />
    </AuthShell>
  )
}
