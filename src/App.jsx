import React, { useState, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import ScrollToTop from "./components/ScrollToTop";
import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";
import SEO from "./components/SEO";

import Hero from "./components/Hero";
import ServiceSelector from "./components/ServiceSelector";
import AboutTeaser from "./components/AboutTeaser";
import Packages from "./components/Packages";
import Features from "./components/Features";

import CTA from "./components/CTA";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import BookingForm from "./components/BookingForm";
import AuthPage from './pages/AuthPage';
import Destination from "./pages/Destination";
import AboutPage from "./pages/AboutPage"; 
import Services from './pages/Services';

import BookingPage from "./pages/BookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import ResetPassword from "./pages/ResetPassword";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminHome from "./pages/admin/AdminHome";
import BookingsManagement from "./pages/admin/BookingsManagement";
import DriversManagement from "./pages/admin/DriversManagement";
import AgentsManagement from "./pages/admin/AgentsManagement";
import Analytics from "./pages/admin/Analytics";
import AgentHome from "./pages/admin/AgentHome";
import DriverTrips from "./pages/admin/DriverTrips";
import { ProtectedAdminRoute } from "./pages/admin/ProtectedAdminRoute";

// Added Accessibility Widget Import
import AccessibilityWidget from './components/AccessibilityWidget';

function AppContent({ isLoading }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Clean OAuth tokens from the URL using React Router (to prevent React Router from restoring them)
  useEffect(() => {
    if (location.hash.includes("access_token") || location.search.includes("code=")) {
      // Give Supabase a brief moment to process the tokens before wiping them
      const timer = setTimeout(() => {
        navigate({ pathname: location.pathname, hash: '' }, { replace: true });
        // Double check with native API just in case
        window.history.replaceState(null, '', window.location.pathname);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  const isAdminRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname === '/agent' ||
    location.pathname === '/driver';

  return (
    <div className={isLoading ? "h-screen overflow-hidden" : ""}>
      
      {/* GLOBAL PUBLIC COMPONENTS
        The Navbar and Accessibility Widget are placed here so they 
        persist across all non-admin pages without re-rendering. 
      */}
      {!isAdminRoute && (
        <>
          <div className="relative z-[1000]">
            <Navbar />
          </div>
          <AccessibilityWidget />
        </>
      )}

      <main className={`relative z-0 ${!isAdminRoute ? 'pt-24' : ''}`}>
        <Routes>
          <Route path="/" element={
            <>
              <SEO 
                title="Premium Airport Transfers & Safari Tours in Kenya"
                description="Experience seamless, reliable luxury transport in Kenya. From JKIA airport transfers to Maasai Mara safaris, Jamupet Transit offers executive chauffeur services."
                canonical="https://jamupettransit.com/"
              />
              <Hero />
              <ServiceSelector onSelectService={(id) => navigate('/booking', { state: { serviceType: id } })} />
              <AboutTeaser />
              <Packages />
              <Features /> 
              <FAQ/>
              <CTA />
            </>
          } />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/destinations" element={<Destination />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/profile" element={<ProfileSettingsPage />} />
          <Route path="/settings" element={<AccountSettingsPage />} />

          {/* ADMIN ROUTES */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute allowedRoles={["super_admin"]}>
                <AdminHome />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedAdminRoute allowedRoles={["super_admin", "booking_agent"]}>
                <BookingsManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/drivers"
            element={
              <ProtectedAdminRoute allowedRoles={["super_admin"]}>
                <DriversManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/agents"
            element={
              <ProtectedAdminRoute allowedRoles={["super_admin"]}>
                <AgentsManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedAdminRoute allowedRoles={["super_admin"]}>
                <Analytics />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/agent"
            element={
              <ProtectedAdminRoute allowedRoles={["booking_agent"]}>
                <AgentHome />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/driver"
            element={
              <ProtectedAdminRoute allowedRoles={["driver"]}>
                <DriverTrips />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <Router>
            <ScrollToTop />
            <Preloader isLoading={isLoading} />
            <AppContent isLoading={isLoading} />
          </Router>
        </AdminAuthProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
export default App;
