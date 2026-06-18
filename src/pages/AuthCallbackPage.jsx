import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Loader } from "lucide-react";

/**
 * Auth Callback Page
 * Handles the PKCE OAuth code exchange after Google/Facebook login.
 * The URL will contain a short-lived `code=` param (NOT tokens).
 * Supabase exchanges this code for a session securely, then we redirect.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase detects the `code` param and exchanges it for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) throw error;

        // Clean the URL (remove code param) and redirect to home
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err.message || "Authentication failed. Please try again.");
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white px-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-red-400 font-semibold mb-4">Login Error</p>
          <p className="text-white/70 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[#C5A059] text-black font-semibold rounded-lg hover:bg-white transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
      <Loader size={36} className="animate-spin text-[#C5A059] mb-4" />
      <p className="text-white/60 text-sm">Completing sign in…</p>
    </div>
  );
}
