'use client'

import CosmicBackground from '@/components/CosmicBackground'

type AuthShellProps = {
  children: React.ReactNode
  layout?: 'split' | 'centered'
  cardClassName?: string
}

const defaultCardClass =
  'w-full max-w-md rounded-2xl border border-zinc-800/50 bg-zinc-950/55 backdrop-blur-xl p-6 md:p-8 shadow-[0_0_40px_-12px_rgba(55,105,163,0.18)]'

export function AuthShell({ children, layout = 'centered', cardClassName }: AuthShellProps) {
  const cardClass = cardClassName ?? defaultCardClass
  return (
    <div className="relative min-h-screen bg-background flex">
      <div className="pointer-events-none absolute inset-0 z-0">
        <CosmicBackground />
      </div>
      {layout === 'split' ? (
        <>
          <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center p-4 md:p-6 lg:p-8">
            <div className={cardClass}>{children}</div>
          </div>
          <div className="hidden lg:block lg:w-1/2 relative z-10" aria-hidden />
        </>
      ) : (
        <div className="relative z-10 flex flex-1 items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
          <div className={cardClass}>{children}</div>
        </div>
      )}
    </div>
  )
}
