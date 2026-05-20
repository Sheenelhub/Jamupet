import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseAuth } from '../lib/supabase'
import { signOutAdmin } from '../lib/adminAuth'

const AdminAuthContext = createContext(undefined)

/**
 * AdminAuthProvider component wraps your app to provide admin auth state globally
 * Usage: <AdminAuthProvider><App /></AdminAuthProvider>
 */
export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRole = async (userId) => {
    const { data, error: roleError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()

    if (roleError) throw roleError
    return data?.role ?? null
  }

  useEffect(() => {
    let isMounted = true

    const initAdminAuth = async () => {
      try {
        setError(null)
        setLoading(true)
        const { data: { session }, error: sessionError } = await supabaseAuth.getSession()
        if (sessionError) throw sessionError
        if (!isMounted) return
        if (!session?.user) {
          setUser(null)
          setRole(null)
          return
        }
        setUser(session.user)
        const resolvedRole = await fetchRole(session.user.id)
        if (!isMounted) return
        setRole(resolvedRole)
      } catch (err) {
        if (!isMounted) return
        setError(err.message)
        setUser(null)
        setRole(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initAdminAuth()

    const { data: { subscription } } = supabaseAuth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      try {
        setError(null)
        if (!session?.user) {
          setUser(null)
          setRole(null)
          return
        }
        setUser(session.user)
        const resolvedRole = await fetchRole(session.user.id)
        if (!isMounted) return
        setRole(resolvedRole)
      } catch (err) {
        if (!isMounted) return
        setError(err.message)
        setUser(null)
        setRole(null)
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      setError(null)
      await signOutAdmin()
      setUser(null)
      setRole(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return (
    <AdminAuthContext.Provider value={{ user, role, loading, error, signOut }}>
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
