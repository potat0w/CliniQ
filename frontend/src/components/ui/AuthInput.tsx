'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AuthInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  showPasswordToggle?: boolean
}

const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, type, label, showPasswordToggle, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const inputType = showPasswordToggle
      ? showPassword
        ? 'text'
        : 'password'
      : type

    return (
      <div className="space-y-1">
        <label className="text-xs text-gray-600">{label}</label>
        <div className="relative">
          <input
            type={inputType}
            className={cn(
              "flex h-9 w-full rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    )
  }
)
AuthInput.displayName = "AuthInput"

export { AuthInput }
