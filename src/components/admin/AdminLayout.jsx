import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, ClipboardList, LayoutDashboard, Menu, Truck, Users, X } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Bookings', to: '/admin/bookings', icon: ClipboardList },
  { label: 'Drivers', to: '/admin/drivers', icon: Truck },
  { label: 'Agents', to: '/admin/agents', icon: Users },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 }
]

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const { user, role, signOut } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const userLabel = user?.user_metadata?.full_name || user?.email || 'Admin'
  const roleLabel = role === 'super_admin' ? 'Super Admin' : role === 'booking_agent' ? 'Booking Agent' : role === 'driver' ? 'Driver' : null

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {role !== 'driver' && (
          <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Jamupet Admin</span>
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                        isActive
                          ? 'bg-[#C5A059] text-white shadow-[0_8px_16px_rgba(197,160,89,0.2)]'
                          : 'text-gray-500 hover:bg-[#C5A059]/10 hover:text-[#C5A059]'
                      }`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>
          </aside>
        )}

        {role !== 'driver' && sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu overlay"
          />
        )}

        <div className={`flex-1 ${role !== 'driver' ? 'lg:ml-64' : ''}`}>
          <header className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-3">
              {role !== 'driver' && (
                <button
                  type="button"
                  className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              <h1 className="text-lg font-semibold text-gray-900">Jamupet Admin</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-gray-500">
                <span>{userLabel}</span>
                {roleLabel && (
                  <span className="rounded-full bg-[#C5A059]/10 px-2.5 py-1 text-[10px] text-[#C5A059]">
                    {roleLabel}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl bg-[#C5A059] px-4 py-2 text-xs font-bold tracking-wider uppercase text-white shadow-[0_4px_10px_rgba(197,160,89,0.2)] transition-transform hover:-translate-y-0.5"
              >
                Sign Out
              </button>
            </div>
          </header>

          <main className="px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
