'use client'

type PatientErrorBannerProps = {
  message: string
  onDismiss: () => void
}

export function PatientErrorBanner({ message, onDismiss }: PatientErrorBannerProps) {
  if (!message) return null

  return (
    <div className="bg-destructive/15 border border-destructive/35 text-red-200 px-4 py-2.5 rounded-lg mb-4 flex items-center justify-between text-sm">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{message}</span>
      </div>
      <button type="button" onClick={onDismiss} className="text-red-200 hover:text-white">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
