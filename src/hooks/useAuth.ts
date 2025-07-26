import { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import type { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      if (state.user) {
        // Fetch user profile from our database
        try {
          const users = await blink.db.users.list({
            where: { userId: state.user.id },
            limit: 1
          })
          
          if (users.length > 0) {
            setCurrentUser(users[0] as User)
          } else {
            // Create user profile if doesn't exist
            const newUser = await blink.db.users.create({
              userId: state.user.id,
              email: state.user.email,
              firstName: state.user.email.split('@')[0],
              lastName: '',
              role: 'employee', // Default role
              isActive: true
            })
            setCurrentUser(newUser as User)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      } else {
        setCurrentUser(null)
      }
    })
    
    return unsubscribe
  }, [])

  const login = () => {
    blink.auth.login()
  }

  const logout = () => {
    blink.auth.logout()
    setCurrentUser(null)
  }

  return {
    user,
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }
}