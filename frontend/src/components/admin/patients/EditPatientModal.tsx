'use client'

import type { PatientEditForm } from './types'

type EditPatientModalProps = {
  editForm: PatientEditForm
  onChange: (form: PatientEditForm) => void
  onCancel: () => void
  onSave: () => void
}

export function EditPatientModal({ editForm, onChange, onCancel, onSave }: EditPatientModalProps) {
  const patch = (partial: Partial<PatientEditForm>) => onChange({ ...editForm, ...partial })

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-border w-full max-w-md rounded-2xl bg-popover shadow-[0_0_48px_-12px_rgba(55,105,163,0.25)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Edit Patient</h3>
          <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => patch({ name: e.target.value })}
              className="w-full px-3 py-2 text-sm text-foreground bg-secondary/80 border border-border rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => patch({ email: e.target.value })}
              className="w-full px-3 py-2 text-sm text-foreground bg-secondary/80 border border-border rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone</label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => patch({ phone: e.target.value })}
              className="w-full px-3 py-2 text-sm text-foreground bg-secondary/80 border border-border rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Age</label>
              <input
                type="number"
                value={editForm.age}
                onChange={(e) => patch({ age: e.target.value })}
                className="w-full px-3 py-2 text-sm text-foreground bg-secondary/80 border border-border rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Gender</label>
              <select
                value={editForm.gender}
                onChange={(e) => patch({ gender: e.target.value })}
                className="w-full cursor-pointer px-3 py-2 text-sm text-zinc-100 bg-zinc-900 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-zinc-600 transition-colors [color-scheme:dark]"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 bg-secondary text-foreground rounded-lg border border-border hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-[0_0_20px_-6px_rgba(55,105,163,0.4)]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
