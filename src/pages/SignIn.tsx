import React, { useState } from 'react'
import { useSignIn } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Building2, Clock, Users, Shield, UserCheck, User, Eye, EyeOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const SignIn: React.FC = () => {
  const { isLoaded, signIn, setActive } = useSignIn()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    emailAddress: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Role detection based on email
  const getUserRole = (email: string) => {
    if (email === 'kai.jiabo.feng@gmail.com') return 'admin'
    if (email === 'ahmadxeikh786@gmail.com') return 'manager'
    return 'employee'
  }

  const getRoleInfo = (email: string) => {
    const role = getUserRole(email)
    switch (role) {
      case 'admin':
        return {
          role: 'Admin',
          icon: <Shield className="w-4 h-4" />,
          color: 'bg-red-100 text-red-800 border-red-200',
          description: 'Full system access'
        }
      case 'manager':
        return {
          role: 'Manager',
          icon: <UserCheck className="w-4 h-4" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          description: 'Team oversight'
        }
      default:
        return {
          role: 'Employee',
          icon: <User className="w-4 h-4" />,
          color: 'bg-green-100 text-green-800 border-green-200',
          description: 'Personal dashboard'
        }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoaded) return
    
    setError('')
    setLoading(true)

    try {
      const result = await signIn.create({
        identifier: formData.emailAddress,
        password: formData.password
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        
        // Redirect based on role
        const role = getUserRole(formData.emailAddress)
        if (role === 'admin') {
          navigate('/settings')
        } else if (role === 'manager') {
          navigate('/employee-management')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const roleInfo = getRoleInfo(formData.emailAddress)

  // Demo accounts for easy testing
  const demoAccounts = [
    {
      email: 'kai.jiabo.feng@gmail.com',
      role: 'Admin',
      icon: <Shield className="w-4 h-4" />,
      color: 'bg-red-100 text-red-800 border-red-200'
    },
    {
      email: 'ahmadxeikh786@gmail.com',
      role: 'Manager',
      icon: <UserCheck className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ShiftTracker Pro</h1>
                <p className="text-gray-600">Smart Workforce Management</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Team Management</h3>
                <p className="text-gray-600 text-sm">Streamline workforce scheduling and attendance tracking</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Real-time Tracking</h3>
                <p className="text-gray-600 text-sm">Monitor clock-ins, breaks, and productivity in real-time</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Multi-Branch Support</h3>
                <p className="text-gray-600 text-sm">Manage multiple locations from a single dashboard</p>
              </div>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <h4 className="font-semibold text-gray-900 mb-3">Demo Accounts</h4>
            <div className="space-y-2">
              {demoAccounts.map((account) => (
                <div key={account.email} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{account.email}</span>
                  <Badge variant="outline" className={`${account.color} flex items-center space-x-1`}>
                    {account.icon}
                    <span>{account.role}</span>
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your workforce management account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="emailAddress">Email Address</Label>
                <Input
                  id="emailAddress"
                  name="emailAddress"
                  type="email"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                />
                {formData.emailAddress && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className={`${roleInfo.color} flex items-center space-x-1`}>
                      {roleInfo.icon}
                      <span>{roleInfo.role}</span>
                    </Badge>
                    <span className="text-xs text-gray-500">{roleInfo.description}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/sign-up')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up here
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SignIn