import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Switch } from '../components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { 
  Settings as SettingsIcon, 
  Building, 
  Users, 
  Bell, 
  Shield, 
  Clock, 
  Globe,
  Plus,
  Trash2,
  Edit
} from 'lucide-react'

export function Settings() {
  const [branches, setBranches] = useState([
    { id: '1', name: 'Downtown Branch', address: '123 Main St, Downtown', manager: 'Sarah Wilson', employees: 12 },
    { id: '2', name: 'Uptown Branch', address: '456 Oak Ave, Uptown', manager: 'Ahmad Sheikh', employees: 8 },
    { id: '3', name: 'Central Branch', address: '789 Pine Rd, Central', manager: 'John Doe', employees: 4 }
  ])

  const [departments, setDepartments] = useState([
    { id: '1', name: 'Operations', employees: 8, color: 'bg-blue-500' },
    { id: '2', name: 'Sales', employees: 6, color: 'bg-green-500' },
    { id: '3', name: 'Marketing', employees: 5, color: 'bg-purple-500' },
    { id: '4', name: 'Support', employees: 5, color: 'bg-orange-500' }
  ])

  const [notifications, setNotifications] = useState({
    shiftReminders: true,
    lateCheckIn: true,
    overtimeAlerts: true,
    weeklyReports: false,
    systemUpdates: true
  })

  const [workSettings, setWorkSettings] = useState({
    standardHours: '8',
    overtimeThreshold: '40',
    breakDuration: '30',
    timezone: 'America/New_York',
    weekStart: 'monday'
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure your workforce management system</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <SettingsIcon className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Work Hours & Time Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="standardHours">Standard Work Hours per Day</Label>
                  <Input
                    id="standardHours"
                    value={workSettings.standardHours}
                    onChange={(e) => setWorkSettings({...workSettings, standardHours: e.target.value})}
                    placeholder="8"
                  />
                </div>
                <div>
                  <Label htmlFor="overtimeThreshold">Overtime Threshold (hours/week)</Label>
                  <Input
                    id="overtimeThreshold"
                    value={workSettings.overtimeThreshold}
                    onChange={(e) => setWorkSettings({...workSettings, overtimeThreshold: e.target.value})}
                    placeholder="40"
                  />
                </div>
                <div>
                  <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                  <Input
                    id="breakDuration"
                    value={workSettings.breakDuration}
                    onChange={(e) => setWorkSettings({...workSettings, breakDuration: e.target.value})}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="weekStart">Week Starts On</Label>
                  <Select value={workSettings.weekStart} onValueChange={(value) => setWorkSettings({...workSettings, weekStart: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-blue-600" />
                Regional Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={workSettings.timezone} onValueChange={(value) => setWorkSettings({...workSettings, timezone: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branches */}
        <TabsContent value="branches" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-600" />
                Branch Management
              </CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Branch
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {branches.map((branch) => (
                  <div key={branch.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                        <p className="text-sm text-gray-500">{branch.address}</p>
                        <p className="text-sm text-gray-500">Manager: {branch.manager}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {branch.employees} employees
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments */}
        <TabsContent value="departments" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Department Management
              </CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${dept.color}`}></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                        <p className="text-sm text-gray-500">{dept.employees} employees</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-blue-600" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Shift Reminders</h4>
                    <p className="text-sm text-gray-500">Send reminders before shifts start</p>
                  </div>
                  <Switch
                    checked={notifications.shiftReminders}
                    onCheckedChange={(checked) => setNotifications({...notifications, shiftReminders: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Late Check-in Alerts</h4>
                    <p className="text-sm text-gray-500">Alert managers when employees are late</p>
                  </div>
                  <Switch
                    checked={notifications.lateCheckIn}
                    onCheckedChange={(checked) => setNotifications({...notifications, lateCheckIn: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Overtime Alerts</h4>
                    <p className="text-sm text-gray-500">Notify when employees approach overtime</p>
                  </div>
                  <Switch
                    checked={notifications.overtimeAlerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, overtimeAlerts: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Weekly Reports</h4>
                    <p className="text-sm text-gray-500">Receive weekly summary reports</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => setNotifications({...notifications, weeklyReports: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">System Updates</h4>
                    <p className="text-sm text-gray-500">Get notified about system updates</p>
                  </div>
                  <Switch
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) => setNotifications({...notifications, systemUpdates: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Security & Access Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Admin Emails</h4>
                  <p className="text-sm text-gray-500 mb-3">Users with these email addresses will have admin access</p>
                  <div className="space-y-2">
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      kai.jiabo.feng@gmail.com (Admin)
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Manager Emails</h4>
                  <p className="text-sm text-gray-500 mb-3">Users with these email addresses will have manager access</p>
                  <div className="space-y-2">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      ahmadxeikh786@gmail.com (Manager)
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Session Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input id="sessionTimeout" defaultValue="480" />
                    </div>
                    <div>
                      <Label htmlFor="maxSessions">Max Concurrent Sessions</Label>
                      <Input id="maxSessions" defaultValue="3" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}