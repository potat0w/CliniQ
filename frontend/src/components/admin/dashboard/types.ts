export interface Admin {
  id: string
  name: string
  email: string
}

export interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  totalChambers: number
  todayAppointments: number
  pendingAppointments: number
}
