import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Car, MapPin, Loader } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuthContext } from "../context/AuthContext";

export default function MyBookingsPage() {
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const { data, error: queryError } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (queryError) throw queryError;
        setBookings(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto border border-gray-300 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">My Bookings</h1>
          <p className="text-gray-600 mb-6">Sign in to view your active and past bookings.</p>
          <Link to="/auth" className="inline-block px-6 py-3 bg-[#B35A38] text-white font-semibold hover:bg-[#8B4225] transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="border border-gray-300 p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Track all your confirmed, pending, and completed rides.</p>
        </div>

        {loading ? (
          <div className="border border-gray-300 p-8 flex items-center gap-3 text-gray-700">
            <Loader size={18} className="animate-spin" />
            Loading bookings...
          </div>
        ) : error ? (
          <div className="border border-red-400 bg-red-50 p-8 text-red-700">
            Failed to load bookings: {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="border border-gray-300 p-8">
            <p className="text-gray-700 mb-4">No bookings yet.</p>
            <Link to="/booking" className="inline-block px-6 py-3 bg-[#B35A38] text-white font-semibold hover:bg-[#8B4225] transition-colors">
              Create a Booking
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <article key={booking.id} className="border border-gray-300 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{booking.service_category || "Ride Booking"}</h2>
                  <span className="px-3 py-1 text-sm font-semibold border border-gray-300 bg-gray-100 text-gray-800 uppercase">
                    {booking.status || "pending"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin size={17} className="text-[#B35A38] mt-0.5" />
                    <div>
                      <p className="text-gray-500">Pickup</p>
                      <p className="font-semibold text-gray-900">{booking.pickup_location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={17} className="text-[#B35A38] mt-0.5" />
                    <div>
                      <p className="text-gray-500">Destination</p>
                      <p className="font-semibold text-gray-900">{booking.destination_location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar size={17} className="text-[#B35A38] mt-0.5" />
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-semibold text-gray-900">{booking.booking_date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={17} className="text-[#B35A38] mt-0.5" />
                    <div>
                      <p className="text-gray-500">Time</p>
                      <p className="font-semibold text-gray-900">{booking.pickup_time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Car size={17} className="text-[#B35A38] mt-0.5" />
                    <div>
                      <p className="text-gray-500">Vehicle</p>
                      <p className="font-semibold text-gray-900">{booking.vehicle_type || "Not specified"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500">Booking ID</p>
                    <p className="font-semibold text-gray-900 break-all">{booking.id}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

