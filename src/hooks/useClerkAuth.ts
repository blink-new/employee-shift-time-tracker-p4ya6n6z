import { useUser, useAuth as useClerkAuthBase } from '@clerk/clerk-react'
import { getUserRole } from '../lib/clerk'
import { useMemo } from 'react'

export function useClerkAuth() {
  const { user, isLoaded: userLoaded } = useUser()
  const { isSignedIn, isLoaded: authLoaded } = useClerkAuthBase()

  const userRole = useMemo(() => {
    if (!user?.primaryEmailAddress?.emailAddress) return 'employee'
    return getUserRole(user.primaryEmailAddress.emailAddress)
  }, [user?.primaryEmailAddress?.emailAddress])

  const isLoaded = userLoaded && authLoaded

  return {
    user,
    isSignedIn: isSignedIn && !!user,
    isLoaded,
    userRole,
    email: user?.primaryEmailAddress?.emailAddress,
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user?.fullName,
    imageUrl: user?.imageUrl
  }
}