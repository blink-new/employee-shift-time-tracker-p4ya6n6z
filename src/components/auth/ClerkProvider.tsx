import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react'
import { ReactNode } from 'react'

const PUBLISHABLE_KEY = import.meta.env.VITE_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_ZXZpZGVudC1tYW1tb3RoLTUxLmNsZXJrLmFjY291bnRzLmRldiQ'

console.log('Clerk Publishable Key:', PUBLISHABLE_KEY ? 'Found' : 'Missing')

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

interface ClerkProviderProps {
  children: ReactNode
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  try {
    return (
      <BaseClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
            card: 'shadow-lg border border-gray-200',
            headerTitle: 'text-gray-900 font-semibold',
            headerSubtitle: 'text-gray-600',
            socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
            formFieldInput: 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500',
            footerActionLink: 'text-blue-600 hover:text-blue-700'
          },
          variables: {
            colorPrimary: '#2563eb',
            colorText: '#374151',
            colorTextSecondary: '#6b7280',
            colorBackground: '#ffffff',
            colorInputBackground: '#ffffff',
            colorInputText: '#374151',
            borderRadius: '0.5rem'
          }
        }}
      >
        {children}
      </BaseClerkProvider>
    )
  } catch (error) {
    console.error('Clerk Provider Error:', error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">There was an issue initializing the authentication system.</p>
          <p className="text-sm text-gray-500">Please check your Clerk configuration.</p>
        </div>
      </div>
    )
  }
}