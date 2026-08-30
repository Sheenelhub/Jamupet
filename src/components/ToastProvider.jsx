import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, { type = 'info', duration = 4000 } = {}) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id) => setToasts((t) => t.filter(x => x.id !== id)), [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{ minWidth: 260, maxWidth: 360, background: '#111', color: '#fff', padding: '10px 12px', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.2)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {toast.type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              ) : toast.type === 'error' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
              )}
            </div>
            <div style={{ flex: 1, fontSize: 14 }}>{toast.message}</div>
            <button onClick={() => removeToast(toast.id)} style={{ background: 'transparent', border: 'none', color: '#AAA', cursor: 'pointer' }}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
