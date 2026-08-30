import React, { useEffect } from 'react'
import { supabaseAuth } from '../lib/supabase'
import React, { useEffect } from 'react'
import { useToast } from './ToastProvider'

// Google One Tap component
// Requires VITE_GOOGLE_CLIENT_ID in environment (.env.local)
export default function GoogleOneTap() {
  const toast = useToast()

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) return

    let cancelled = false

    const loadScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.accounts) return resolve()
        const s = document.createElement('script')
        s.src = 'https://accounts.google.com/gsi/client'
        s.async = true
        s.defer = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('Failed to load Google Identity script'))
        document.head.appendChild(s)
      })
    }

    const sendAnalytics = (eventName, payload = {}) => {
      // client-side analytics hook; adapt to your analytics provider
      try {
        if (window.dataLayer && typeof window.dataLayer.push === 'function') {
          window.dataLayer.push({ event: eventName, ...payload })
        } else if (window.gtag) {
          window.gtag('event', eventName, payload)
        }
      } catch (e) {
        // ignore
      }
      console.log('Analytics event:', eventName, payload)
    }

    const handleCredential = async (resp) => {
      try {
        const idToken = resp?.credential
        if (!idToken) {
          toast?.addToast('Google One Tap: no credential received', { type: 'error' })
          sendAnalytics('one_tap_signin_error', { reason: 'no_credential' })
          return
        }

        // Exchange Google ID token for Supabase session
        let result
        if (supabaseAuth?.signInWithIdToken) {
          result = await supabaseAuth.signInWithIdToken({ provider: 'google', id_token: idToken })
        } else if (supabaseAuth?.signInWithOAuth) {
          // fallback: open oauth flow (less ideal)
          result = await supabaseAuth.signInWithOAuth({ provider: 'google' })
        }

        // check result for errors
        if (result?.error) {
          console.error('OneTap sign-in error', result.error)
          toast?.addToast('Sign-in failed. Please try again.', { type: 'error' })
          sendAnalytics('one_tap_signin_error', { reason: result.error?.message || 'unknown' })
        } else {
          toast?.addToast('Signed in with Google', { type: 'success' })
          sendAnalytics('one_tap_signin_success', { method: 'one_tap' })
        }
      } catch (err) {
        console.error('OneTap sign-in exception', err)
        toast?.addToast('Sign-in error. Check console.', { type: 'error' })
        sendAnalytics('one_tap_signin_error', { reason: err?.message || 'exception' })
      }
    }

    loadScript()
      .then(() => {
        if (cancelled) return
        /* global google */
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredential,
          auto_select: false,
          cancel_on_tap_outside: true
        })

        // Render the One Tap prompt (no UI node required)
        window.google.accounts.id.prompt((notification) => {
          // notification: { isNotDisplayed, isSkippedMoment, isDismissedMoment }
          if (notification?.isNotDisplayed) {
            sendAnalytics('one_tap_prompt_not_displayed')
          } else if (notification?.isSkippedMoment) {
            sendAnalytics('one_tap_prompt_skipped')
          } else if (notification?.isDismissedMoment) {
            toast?.addToast('One Tap dismissed', { type: 'info' })
            sendAnalytics('one_tap_prompt_dismissed')
          } else {
            // prompt shown
            sendAnalytics('one_tap_prompt_shown')
          }
        })
      })
      .catch((err) => {
        console.error('Failed to init Google One Tap', err)
        toast?.addToast('Failed to initialize Google One Tap', { type: 'error' })
        sendAnalytics('one_tap_init_error', { reason: err?.message })
      })

    return () => {
      cancelled = true
      // hide the One Tap if needed
      try { window.google?.accounts?.id?.cancel() } catch (e) {}
    }
  }, [toast])

  return null
}
