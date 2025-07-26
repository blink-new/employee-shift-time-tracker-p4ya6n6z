import { useState } from 'react'
import { Bell, Search, User, ChevronDown, Settings, LogOut } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu'
import { useClerkAuth } from '../../hooks/useClerkAuth'
import { getRoleDisplayName, getRoleColor } from '../../lib/clerk'
import { SignOutButton } from '@clerk/clerk-react'

export function Header() {
  const { user, userRole, fullName, email, imageUrl } = useClerkAuth()
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New shift assigned for tomorrow', time: '5 min ago', unread: true },
    { id: 2, message: 'Weekly report is ready', time: '1 hour ago', unread: true },
    { id: 3, message: 'Employee John Doe checked in late', time: '2 hours ago', unread: false }
  ])

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Search */}
          <div className="flex flex-1 items-center">
            <div className="w-full max-w-lg lg:max-w-xs">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="search"
                  name="search"
                  className="block w-full rounded-lg border-0 bg-gray-50/50 py-2 pl-10 pr-3 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
                  placeholder="Search employees, shifts..."
                  type="search"
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="ml-4 flex items-center md:ml-6 space-x-4">
            {/* Current time */}
            <div className="hidden sm:block text-sm text-gray-500 font-medium">
              {new Date().toLocaleString()}
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-2 hover:bg-gray-100/50 rounded-lg transition-colors">
                  <Bell className="h-6 w-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0 animate-pulse">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 shadow-lg border-0">
                <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-xs text-gray-500 mt-1">{unreadCount} unread messages</p>
                </div>
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-blue-600' : 'bg-gray-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="px-4 py-2 text-center text-blue-600 hover:bg-blue-50 cursor-pointer">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100/50 transition-colors">
                  <Avatar className="h-9 w-9 ring-2 ring-blue-100">
                    <AvatarImage src={imageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold">
                      {fullName?.split(' ').map(n => n[0]).join('') || email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {fullName || email?.split('@')[0] || 'User'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getRoleColor(userRole)} border text-xs px-2 py-0.5`}>
                        {getRoleDisplayName(userRole)}
                      </Badge>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-lg border-0">
                <div className="px-3 py-2 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                  <p className="text-sm font-medium text-gray-900">{fullName || 'User'}</p>
                  <p className="text-xs text-gray-500">{email}</p>
                </div>
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <SignOutButton>
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </SignOutButton>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}