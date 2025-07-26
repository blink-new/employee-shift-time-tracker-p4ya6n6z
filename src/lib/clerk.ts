import { Clerk } from '@clerk/clerk-react'

// Role-based email configuration
export const ROLE_EMAILS = {
  admin: ['kai.jiabo.feng@gmail.com'],
  manager: ['ahmadxeikh786@gmail.com'],
  employee: [] // All other emails default to employee
}

export const getUserRole = (email: string): 'admin' | 'manager' | 'employee' => {
  if (ROLE_EMAILS.admin.includes(email)) return 'admin'
  if (ROLE_EMAILS.manager.includes(email)) return 'manager'
  return 'employee'
}

export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'admin': return 'System Administrator'
    case 'manager': return 'Department Manager'
    case 'employee': return 'Employee'
    default: return 'Employee'
  }
}

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800 border-red-200'
    case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'employee': return 'bg-green-100 text-green-800 border-green-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}