import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { supabaseAuth } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSession, setHasSession] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadSession = async () => {
      try {
        const { data: { session } } = await supabaseAuth.getSession()
        if (isMounted) setHasSession(!!session)
      } catch {
        if (isMounted) setHasSession(false)
      }
    }

    loadSession()

    const { data: { subscription } } = supabaseAuth.onAuthStateChange((event, session) => {
      if (!isMounted) return
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setHasSession(!!session)
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const validateForm = () => {
    if (!password) return 'Password is required'
    if (password.length < 6) return 'Password must be at least 6 characters'
    if (password !== confirmPassword) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const { error: updateError } = await supabaseAuth.updateUser({ password })
      if (updateError) throw updateError
      await supabaseAuth.signOut()
      setSuccess('Password updated. You can now sign in with your new password.')
    } catch (err) {
      setError(err.message || 'Failed to update password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2a2a2a] to-[#B35A38] flex items-center justify-center px-4 sm:px-6 py-20">
      <div className="w-full max-w-md">
        <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden p-5 sm:p-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#B35A38]/20 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#C5A059]/20 rounded-full blur-3xl -z-10" />

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-[#B35A38] rounded-full flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-[#B35A38]/30">
                R
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Reset your password</h1>
            <p className="text-white/60 text-sm">Set a new password to continue.</p>
          </div>

          {hasSession === false && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">
                This reset link is invalid or expired. Please request a new one.
              </p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-3 mb-4">
              <CheckCircle size={18} className="text-emerald-300 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-100 text-sm">{success}</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-3 mb-4">
              <AlertCircle size={18} className="text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-white/60 mb-2 ml-1">
                <Lock size={14} /> New Password
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full p-4 bg-white/10 rounded-xl border transition-all outline-none text-white font-medium placeholder-white/40 border-white/20 focus:border-[#C5A059]"
                disabled={hasSession === false}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase text-white/60 mb-2 ml-1">
                <Lock size={14} /> Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full p-4 bg-white/10 rounded-xl border transition-all outline-none text-white font-medium placeholder-white/40 border-white/20 focus:border-[#C5A059]"
                disabled={hasSession === false}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || hasSession === false}
              className="w-full bg-[#B35A38] hover:bg-[#a04a2a] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-[#B35A38]/20"
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => navigate('/auth?mode=signin')}
              className="text-xs font-semibold text-[#C5A059] hover:underline"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
