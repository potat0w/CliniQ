'use client'

import { useRouter } from 'next/navigation'

interface AdminPageHeaderProps {
  title: string
  description?: string
  actionButton?: {
    text: string
    onClick: () => void
    icon?: React.ReactNode
  }
  showBackButton?: boolean
}

export function AdminPageHeader({ 
  title, 
  description, 
  actionButton, 
  showBackButton = true 
}: AdminPageHeaderProps) {
  const router = useRouter()

  return (
    <div className="border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="text-muted-foreground hover:text-foreground p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-foreground">{title}</h1>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {actionButton && (
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={actionButton.onClick}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center space-x-2 shadow-[0_0_20px_-6px_rgba(55,105,163,0.4)]"
              >
                {actionButton.icon}
                <span>{actionButton.text}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
