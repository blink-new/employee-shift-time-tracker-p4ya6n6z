import React, { useState } from 'react'
import { useSignIn } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft, Mail, Clock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const ForgotPassword: React.FC = () => {
  const { isLoaded, signIn } = useSignIn()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<'email' | 'code' | 'reset'>('email')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoaded) return
    
    setError('')
    setLoading(true)

    try {
      await signIn.create({
        identifier: email
      })

      const firstFactor = signIn.supportedFirstFactors.find(
        (factor) => factor.strategy === 'reset_password_email_code'
      ) as any

      if (firstFactor) {
        await signIn.prepareFirstFactor({
          strategy: 'reset_password_email_code',
          emailAddressId: firstFactor.emailAddressId
        })
        
        setSuccessMessage(`We've sent a reset code to ${email}`)
        setStep('code')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoaded) return
    
    setError('')
    setLoading(true)

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code
      })

      if (result.status === 'needs_new_password') {
        setStep('reset')
        setSuccessMessage('Code verified! Please set your new password.')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoaded) return
    
    setError('')
    setLoading(true)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      const result = await signIn.resetPassword({
        password: newPassword
      })

      if (result.status === 'complete') {
        setSuccessMessage('Password reset successfully! Redirecting to sign in...')
        setTimeout(() => {
          navigate('/sign-in')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              {step === 'email' && <Mail className="w-6 h-6 text-blue-600" />}
              {step === 'code' && <AlertCircle className="w-6 h-6 text-blue-600" />}
              {step === 'reset' && <Clock className="w-6 h-6 text-blue-600" />}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {step === 'email' && 'Reset Password'}
              {step === 'code' && 'Enter Verification Code'}
              {step === 'reset' && 'Set New Password'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {step === 'email' && 'Enter your email address to receive a reset code'}
              {step === 'code' && 'Check your email for the verification code'}
              {step === 'reset' && 'Create a new secure password for your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {successMessage && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </Button>
              </form>
            )}

            {step === 'code' && (
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('email')}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Email
                </Button>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => navigate('/sign-in')}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPassword