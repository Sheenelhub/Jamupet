import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Loader, LogOut } from "lucide-react";
import { supabaseAuth } from "../lib/supabase";
import { useAuthContext } from "../context/AuthContext";

export default function AccountSettingsPage() {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!password.trim()) {
      setStatus({ type: "error", message: "New password is required." });
      return;
    }
    if (password.length < 6) {
      setStatus({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabaseAuth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setConfirmPassword("");
      setStatus({ type: "success", message: "Password updated successfully." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  if (!user) {
    return (
      <div className="bg-[#FDFCFB] min-h-screen pt-32 pb-20 px-6 font-sans selection:bg-[#C5A059] selection:text-white">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-[0_12px_34px_rgba(15,23,42,0.06)] p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3 font-serif">Account Settings</h1>
          <p className="text-gray-600 mb-6 font-light">Sign in to manage your account.</p>
          <Link to="/auth" className="inline-block px-8 py-3 bg-[#C5A059] text-white font-bold rounded-xl hover:bg-gray-900 transition-colors uppercase tracking-widest text-xs shadow-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFCFB] min-h-screen pt-32 pb-20 px-6 font-sans selection:bg-[#C5A059] selection:text-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_12px_34px_rgba(15,23,42,0.06)] p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif">Account Settings</h1>
          <p className="text-gray-600 font-light text-sm">Manage your account security and session controls.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_12px_34px_rgba(15,23,42,0.06)] p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-500 font-semibold mb-1">Email</p>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold mb-1">User ID</p>
              <p className="text-gray-900 break-all font-mono text-xs bg-gray-50 p-2 rounded border border-gray-100 inline-block">{user.id}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="bg-white rounded-2xl border border-gray-100 shadow-[0_12px_34px_rgba(15,23,42,0.06)] p-8 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all duration-300 hover:border-gray-400"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all duration-300 hover:border-gray-400"
              placeholder="Confirm new password"
            />
          </div>

          {status && (
            <div className={`p-4 rounded-xl border ${status.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
              <p className="text-sm font-medium">{status.message}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-3 bg-[#C5A059] text-white font-bold rounded-xl hover:bg-gray-900 disabled:opacity-50 transition-all uppercase tracking-widest text-xs shadow-lg"
            >
              {isSaving ? <Loader size={16} className="animate-spin" /> : <KeyRound size={16} />}
              {isSaving ? "Updating..." : "Update Password"}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition-all uppercase tracking-widest text-xs"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

