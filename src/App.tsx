import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider } from './components/auth/ClerkProvider'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { Schedule } from './pages/Schedule'
import { TimeTracking } from './pages/TimeTracking'
import { EmployeeManagement } from './pages/EmployeeManagement'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import { Toaster } from './components/ui/toaster'
import { useUser } from '@clerk/clerk-react'

function AppContent() {
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/sign-in" element={!isSignedIn ? <SignIn /> : <Navigate to="/" replace />} />
          <Route path="/sign-up" element={!isSignedIn ? <SignUp /> : <Navigate to="/" replace />} />
          <Route path="/forgot-password" element={!isSignedIn ? <ForgotPassword /> : <Navigate to="/" replace />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="time-tracking" element={<TimeTracking />} />
            <Route 
              path="employee-management" 
              element={
                <ProtectedRoute requiredRole="manager">
                  <EmployeeManagement />
                </ProtectedRoute>
              } 
            />
            <Route path="branches" element={<div className="p-8 text-center text-gray-500">Branches page coming soon</div>} />
            <Route 
              path="reports" 
              element={
                <ProtectedRoute requiredRole="manager">
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="settings" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          
          {/* Fallback for unauthenticated users */}
          <Route path="*" element={<Navigate to="/sign-in" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

function App() {
  return (
    <ClerkProvider>
      <AppContent />
    </ClerkProvider>
  )
}

export default App