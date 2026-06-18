import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";

/**
 * Auth Callback Page
 * For implicit flow SPAs, Supabase's detectSessionInUrl handles the token
 * extraction automatically. This page just shows a brief spinner while
 * the session is established, then redirects home.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase (with detectSessionInUrl: true) automatically processes
    // the #access_token hash before this component even mounts.
    // We just need to wait a moment then redirect cleanly.
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 1200);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
      <Loader size={36} className="animate-spin text-[#C5A059] mb-4" />
      <p className="text-white/60 text-sm">Completing sign in…</p>
    </div>
  );
}
