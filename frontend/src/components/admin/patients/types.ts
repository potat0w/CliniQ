export interface Patient {
  patient_id: number
  name: string
  email: string
  phone?: string | null
  age?: number | null
  gender?: string | null
}

export type PatientEditForm = {
  name: string
  email: string
  phone: string
  age: string
  gender: string
}
