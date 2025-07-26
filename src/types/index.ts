export interface User {
  id: string
  userId: string // Blink auth user ID
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'employee'
  branchId?: string
  departmentId?: string
  phone?: string
  hourlyRate?: number
  hireDate?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Branch {
  id: string
  name: string
  address?: string
  phone?: string
  managerId?: string
  createdAt: string
  updatedAt: string
}

export interface Department {
  id: string
  name: string
  branchId: string
  createdAt: string
}

export interface Shift {
  id: string
  title: string
  employeeId: string
  branchId: string
  departmentId?: string
  startTime: string
  endTime: string
  breakDuration: number
  hourlyRate?: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface TimeEntry {
  id: string
  userId: string
  shiftId?: string
  checkInTime?: string
  checkOutTime?: string
  checkInLocation?: string
  checkOutLocation?: string
  breakStartTime?: string
  breakEndTime?: string
  totalHours?: number
  overtimeHours: number
  status: 'checked_in' | 'on_break' | 'checked_out'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface EmployeeAvailability {
  id: string
  employeeId: string
  dayOfWeek: number // 0 = Sunday
  startTime: string
  endTime: string
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'shift_reminder' | 'shift_assigned' | 'shift_cancelled' | 'check_in_reminder' | 'overtime_alert'
  isRead: boolean
  relatedId?: string
  createdAt: string
}