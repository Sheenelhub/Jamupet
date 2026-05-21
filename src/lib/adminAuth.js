import { supabase, supabaseAuth } from './supabase'

const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials. Access denied.'

const withTimeout = (promise, ms, errorMessage) => {
  let timeoutId
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage))
    }, ms)
  })
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId)
  })
}

export async function signInAdmin(email, password) {
  const { data, error } = await supabaseAuth.signInWithPassword({ email, password })
  if (error) {
    const normalizedMessage = error.message?.toLowerCase().includes('invalid login credentials')
      ? INVALID_CREDENTIALS_MESSAGE
      : error.message
    throw new Error(normalizedMessage)
  }

  const user = data?.user
  if (!user) {
    throw new Error(INVALID_CREDENTIALS_MESSAGE)
  }

  const queryPromise = supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('user_id', user.id)
    .maybeSingle()

  let queryResult
  try {
    queryResult = await withTimeout(
      queryPromise,
      5000,
      'Database verification query timed out. This is typically caused by a recursive Row Level Security (RLS) policy in the admin_users table in your Supabase database. Please ensure your RLS policy is non-recursive.'
    )
  } catch (err) {
    await supabaseAuth.signOut()
    throw new Error(err.message)
  }

  const { data: adminUser, error: adminError } = queryResult

  if (adminError) {
    await supabaseAuth.signOut()
    throw new Error(`Database error during admin verification: ${adminError.message}`)
  }

  if (!adminUser) {
    await supabaseAuth.signOut()
    throw new Error(`Access denied. No administrator record found for this account in the 'admin_users' table. Please ensure you inserted a row with the correct 'user_id' matching the Auth UUID (do not confuse the 'id' and 'user_id' columns).`)
  }

  const role = adminUser.role?.toLowerCase()
  const allowedRoles = ['super_admin', 'booking_agent', 'driver']
  if (!role || !allowedRoles.includes(role)) {
    await supabaseAuth.signOut()
    throw new Error(`Access denied. The role "${adminUser.role}" specified in the 'admin_users' table is invalid. Allowed roles are: ${allowedRoles.join(', ')}.`)
  }

  if (adminUser.is_active === false) {
    await supabaseAuth.signOut()
    throw new Error('Your account has been deactivated. Contact your administrator.')
  }

  return { user, role }
}

export async function signOutAdmin() {
  const { error } = await supabaseAuth.signOut()
  if (error) throw error
}

export async function getCurrentAdminRole() {
  const { data: { session }, error } = await supabaseAuth.getSession()
  if (error) throw error
  if (!session?.user) return null

  const { data, error: roleError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (roleError) throw roleError
  return data?.role ?? null
}
