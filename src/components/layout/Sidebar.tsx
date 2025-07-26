import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Calendar, 
  Clock, 
  Users, 
  BarChart3, 
  Settings, 
  Building2,
  Menu,
  X,
  LogOut,
  Shield,
  UserCheck,
  LayoutDashboard
} from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useClerkAuth } from '../../hooks/useClerkAuth'
import { getRoleColor, getRoleDisplayName } from '../../lib/clerk'
import { SignOutButton } from '@clerk/clerk-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
  { name: 'Schedule', href: '/schedule', icon: Calendar, roles: ['admin', 'manager', 'employee'] },
  { name: 'Time Tracking', href: '/time-tracking', icon: Clock, roles: ['admin', 'manager', 'employee'] },
  { name: 'Employees', href: '/employees', icon: Users, roles: ['admin', 'manager'] },
  { name: 'Branches', href: '/branches', icon: Building2, roles: ['admin', 'manager'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'manager'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { userRole, fullName, email, imageUrl } = useClerkAuth()

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/90 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ShiftTracker
            </h1>
            <p className="text-xs text-gray-500 font-medium">Workforce Management</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden hover:bg-gray-100/50"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12 ring-2 ring-blue-100">
            <AvatarImage src={imageUrl} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold">
              {fullName?.split(' ').map(n => n[0]).join('') || email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {fullName || email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate mb-1">{email}</p>
            <div className="flex items-center space-x-2">
              {userRole === 'admin' ? (
                <Shield className="h-3 w-3 text-red-600" />
              ) : userRole === 'manager' ? (
                <UserCheck className="h-3 w-3 text-blue-600" />
              ) : (
                <Users className="h-3 w-3 text-green-600" />
              )}
              <Badge className={`${getRoleColor(userRole)} border text-xs px-2 py-0.5`}>
                {getRoleDisplayName(userRole)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-r-2 border-blue-600 shadow-sm'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-600'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`} />
              {item.name}
              {item.name === 'Dashboard' && (
                <Badge variant="secondary" className="ml-auto text-xs bg-blue-100 text-blue-700">
                  Live
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50">
        <SignOutButton>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </SignOutButton>
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">
            © 2024 ShiftTracker Pro
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm shadow-md hover:bg-white"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 shadow-2xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 shadow-xl border-r border-gray-200/50">
        <SidebarContent />
      </div>
    </>
  )
}