import { useState, useEffect, useCallback } from 'react'
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Timer,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { blink } from '../blink/client'
import { useAuth } from '../hooks/useAuth'
import type { Shift, TimeEntry, User } from '../types'

export function Dashboard() {
  const { currentUser } = useAuth()
  const [todayShifts, setTodayShifts] = useState<Shift[]>([])
  const [activeTimeEntry, setActiveTimeEntry] = useState<TimeEntry | null>(null)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeShifts: 0,
    todayHours: 0,
    weeklyHours: 0
  })
  const [loading, setLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      
      // Load today's shifts
      const shiftsQuery: any = {
        orderBy: { startTime: 'asc' },
        limit: 10
      }
      
      if (currentUser?.role === 'employee') {
        shiftsQuery.where = { employeeId: currentUser.id }
      }
      
      const shifts = await blink.db.shifts.list(shiftsQuery)
      const todayShifts = shifts.filter((shift: Shift) => 
        shift.startTime.startsWith(today)
      )
      setTodayShifts(todayShifts as Shift[])

      // Load active time entry for employee
      if (currentUser?.role === 'employee') {
        const timeEntries = await blink.db.timeEntries.list({
          where: { 
            userId: currentUser.id,
            status: 'checked_in'
          },
          limit: 1
        })
        if (timeEntries.length > 0) {
          setActiveTimeEntry(timeEntries[0] as TimeEntry)
        }
      }

      // Load stats for managers/admins
      if (currentUser?.role !== 'employee') {
        const [employees, allShifts, timeEntries] = await Promise.all([
          blink.db.users.list({ where: { role: 'employee' } }),
          blink.db.shifts.list({ where: { status: 'in_progress' } }),
          blink.db.timeEntries.list({
            where: { checkInTime: { gte: today } }
          })
        ])
        
        setStats({
          totalEmployees: employees.length,
          activeShifts: allShifts.length,
          todayHours: timeEntries.reduce((sum: number, entry: any) => 
            sum + (entry.totalHours || 0), 0
          ),
          weeklyHours: 0 // Calculate weekly hours
        })
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      loadDashboardData()
    }
  }, [currentUser, loadDashboardData])

  const handleClockIn = async () => {
    try {
      const now = new Date().toISOString()
      const location = JSON.stringify({ lat: 0, lng: 0 }) // TODO: Get actual location
      
      const timeEntry = await blink.db.timeEntries.create({
        userId: currentUser?.id,
        checkInTime: now,
        checkInLocation: location,
        status: 'checked_in'
      })
      
      setActiveTimeEntry(timeEntry as TimeEntry)
      
      // Create notification
      await blink.db.notifications.create({
        userId: currentUser?.id,
        title: 'Clocked In',
        message: `You clocked in at ${new Date().toLocaleTimeString()}`,
        type: 'check_in_reminder'
      })
    } catch (error) {
      console.error('Error clocking in:', error)
    }
  }

  const handleClockOut = async () => {
    if (!activeTimeEntry) return
    
    try {
      const now = new Date().toISOString()
      const checkInTime = new Date(activeTimeEntry.checkInTime!)
      const checkOutTime = new Date(now)
      const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
      
      await blink.db.timeEntries.update(activeTimeEntry.id, {
        checkOutTime: now,
        checkOutLocation: JSON.stringify({ lat: 0, lng: 0 }),
        totalHours: Math.round(totalHours * 100) / 100,
        status: 'checked_out'
      })
      
      setActiveTimeEntry(null)
      
      // Create notification
      await blink.db.notifications.create({
        userId: currentUser?.id,
        title: 'Clocked Out',
        message: `You clocked out at ${new Date().toLocaleTimeString()}. Total hours: ${Math.round(totalHours * 100) / 100}`,
        type: 'check_in_reminder'
      })
    } catch (error) {
      console.error('Error clocking out:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {currentUser?.firstName}!
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        {/* Clock In/Out for Employees */}
        {currentUser?.role === 'employee' && (
          <div className="flex items-center space-x-4">
            {activeTimeEntry ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Clocked in at</p>
                  <p className="font-semibold text-green-600">
                    {new Date(activeTimeEntry.checkInTime!).toLocaleTimeString()}
                  </p>
                </div>
                <Button onClick={handleClockOut} variant="destructive">
                  <Clock className="w-4 h-4 mr-2" />
                  Clock Out
                </Button>
              </div>
            ) : (
              <Button onClick={handleClockIn} className="bg-green-600 hover:bg-green-700">
                <Clock className="w-4 h-4 mr-2" />
                Clock In
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {currentUser?.role !== 'employee' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Shifts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeShifts}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayHours.toFixed(1)}</p>
                </div>
                <Timer className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Weekly Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.weeklyHours}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Today's Shifts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Today's Shifts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayShifts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No shifts scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayShifts.map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{shift.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(shift.startTime).toLocaleTimeString()} - {new Date(shift.endTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        shift.status === 'completed' ? 'default' :
                        shift.status === 'in_progress' ? 'secondary' :
                        'outline'
                      }
                    >
                      {shift.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {currentUser?.role !== 'employee' && (
                <>
                  <Button variant="outline" className="h-20 flex-col">
                    <Calendar className="w-6 h-6 mb-2" />
                    Create Shift
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="w-6 h-6 mb-2" />
                    Add Employee
                  </Button>
                </>
              )}
              <Button variant="outline" className="h-20 flex-col">
                <Clock className="w-6 h-6 mb-2" />
                View Schedule
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <TrendingUp className="w-6 h-6 mb-2" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Status for Employees */}
      {currentUser?.role === 'employee' && activeTimeEntry && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Timer className="w-5 h-5 mr-2" />
              Current Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Started at</p>
                <p className="text-lg font-semibold">
                  {new Date(activeTimeEntry.checkInTime!).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-semibold text-green-600">
                  {Math.floor((Date.now() - new Date(activeTimeEntry.checkInTime!).getTime()) / (1000 * 60))} minutes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}