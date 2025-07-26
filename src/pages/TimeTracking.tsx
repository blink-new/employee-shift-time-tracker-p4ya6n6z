import { useState, useEffect, useCallback } from 'react'
import { 
  Clock, 
  Play, 
  Pause, 
  Square,
  Calendar,
  Timer,
  MapPin,
  Coffee
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { blink } from '../blink/client'
import { useAuth } from '../hooks/useAuth'
import type { TimeEntry, Shift } from '../types'

export function TimeTracking() {
  const { currentUser } = useAuth()
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [todayShifts, setTodayShifts] = useState<Shift[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)

  const loadTimeTrackingData = useCallback(async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      
      // Load active time entry
      const activeEntries = await blink.db.timeEntries.list({
        where: { 
          userId: currentUser?.id,
          status: 'checked_in'
        },
        limit: 1
      })
      
      if (activeEntries.length > 0) {
        setActiveEntry(activeEntries[0] as TimeEntry)
      }
      
      // Load today's time entries
      const entries = await blink.db.timeEntries.list({
        where: { userId: currentUser?.id },
        orderBy: { createdAt: 'desc' },
        limit: 10
      })
      
      const todayEntries = entries.filter((entry: TimeEntry) => 
        entry.createdAt.startsWith(today)
      )
      setTimeEntries(todayEntries as TimeEntry[])
      
      // Load today's shifts
      const shifts = await blink.db.shifts.list({
        where: { employeeId: currentUser?.id },
        orderBy: { startTime: 'asc' }
      })
      
      const todayShifts = shifts.filter((shift: Shift) => 
        shift.startTime.startsWith(today)
      )
      setTodayShifts(todayShifts as Shift[])
      
    } catch (error) {
      console.error('Error loading time tracking data:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      loadTimeTrackingData()
    }
  }, [currentUser, loadTimeTrackingData])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleClockIn = async () => {
    try {
      const now = new Date().toISOString()
      
      // Get location (simplified - in real app would use geolocation API)
      const location = JSON.stringify({ 
        lat: 40.7128, 
        lng: -74.0060,
        address: 'Office Location'
      })
      
      const timeEntry = await blink.db.timeEntries.create({
        userId: currentUser?.id,
        checkInTime: now,
        checkInLocation: location,
        status: 'checked_in'
      })
      
      setActiveEntry(timeEntry as TimeEntry)
      
      // Create notification
      await blink.db.notifications.create({
        userId: currentUser?.id,
        title: 'Clocked In Successfully',
        message: `You clocked in at ${new Date().toLocaleTimeString()}`,
        type: 'check_in_reminder'
      })
      
      loadTimeTrackingData()
    } catch (error) {
      console.error('Error clocking in:', error)
    }
  }

  const handleClockOut = async () => {
    if (!activeEntry) return
    
    try {
      const now = new Date().toISOString()
      const checkInTime = new Date(activeEntry.checkInTime!)
      const checkOutTime = new Date(now)
      const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
      
      const location = JSON.stringify({ 
        lat: 40.7128, 
        lng: -74.0060,
        address: 'Office Location'
      })
      
      await blink.db.timeEntries.update(activeEntry.id, {
        checkOutTime: now,
        checkOutLocation: location,
        totalHours: Math.round(totalHours * 100) / 100,
        status: 'checked_out'
      })
      
      setActiveEntry(null)
      
      // Create notification
      await blink.db.notifications.create({
        userId: currentUser?.id,
        title: 'Clocked Out Successfully',
        message: `You clocked out at ${new Date().toLocaleTimeString()}. Total hours: ${Math.round(totalHours * 100) / 100}`,
        type: 'check_in_reminder'
      })
      
      loadTimeTrackingData()
    } catch (error) {
      console.error('Error clocking out:', error)
    }
  }

  const handleBreakStart = async () => {
    if (!activeEntry) return
    
    try {
      await blink.db.timeEntries.update(activeEntry.id, {
        breakStartTime: new Date().toISOString(),
        status: 'on_break'
      })
      
      const updatedEntry = { ...activeEntry, status: 'on_break' as const, breakStartTime: new Date().toISOString() }
      setActiveEntry(updatedEntry)
    } catch (error) {
      console.error('Error starting break:', error)
    }
  }

  const handleBreakEnd = async () => {
    if (!activeEntry) return
    
    try {
      await blink.db.timeEntries.update(activeEntry.id, {
        breakEndTime: new Date().toISOString(),
        status: 'checked_in'
      })
      
      const updatedEntry = { ...activeEntry, status: 'checked_in' as const, breakEndTime: new Date().toISOString() }
      setActiveEntry(updatedEntry)
    } catch (error) {
      console.error('Error ending break:', error)
    }
  }

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diff = end.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const getCurrentSessionDuration = () => {
    if (!activeEntry?.checkInTime) return '0h 0m'
    return formatDuration(activeEntry.checkInTime)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600">Track your work hours and breaks</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Current Time</div>
          <div className="text-xl font-mono font-bold">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Clock In/Out Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Timer className="w-5 h-5 mr-2" />
              Current Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeEntry ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-green-600">
                    {getCurrentSessionDuration()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Started at {new Date(activeEntry.checkInTime!).toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-2">
                  <Badge variant={activeEntry.status === 'on_break' ? 'secondary' : 'default'}>
                    {activeEntry.status === 'on_break' ? 'On Break' : 'Working'}
                  </Badge>
                </div>
                
                <div className="flex space-x-2">
                  {activeEntry.status === 'checked_in' ? (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleBreakStart}
                    >
                      <Coffee className="w-4 h-4 mr-2" />
                      Start Break
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleBreakEnd}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      End Break
                    </Button>
                  )}
                  
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={handleClockOut}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Clock Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-gray-500">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>You're not clocked in</p>
                </div>
                
                <Button 
                  onClick={handleClockIn}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Clock In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayShifts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No shifts scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayShifts.map((shift) => (
                  <div key={shift.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time Entries History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today" className="w-full">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="mt-4">
              {timeEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No time entries for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          entry.status === 'checked_out' ? 'bg-gray-400' :
                          entry.status === 'on_break' ? 'bg-yellow-400' :
                          'bg-green-400'
                        }`} />
                        <div>
                          <div className="font-medium">
                            {entry.checkInTime && new Date(entry.checkInTime).toLocaleTimeString()} - {' '}
                            {entry.checkOutTime ? new Date(entry.checkOutTime).toLocaleTimeString() : 'In Progress'}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            Office Location
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">
                          {entry.totalHours ? `${entry.totalHours}h` : formatDuration(entry.checkInTime!, entry.checkOutTime)}
                        </div>
                        <Badge variant={
                          entry.status === 'checked_out' ? 'outline' :
                          entry.status === 'on_break' ? 'secondary' :
                          'default'
                        }>
                          {entry.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="week" className="mt-4">
              <div className="text-center py-8 text-gray-500">
                <p>Weekly view coming soon</p>
              </div>
            </TabsContent>
            
            <TabsContent value="month" className="mt-4">
              <div className="text-center py-8 text-gray-500">
                <p>Monthly view coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}