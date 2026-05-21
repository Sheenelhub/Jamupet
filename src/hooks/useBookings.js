import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'

const STATUS_NORMALIZATION = {
  pending: 'new',
  new: 'new',
  assigned: 'assigned',
  confirmed: 'assigned',
  en_route: 'en_route',
  'en-route': 'en_route',
  enroute: 'en_route',
  in_transit: 'en_route',
  completed: 'completed',
  cancelled: 'cancelled'
}

const STATUS_LABELS = {
  new: 'New',
  assigned: 'Assigned',
  en_route: 'En Route',
  completed: 'Completed',
  cancelled: 'Cancelled'
}

const STATUS_BADGES = {
  new: 'bg-blue-100 text-blue-700',
  assigned: 'bg-amber-100 text-amber-700',
  en_route: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}

const resolveNestedValue = (obj, path) => {
  if (!obj) return undefined
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export const getFirstValue = (obj, paths, fallback = '') => {
  if (!obj) return fallback
  for (const path of paths) {
    const value = resolveNestedValue(obj, path)
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }
  return fallback
}

export const normalizeStatus = (status) => {
  const key = typeof status === 'string' ? status.toLowerCase() : ''
  return STATUS_NORMALIZATION[key] || key || 'new'
}

export const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status)
  return STATUS_LABELS[normalized] || normalized || 'Unknown'
}

export const getStatusBadgeClass = (status) => {
  const normalized = normalizeStatus(status)
  return STATUS_BADGES[normalized] || 'bg-gray-100 text-gray-700'
}

export const formatDateTime = (value) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString()
}

export const getBookingDateTimeValue = (booking) => {
  if (!booking) return null
  if (booking.pickup_datetime) return booking.pickup_datetime
  if (booking.booking_date) {
    const timeValue = booking.pickup_time || '00:00:00'
    return `${booking.booking_date}T${timeValue}`
  }
  return booking.created_at
}

export const formatCurrency = (valueInCents) => {
  if (valueInCents === undefined || valueInCents === null || valueInCents === '') return '—'
  const amountCents = Number(valueInCents)
  if (Number.isNaN(amountCents)) return valueInCents
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amountCents / 100)
}

/**
 * Custom hook for admin bookings operations
 */
export function useBookings() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchBookings = useCallback(async (filters = {}) => {
    try {
      setError(null)
      setLoading(true)
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false })

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters.serviceType && filters.serviceField) {
        query = query.eq(filters.serviceField, filters.serviceType)
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      const { data, error: queryError } = await query
      if (queryError) throw queryError

      if (!data || data.length === 0) return []

      // 1. Fetch user profiles for the bookings
      const userIds = [...new Set(data.map((b) => b.user_id).filter(Boolean))]
      let profiles = []
      if (userIds.length > 0) {
        const { data: pData } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, phone')
          .in('id', userIds)
        if (pData) profiles = pData
      }

      // 2. Fetch driver and agent assignments
      const bookingIds = data.map((b) => b.id)
      let assignments = []
      if (bookingIds.length > 0) {
        const { data: aData } = await supabase
          .from('booking_assignments')
          .select('booking_id, drivers(name), admin_users(name)')
          .in('booking_id', bookingIds)
        if (aData) assignments = aData
      }

      const profileMap = profiles.reduce((acc, p) => ({ ...acc, [p.id]: p }), {})
      const assignMap = assignments.reduce((acc, a) => ({ ...acc, [a.booking_id]: a }), {})

      const enrichedData = data.map((b) => {
        const profile = profileMap[b.user_id] || {}
        const assignment = assignMap[b.id] || {}
        
        let fallbackPhone = '—'
        if (b.notes && b.notes.includes('Phone:')) {
          const match = b.notes.match(/Phone:\s*([^\.]+)/)
          if (match && match[1]) fallbackPhone = match[1].trim()
        }

        return {
          ...b,
          customer_name: profile.full_name || 'Unknown',
          customer_email: profile.email || '—',
          customer_phone: profile.phone || fallbackPhone,
          driver_name: assignment.drivers?.name || 'Unassigned',
          agent_name: assignment.admin_users?.name || 'Unassigned'
        }
      })

      return enrichedData
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateBookingStatus = useCallback(async (bookingId, newStatus) => {
    try {
      setError(null)
      setLoading(true)
      const { data, error: updateError } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .maybeSingle()

      if (updateError) throw updateError
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const subscribeToBookings = useCallback((callback) => {
    const channel = supabase
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    loading,
    error,
    fetchBookings,
    updateBookingStatus,
    subscribeToBookings
  }
}
