import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader, Save } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuthContext } from "../context/AuthContext";

export default function ProfileSettingsPage() {
  const { user } = useAuthContext();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;

        setFullName(data?.full_name || user.user_metadata?.full_name || "");
        setPhone(data?.phone || "");
      } catch (err) {
        setStatus({ type: "error", message: err.message });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setStatus(null);

    try {
      const { error } = await supabase
        .from("user_profiles")
        .upsert(
          {
            id: user.id,
            email: user.email,
            full_name: fullName.trim() || null,
            phone: phone.trim() || null,
            updated_at: new Date().toISOString()
          },
          { onConflict: "id" }
        );

      if (error) throw error;

      setStatus({ type: "success", message: "Profile details updated successfully." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-[#FDFCFB] min-h-screen pt-32 pb-20 px-6 font-sans selection:bg-[#C5A059] selection:text-white">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-[0_12px_34px_rgba(15,23,42,0.06)] p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3 font-serif">Profile Settings</h1>
          <p className="text-gray-600 mb-6 font-light">Sign in to edit your profile details.</p>
          <Link to="/auth" className="inline-block px-8 py-3 bg-[#C5A059] text-white font-bold rounded-xl hover:bg-gray-900 transition-colors uppercase tracking-widest text-xs shadow-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFCFB] min-h-screen pt-32 pb-20 px-6 font-sans selection:bg-[#C5A059] selection:text-white">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_12px_34px_rgba(15,23,42,0.06)] p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif">Profile Settings</h1>
          <p className="text-gray-600 font-light text-sm">Manage your personal details used for luxury bookings.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_12px_34px_rgba(15,23,42,0.06)] p-12 flex flex-col items-center justify-center text-gray-500 gap-3">
            <Loader size={24} className="animate-spin text-[#C5A059]" />
            <p className="text-sm font-semibold">Loading profile...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-[0_12px_34px_rgba(15,23,42,0.06)] p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <input
                type="email"
                value={user.email || ""}
                disabled
                className="w-full rounded-xl px-4 py-3 border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all duration-300 hover:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
                className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all duration-300 hover:border-gray-400"
              />
            </div>

            {status && (
              <div className={`p-4 rounded-xl border ${status.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                <p className="text-sm font-medium">{status.message}</p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-3 bg-[#C5A059] text-white font-bold rounded-xl hover:bg-gray-900 disabled:opacity-50 transition-all uppercase tracking-widest text-xs shadow-lg"
              >
                {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

