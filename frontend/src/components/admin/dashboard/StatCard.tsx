'use client'

import type { ReactNode } from 'react'

type Tone = 'blue' | 'green' | 'purple' | 'orange' | 'yellow'

const toneClasses: Record<Tone, string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  yellow: 'bg-yellow-100 text-yellow-600'
}

type StatCardProps = {
  label: string
  value: number
  tone: Tone
  icon: ReactNode
}

export function StatCard({ label, value, tone, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${toneClasses[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
