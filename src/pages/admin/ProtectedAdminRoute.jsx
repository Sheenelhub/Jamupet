import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentAdminRole } from '../../lib/adminAuth'

/**
 * Protects admin routes based on allowedRoles
 */
export function ProtectedAdminRoute({ children, allowedRoles = [] }) {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadRole = async () => {
      try {
        setLoading(true)
        const currentRole = await getCurrentAdminRole()
        if (!isMounted) return
        setRole(currentRole)
      } catch (err) {
        if (!isMounted) return
        setRole(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadRole()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B35A38] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/isAdmin" replace />
  }

  return children
}
