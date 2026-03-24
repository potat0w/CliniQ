'use client'

import { AuthShell } from '@/components/AuthShell'
import AuthForm from '@/components/AuthForm'

export default function LoginPage() {
  return (
    <AuthShell layout="centered">
      <AuthForm initialMode="login" />
    </AuthShell>
  )
}
