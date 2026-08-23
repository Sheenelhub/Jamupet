import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInAdmin } from '../../lib/adminAuth'
import { useAdminAuth } from '../../context/AdminAuthContext'

const ROLE_ROUTES = {
  super_admin: '/admin',
  booking_agent: '/agent',
  driver: '/driver'
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const { role, loading: authLoading, error: globalError } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!authLoading && role) {
      const destination = ROLE_ROUTES[role] ?? '/admin/login'
      navigate(destination, { replace: true })
    }
  }, [authLoading, role, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setError(null)
      setLoading(true)
      const { role: resolvedRole } = await signInAdmin(email, password)
      const destination = ROLE_ROUTES[resolvedRole] ?? '/admin/login'
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid credentials. Access denied.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFCFB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A059] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium tracking-wide text-sm">LOADING ACCESS...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] px-4 font-sans selection:bg-[#C5A059] selection:text-white">
      <div className="w-full max-w-md bg-white shadow-[0_12px_34px_rgba(15,23,42,0.06)] border border-gray-100 rounded-2xl p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="h-14 w-14 rounded-full bg-[#C5A059] text-white flex items-center justify-center font-serif text-xl tracking-wider shadow-lg">
            JT
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-900 font-serif mb-1">Admin Portal</h1>
        <p className="text-sm text-gray-500 text-center font-light">
          Sign in to manage Jamupet premium operations.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-gray-500 mb-1.5" htmlFor="admin-email">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-all duration-300 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] hover:border-gray-400"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-gray-500 mb-1.5" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-all duration-300 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] hover:border-gray-400"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#C5A059] px-4 py-3.5 text-xs font-bold tracking-[0.2em] uppercase text-white shadow-[0_8px_16px_rgba(197,160,89,0.18)] transition-all hover:bg-[#1A1A1A] hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </div>
        </form>

        {(error || globalError) && (
          <p className="mt-4 text-sm text-red-600 text-center">
            {error || globalError}
          </p>
        )}
      </div>
    </div>
  )
}
