import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabaseAuth } from '../lib/supabase'
import { getAdminProfile, signOutAdmin } from '../lib/adminAuth'

const AdminAuthContext = createContext(undefined)

/**
 * AdminAuthProvider component wraps your app to provide admin auth state globally
 * Usage: <AdminAuthProvider><App /></AdminAuthProvider>
 */
export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [adminId, setAdminId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Use a ref to track the active fetch user ID to deduplicate parallel requests and prevent race conditions.
  const activeFetchUserIdRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    const handleSession = async (session) => {
      if (!isMounted) return

      const sessionUser = session?.user ?? null

      if (!sessionUser) {
        setUser(null)
        setRole(null)
        setAdminId(null)
        activeFetchUserIdRef.current = null
        if (isMounted) setLoading(false)
        return
      }

      const userId = sessionUser.id
      // If we are already fetching or have fetched for this user ID, skip to avoid duplicate requests
      if (activeFetchUserIdRef.current === userId) {
        if (isMounted) setLoading(false)
        return
      }

      activeFetchUserIdRef.current = userId
      if (isMounted) {
        setLoading(true)
        setError(null)
      }

      try {
        const { adminUser, role: resolvedRole } = await getAdminProfile()
        if (!isMounted) return

        setUser(sessionUser)
        setRole(resolvedRole)
        setAdminId(adminUser?.id ?? null)
      } catch (err) {
        if (!isMounted) return
        console.warn('Admin profile verification failed:', err)
        activeFetchUserIdRef.current = null
        setUser(null)
        setRole(null)
        setAdminId(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    // Check initial session
    supabaseAuth.getSession().then(({ data: { session } }) => {
      handleSession(session)
    }).catch(err => {
      console.warn('Initial session check failed:', err)
      if (isMounted) setLoading(false)
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabaseAuth.onAuthStateChange(async (_event, session) => {
      handleSession(session)
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    // Optimistically clear all local React states and active fetch refs instantly
    setUser(null)
    setRole(null)
    setAdminId(null)
    setError(null)
    activeFetchUserIdRef.current = null
    setLoading(false)

    // Execute background network sign-out so that the user session is successfully ended on Supabase without blocking the UI
    try {
      await signOutAdmin()
    } catch (err) {
      console.warn('Supabase signout failed in background:', err)
    }
  }

  return (
    <AdminAuthContext.Provider value={{ user, role, adminId, loading, error, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

/**
 * Custom hook to access admin auth state throughout your app
 */
export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
