import { useState, useEffect, useCallback } from 'react'
import { 
  Calendar, 
  Plus, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { blink } from '../blink/client'
import { useAuth } from '../hooks/useAuth'
import type { Shift, User, Branch, Department } from '../types'

export function Schedule() {
  const { currentUser } = useAuth()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [employees, setEmployees] = useState<User[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    employeeId: '',
    branchId: '',
    departmentId: '',
    startTime: '',
    endTime: '',
    breakDuration: 30,
    notes: ''
  })

  const loadScheduleData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load shifts for the selected week/month
      const startOfWeek = new Date(selectedDate)
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      const shiftsQuery: any = {
        orderBy: { startTime: 'asc' }
      }
      
      if (currentUser?.role === 'employee') {
        shiftsQuery.where = { employeeId: currentUser.id }
      }
      
      const [shiftsData, employeesData, branchesData, departmentsData] = await Promise.all([
        blink.db.shifts.list(shiftsQuery),
        currentUser?.role !== 'employee' ? blink.db.users.list({ where: { role: 'employee' } }) : [],
        blink.db.branches.list(),
        blink.db.departments.list()
      ])
      
      setShifts(shiftsData as Shift[])
      setEmployees(employeesData as User[])
      setBranches(branchesData as Branch[])
      setDepartments(departmentsData as Department[])
    } catch (error) {
      console.error('Error loading schedule data:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser, selectedDate])

  useEffect(() => {
    if (currentUser) {
      loadScheduleData()
    }
  }, [currentUser, selectedDate, loadScheduleData])

  const handleCreateShift = async () => {
    try {
      const startDateTime = new Date(`${formData.startTime}`)
      const endDateTime = new Date(`${formData.endTime}`)
      
      const shift = await blink.db.shifts.create({
        title: formData.title,
        employeeId: formData.employeeId,
        branchId: formData.branchId,
        departmentId: formData.departmentId || null,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        breakDuration: formData.breakDuration,
        notes: formData.notes,
        createdBy: currentUser?.id,
        status: 'scheduled'
      })
      
      setShifts(prev => [...prev, shift as Shift])
      setIsCreateModalOpen(false)
      setFormData({
        title: '',
        employeeId: '',
        branchId: '',
        departmentId: '',
        startTime: '',
        endTime: '',
        breakDuration: 30,
        notes: ''
      })
      
      // Create notification for employee
      await blink.db.notifications.create({
        userId: formData.employeeId,
        title: 'New Shift Assigned',
        message: `You have been assigned a new shift: ${formData.title}`,
        type: 'shift_assigned',
        relatedId: (shift as Shift).id
      })
    } catch (error) {
      console.error('Error creating shift:', error)
    }
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getShiftsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return shifts.filter(shift => shift.startTime.startsWith(dateStr))
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7))
    setSelectedDate(newDate)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const weekDays = getWeekDays()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600">Manage shifts and assignments</p>
        </div>
        
        {currentUser?.role !== 'employee' && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Shift</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Shift Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Morning Shift"
                  />
                </div>
                
                <div>
                  <Label htmlFor="employee">Employee</Label>
                  <Select value={formData.employeeId} onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Select value={formData.branchId} onValueChange={(value) => setFormData(prev => ({ ...prev, branchId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or instructions"
                  />
                </div>
                
                <Button onClick={handleCreateShift} className="w-full">
                  Create Shift
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
          Today
        </Button>
      </div>

      {/* Weekly Calendar View */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayShifts = getShiftsForDay(day)
          const isToday = day.toDateString() === new Date().toDateString()
          
          return (
            <Card key={index} className={`min-h-[200px] ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-center">
                  <div className="text-xs text-gray-500 uppercase">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg ${isToday ? 'text-blue-600 font-bold' : ''}`}>
                    {day.getDate()}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {dayShifts.map((shift) => {
                    const employee = employees.find(e => e.id === shift.employeeId)
                    return (
                      <div
                        key={shift.id}
                        className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs"
                      >
                        <div className="font-medium text-blue-900">{shift.title}</div>
                        <div className="text-blue-700 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(shift.startTime).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </div>
                        {employee && (
                          <div className="text-blue-600 flex items-center mt-1">
                            <Users className="w-3 h-3 mr-1" />
                            {employee.firstName} {employee.lastName}
                          </div>
                        )}
                        <Badge 
                          variant={
                            shift.status === 'completed' ? 'default' :
                            shift.status === 'in_progress' ? 'secondary' :
                            'outline'
                          }
                          className="mt-1 text-xs"
                        >
                          {shift.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    )
                  })}
                  
                  {dayShifts.length === 0 && (
                    <div className="text-center text-gray-400 py-4">
                      <Calendar className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs">No shifts</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Shift Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Week Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{shifts.length}</div>
              <div className="text-sm text-gray-600">Total Shifts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {shifts.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {shifts.filter(s => s.status === 'scheduled').length}
              </div>
              <div className="text-sm text-gray-600">Scheduled</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}