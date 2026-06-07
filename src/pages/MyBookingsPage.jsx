import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Car, MapPin, Loader, Pencil, Save, X, Ban, RotateCcw, AlertCircle, CheckCircle, Users } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuthContext } from "../context/AuthContext";
import {
  createPaymentReference,
  formatKesFromCents,
  startPaystackCheckout
} from "../lib/paystack";
import { verifyPaymentServerSide } from "../lib/paymentVerification";
import { initiateMpesaStkPush, verifyMpesaReceipt } from "../lib/mpesa";
import { sendBookingEmail } from "../lib/emailService";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function addBusinessDays(date, businessDays) {
  const result = new Date(date);
  let added = 0;
  while (added < businessDays) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      added += 1;
    }
  }
  return result;
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function MyBookingsPage() {
  const { user } = useAuthContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [savingBookingId, setSavingBookingId] = useState(null);
	  const [processingRefundBookingId, setProcessingRefundBookingId] = useState(null);
	  const [processingReservationBookingId, setProcessingReservationBookingId] = useState(null);
	  const [processingFinalPaymentBookingId, setProcessingFinalPaymentBookingId] = useState(null);
  const [retryingVerificationBookingId, setRetryingVerificationBookingId] = useState(null);
	  const [mpesaReceiptInputs, setMpesaReceiptInputs] = useState({});
	  const [mpesaReceiptBookingId, setMpesaReceiptBookingId] = useState(null);
	  const [finalPaymentMethods, setFinalPaymentMethods] = useState({});
	  const [finalMpesaPhones, setFinalMpesaPhones] = useState({});
  const [editForm, setEditForm] = useState({
    pickup_location: "",
    destination_location: "",
    booking_date: "",
    pickup_time: "",
    vehicle_type: "",
    passengers: 1
  });

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const { data: bookingRows, error: queryError } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (queryError) throw queryError;

        const bookingIds = (bookingRows || []).map((b) => b.id);
        let paymentRows = [];
        if (bookingIds.length > 0) {
          const { data: paymentData, error: paymentError } = await supabase
            .from("payments")
            .select("booking_id, reference, created_at, status")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .in("booking_id", bookingIds)
            .order("created_at", { ascending: false });

          if (paymentError) throw paymentError;
          paymentRows = paymentData || [];
        }

        const latestPaymentByBooking = new Map();
        paymentRows.forEach((payment) => {
          if (!latestPaymentByBooking.has(payment.booking_id)) {
            latestPaymentByBooking.set(payment.booking_id, payment);
          }
        });

        const merged = (bookingRows || []).map((booking) => {
          const payment = latestPaymentByBooking.get(booking.id);
          return {
            ...booking,
            reservation_paid_at: payment?.created_at || null,
            reservation_reference: payment?.reference || null
          };
        });

        setBookings(merged);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user]);

  const cancellableBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          (booking.payment_status === "reservation_paid" || booking.payment_status === "paid") &&
          booking.status !== "cancelled" &&
          booking.reservation_paid_at &&
          new Date().getTime() - new Date(booking.reservation_paid_at).getTime() <= ONE_DAY_MS
      ),
    [bookings]
  );

  const canProcessRefund = (booking) => {
    if (
      booking.payment_status !== "paid" ||
      booking.status !== "cancelled" ||
      booking.refund_status === "refunded" ||
      booking.refund_status === "processing"
    ) {
      return false;
    }
    if (!booking.refund_eligible_at) return false;
    return new Date().getTime() >= new Date(booking.refund_eligible_at).getTime();
  };

  const beginEdit = (booking) => {
    setEditingBookingId(booking.id);
    setActionMessage(null);
    setEditForm({
      pickup_location: booking.pickup_location || "",
      destination_location: booking.destination_location || "",
      booking_date: booking.booking_date || "",
      pickup_time: booking.pickup_time || "",
      vehicle_type: booking.vehicle_type || "",
      passengers: booking.passengers || 1
    });
  };

  const cancelEdit = () => {
    setEditingBookingId(null);
    setSavingBookingId(null);
    setEditForm({
      pickup_location: "",
      destination_location: "",
      booking_date: "",
      pickup_time: "",
      vehicle_type: "",
      passengers: 1
    });
  };

  const saveBookingUpdate = async (bookingId) => {
    setSavingBookingId(bookingId);
    setActionMessage(null);
    try {
      const updates = {
        pickup_location: editForm.pickup_location.trim(),
        destination_location: editForm.destination_location.trim(),
        booking_date: editForm.booking_date,
        pickup_time: editForm.pickup_time,
        vehicle_type: editForm.vehicle_type.trim() || null,
        passengers: Number(editForm.passengers) || 1,
        updated_at: new Date().toISOString()
      };

      const { data, error: updateError } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", bookingId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...data } : b)));
      setActionMessage({ type: "success", message: "Booking updated successfully." });
      cancelEdit();
    } catch (err) {
      setActionMessage({ type: "error", message: `Unable to update booking: ${err.message}` });
      setSavingBookingId(null);
    }
  };

  const confirmMpesaReceipt = async (booking) => {
    const receipt = (mpesaReceiptInputs[booking.id] || "").trim();
    if (!receipt) {
      setActionMessage({
        type: "error",
        message: "Please enter the M-Pesa receipt code from your SMS to confirm payment."
      });
      return;
    }

    setMpesaReceiptBookingId(booking.id);
    setActionMessage(null);
    try {
      const stage = booking.payment_stage || "reservation";
      const response = await verifyMpesaReceipt(supabase, {
        bookingId: booking.id,
        receipt,
        paymentStage: stage
      });

      if (!response?.success) {
        throw new Error(response?.error || "M-Pesa receipt verification failed.");
      }

      const paymentStatus = stage === "final" ? "paid" : "reservation_paid";
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? {
                ...b,
                payment_status: paymentStatus,
                payment_method: "mpesa",
                payment_stage: stage,
                payment_reference: receipt
              }
            : b
        )
      );
      setActionMessage({
        type: "success",
        message: `Payment confirmed. M-Pesa receipt: ${receipt}.`
      });
      setMpesaReceiptInputs((prev) => ({ ...prev, [booking.id]: "" }));
    } catch (err) {
      setActionMessage({
        type: "error",
        message:
          "We couldn't find that receipt. Please check the code and try again, or retry the payment."
      });
    } finally {
      setMpesaReceiptBookingId(null);
    }
  };

  const cancelReservation = async (booking) => {
    const paidAt = booking.reservation_paid_at ? new Date(booking.reservation_paid_at).getTime() : null;
    const withinWindow = paidAt && new Date().getTime() - paidAt <= ONE_DAY_MS;
    if (!withinWindow) {
      setActionMessage({
        type: "error",
        message: "Cancellation window expired. Reservations can only be cancelled within 24 hours of payment."
      });
      return;
    }

    setSavingBookingId(booking.id);
    setActionMessage(null);
    try {
      const now = new Date();
      const refundEligibleAt = new Date(now.getTime() + ONE_DAY_MS);
      const refundDueAt = addBusinessDays(refundEligibleAt, 5);
      const { data, error: cancelError } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancellation_requested_at: now.toISOString(),
          refund_status: "pending",
          refund_eligible_at: refundEligibleAt.toISOString(),
          refund_due_at: refundDueAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", booking.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (cancelError) throw cancelError;

      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, ...data } : b)));
      setActionMessage({
        type: "success",
        message: `Reservation cancelled. Refund is scheduled after 24 hours and should complete within 5 business days (by ${refundDueAt.toLocaleDateString()}).`
      });
    } catch (err) {
      setActionMessage({ type: "error", message: `Unable to cancel reservation: ${err.message}` });
    } finally {
      setSavingBookingId(null);
    }
  };

  const processRefund = async (booking) => {
    if (!canProcessRefund(booking)) {
      setActionMessage({
        type: "error",
        message: "Refund is not yet eligible. It can only be processed after 24 hours from cancellation."
      });
      return;
    }

    setProcessingRefundBookingId(booking.id);
    setActionMessage(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("request-refund", {
        body: { bookingId: booking.id }
      });

      if (invokeError) {
        throw new Error(invokeError.message || "Failed to process refund request.");
      }
      if (!data?.success) {
        throw new Error(data?.error || "Refund request was not successful.");
      }

      if (data?.booking) {
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, ...data.booking } : b))
        );
      }

      setActionMessage({
        type: "success",
        message: data?.message || "Refund request submitted successfully."
      });
    } catch (err) {
      setActionMessage({
        type: "error",
        message: `Unable to process refund: ${err.message}`
      });
    } finally {
      setProcessingRefundBookingId(null);
    }
  };

	  const retryReservationVerification = async (booking) => {
    if (!booking.reservation_reference) {
      setActionMessage({ type: "error", message: "No reservation payment reference found." });
      return;
    }
    setRetryingVerificationBookingId(booking.id);
    setActionMessage(null);
    try {
      const result = await verifyPaymentServerSide(supabase, {
        reference: booking.reservation_reference,
        bookingId: booking.id,
        expectedAmount: booking.price_amount || 0,
        paymentStage: "reservation"
      });
      if (!result?.success) throw new Error(result?.error || "Verification failed.");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, payment_status: "reservation_paid", status: "confirmed" } : b
        )
      );
      setActionMessage({ type: "success", message: "Reservation payment verified successfully." });
    } catch (err) {
      setActionMessage({ type: "error", message: `Unable to verify reservation payment: ${err.message}` });
    } finally {
      setRetryingVerificationBookingId(null);
    }
	  };

	  const startReservationPayment = async (booking) => {
	    const reservationAmount = Number(booking.price_amount || 0);
	    if (reservationAmount <= 0) {
	      setActionMessage({ type: "error", message: "This booking is still waiting for a quote." });
	      return;
	    }

	    setProcessingReservationBookingId(booking.id);
	    setActionMessage(null);

	    const reference = createPaymentReference(booking.id);
	    try {
	      const { error: insertError } = await supabase.from("payments").insert({
	        booking_id: booking.id,
	        user_id: user.id,
	        amount: reservationAmount,
	        payment_method: "paystack_reservation",
	        reference,
	        status: "pending",
	        paystack_response: null
	      });

	      if (insertError) throw insertError;

	      startPaystackCheckout({
	        email: user.email,
	        amount: reservationAmount,
	        reference,
	        metadata: {
	          bookingId: booking.id,
	          userId: user.id,
	          paymentStage: "reservation"
	        },
	        onSuccess: async (transaction) => {
	          try {
	            const result = await verifyPaymentServerSide(supabase, {
	              reference,
	              bookingId: booking.id,
	              expectedAmount: reservationAmount,
	              paymentStage: "reservation",
	              checkoutResponse: transaction
	            });
	            if (!result?.success) throw new Error(result?.error || "Reservation payment verification failed.");

	            const paidAt = new Date().toISOString();
	            setBookings((prev) =>
	              prev.map((b) =>
	                b.id === booking.id
	                  ? {
	                      ...b,
	                      payment_status: "reservation_paid",
	                      status: "confirmed",
	                      reservation_reference: reference,
	                      reservation_paid_at: paidAt
	                    }
	                  : b
	              )
	            );
	            setActionMessage({ type: "success", message: "Reservation paid successfully. Your safari booking is confirmed." });

	            try {
	              await sendBookingEmail({
	                bookingId: booking.id,
	                userEmail: user.email,
	                userName: user.user_metadata?.full_name || user.email,
	                pickupLocation: booking.pickup_location,
	                destinationLocation: booking.destination_location,
	                pickupDate: booking.booking_date,
	                pickupTime: booking.pickup_time,
	                passengers: booking.passengers,
	                vehicleType: booking.vehicle_type,
	                serviceType: `${booking.service_category || "Trip"} (Reserved & Paid)`
	              });
	            } catch (emailErr) {
	              console.error("Reservation confirmation email failed:", emailErr);
	            }
	          } catch (err) {
	            setActionMessage({ type: "error", message: `Reservation payment completed but verification failed: ${err.message}` });
	          } finally {
	            setProcessingReservationBookingId(null);
	          }
	        },
	        onCancel: async () => {
	          await supabase
	            .from("payments")
	            .update({ status: "cancelled", updated_at: new Date().toISOString() })
	            .eq("reference", reference)
	            .eq("user_id", user.id);
	          setActionMessage({ type: "error", message: "Reservation payment was cancelled." });
	          setProcessingReservationBookingId(null);
	        }
	      });
	    } catch (err) {
	      setActionMessage({ type: "error", message: `Unable to start reservation payment: ${err.message}` });
	      setProcessingReservationBookingId(null);
	    }
	  };

	  const processFinalPayment = async (booking, method = "paystack") => {
    const totalPrice = Number(booking.total_price || 0);
    const reservationFee = Number(booking.price_amount || 0);
    const balanceDue = Math.max(totalPrice - reservationFee, 0);

    if (balanceDue <= 0) {
      setActionMessage({ type: "error", message: "No outstanding final payment for this booking." });
      return;
    }

    setProcessingFinalPaymentBookingId(booking.id);
    setActionMessage(null);

	    if (method === "mpesa") {
	      const phone = (finalMpesaPhones[booking.id] || "").trim();
	      if (!phone) {
	        setActionMessage({ type: "error", message: "Enter the M-Pesa phone number to continue." });
	        setProcessingFinalPaymentBookingId(null);
	        return;
	      }

	      try {
	        const response = await initiateMpesaStkPush(supabase, {
	          bookingId: booking.id,
	          amount: balanceDue,
	          phone,
	          paymentStage: "final"
	        });

	        if (!response?.success) {
	          throw new Error(response?.error || "Failed to initiate M-Pesa payment.");
	        }

	        setBookings((prev) =>
	          prev.map((b) =>
	            b.id === booking.id
	              ? {
	                  ...b,
	                  payment_status: "final_pending",
	                  payment_method: "mpesa",
	                  payment_stage: "final",
	                  payment_reference: response.reference || b.payment_reference
	                }
	              : b
	          )
	        );
	        setActionMessage({
	          type: "success",
	          message: "M-Pesa prompt sent. Complete the payment on your phone."
	        });
	      } catch (err) {
	        setActionMessage({ type: "error", message: `Unable to start M-Pesa payment: ${err.message}` });
	      } finally {
	        setProcessingFinalPaymentBookingId(null);
	      }
	      return;
	    }

	    const reference = createPaymentReference(`${booking.id}_final`);
	    try {
	      const { error: insertError } = await supabase.from("payments").insert({
	        booking_id: booking.id,
	        user_id: user.id,
	        amount: balanceDue,
	        payment_method: "paystack",
	        reference,
	        status: "pending",
	        paystack_response: null
	      });

      if (insertError) throw insertError;

      startPaystackCheckout({
        email: user.email,
        amount: balanceDue,
        reference,
        metadata: {
          bookingId: booking.id,
          userId: user.id,
          paymentStage: "final"
        },
        onSuccess: async (transaction) => {
          try {
            const result = await verifyPaymentServerSide(supabase, {
              reference,
              bookingId: booking.id,
              expectedAmount: balanceDue,
              paymentStage: "final",
              checkoutResponse: transaction
            });
            if (!result?.success) throw new Error(result?.error || "Final payment verification failed.");

            setBookings((prev) =>
              prev.map((b) => (b.id === booking.id ? { ...b, payment_status: "paid", status: "confirmed" } : b))
            );
            setActionMessage({
              type: "success",
              message: "Trip confirmed and final payment completed successfully."
            });

            try {
              await sendBookingEmail({
                bookingId: booking.id,
                userEmail: user.email,
                userName: user.user_metadata?.full_name || user.email,
                pickupLocation: booking.pickup_location,
                destinationLocation: booking.destination_location,
                pickupDate: booking.booking_date,
                pickupTime: booking.pickup_time,
                passengers: booking.passengers,
                vehicleType: booking.vehicle_type,
                serviceType: `${booking.service_category || "Trip"} (Fully Paid & Confirmed)`
              });
            } catch (emailErr) {
              console.error("Final payment confirmation email failed:", emailErr);
            }
          } catch (err) {
            setActionMessage({ type: "error", message: `Final payment completed but verification failed: ${err.message}` });
          } finally {
            setProcessingFinalPaymentBookingId(null);
          }
        },
        onCancel: async () => {
          await supabase
            .from("payments")
            .update({ status: "cancelled", updated_at: new Date().toISOString() })
            .eq("reference", reference)
            .eq("user_id", user.id);
          setActionMessage({ type: "error", message: "Final payment was cancelled." });
          setProcessingFinalPaymentBookingId(null);
        }
      });
    } catch (err) {
      setActionMessage({ type: "error", message: `Unable to start final payment: ${err.message}` });
      setProcessingFinalPaymentBookingId(null);
    }
  };
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 shadow-[0_12px_34px_rgba(15,23,42,0.06)] p-8 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[#C5A059]/10 rounded-full flex items-center justify-center mb-6">
            <Car size={32} className="text-[#C5A059]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">My Bookings</h1>
          <p className="text-gray-600 mb-6 max-w-sm">Sign in to track, update, or cancel your active and past bookings.</p>
          <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-3 bg-[#C5A059] hover:bg-[#1A1A1A] text-white font-semibold rounded-lg transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-[0_8px_16px_rgba(197,160,89,0.18)]">
            Sign In to Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">My Bookings</h1>
            <p className="text-gray-500 text-sm mt-1">Track all your confirmed, pending, and completed rides.</p>
          </div>
          {cancellableBookings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs font-medium text-amber-700 flex items-center gap-2 max-w-xs md:max-w-none shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              You can cancel paid reservations within 24 hours of payment.
            </div>
          )}
        </div>

        {actionMessage && (
          <div
            className={`rounded-xl p-4 mb-6 flex items-start gap-3 border shadow-[0_8px_20px_rgba(15,23,42,0.04)] ${
              actionMessage.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {actionMessage.type === "success" ? (
              <CheckCircle size={20} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
            )}
            <p className="text-sm font-medium">{actionMessage.message}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_12px_34px_rgba(15,23,42,0.06)] p-12 flex flex-col items-center justify-center text-gray-500 gap-3">
            <Loader size={24} className="animate-spin text-[#C5A059]" />
            <p className="text-sm font-semibold">Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700 shadow-sm max-w-2xl mx-auto">
            <AlertCircle size={32} className="mx-auto mb-3 text-red-600" />
            <h3 className="font-bold text-lg">Failed to Load Bookings</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_12px_34px_rgba(15,23,42,0.06)] p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Calendar size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No bookings yet</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">Ready to travel in style? Book your first premium transfer now.</p>
            <Link to="/booking" className="inline-flex items-center gap-2 px-6 py-3 bg-[#C5A059] hover:bg-[#1A1A1A] text-white font-semibold rounded-lg transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-[0_8px_16px_rgba(197,160,89,0.18)]">
              Create a Booking
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const statusClass =
                booking.status === "completed"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : booking.status === "cancelled"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-[#C5A059]/10 text-[#8B6B2E] border-[#C5A059]/20"

              const paymentStatusClass =
                booking.payment_status === "paid"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : booking.payment_status === "reservation_paid"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : booking.payment_status === "quote_ready"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : booking.payment_status === "awaiting_quote"
                        ? "bg-[#C5A059]/10 text-[#8B6B2E] border-[#C5A059]/20"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"

              return (
                <article key={booking.id} className="bg-white rounded-xl border border-gray-200 shadow-[0_12px_34px_rgba(15,23,42,0.06)] p-5 sm:p-6 md:p-8 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all duration-300 animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{booking.service_category || "Ride Booking"}</h2>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">ID: {booking.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded border uppercase tracking-wider ${statusClass}`}>
                        {booking.status || "pending"}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded border uppercase tracking-wider ${paymentStatusClass}`}>
                        {booking.payment_status || "unpaid"}
                      </span>
                    </div>
                  </div>

                  {editingBookingId === booking.id ? (
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4">
                      <h3 className="text-sm font-bold text-gray-900 mb-2">Revise Trip Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Pickup Location</label>
                          <input
                            type="text"
                            value={editForm.pickup_location}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, pickup_location: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Destination Location</label>
                          <input
                            type="text"
                            value={editForm.destination_location}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, destination_location: e.target.value }))
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                          <input
                            type="date"
                            value={editForm.booking_date}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, booking_date: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Time</label>
                          <input
                            type="time"
                            value={editForm.pickup_time}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, pickup_time: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Vehicle Type</label>
                          <input
                            type="text"
                            value={editForm.vehicle_type}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, vehicle_type: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Passengers</label>
                          <input
                            type="number"
                            min={1}
                            value={editForm.passengers}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, passengers: Number(e.target.value) || 1 }))
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 bg-white focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      
                      {/* Trip details grid */}
                      <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 sm:p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                              <MapPin size={16} className="text-blue-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-medium uppercase">Pickup</p>
                              <p className="font-semibold text-gray-900 mt-0.5">{booking.pickup_location}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                              <MapPin size={16} className="text-red-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-medium uppercase">Destination</p>
                              <p className="font-semibold text-gray-900 mt-0.5">{booking.destination_location}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                              <Calendar size={16} className="text-[#C5A059]" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-medium uppercase">Date & Time</p>
                              <p className="font-semibold text-gray-900 mt-0.5">{booking.booking_date} at {booking.pickup_time}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                              <Car size={16} className="text-gray-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-medium uppercase">Vehicle Type</p>
                              <p className="font-semibold text-gray-900 mt-0.5">{booking.vehicle_type || "Not specified"}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                              <Users size={16} className="text-gray-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-medium uppercase">Passengers</p>
                              <p className="font-semibold text-gray-900 mt-0.5">{booking.passengers || 1} pax</p>
                            </div>
                          </div>
                          {booking.duration && (
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                <Clock size={16} className="text-gray-500" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Duration</p>
                                <p className="font-semibold text-gray-900 mt-0.5">{booking.duration}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Summary sub-card */}
                      <div className="border-t border-gray-100 pt-5 mt-4">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Fare Breakdown</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                          <div>
                            <p className="text-xs text-gray-500">Reserved (20%)</p>
                            <div className="mt-1 font-bold text-gray-900">
                              {booking.payment_status === "awaiting_quote"
                                ? <span className="text-xs text-amber-600 font-semibold">Quote pending</span>
                                : booking.price_amount
                                  ? formatKesFromCents(booking.price_amount)
                                  : <span className="text-xs text-red-500 font-semibold">Not paid</span>}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total Price</p>
                            <div className="mt-1 font-bold text-gray-900">
                              {booking.total_price ? formatKesFromCents(Number(booking.total_price)) : <span className="text-xs text-gray-400 font-normal">Pending</span>}
                            </div>
                          </div>
                          {Number(booking.waiting_charge) > 0 && (
                            <div>
                              <p className="text-xs text-amber-700 font-medium">Waiting Charge</p>
                              <div className="mt-1 font-bold text-amber-700">
                                {formatKesFromCents(Number(booking.waiting_charge))}
                              </div>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-500">Outstanding Balance</p>
                            <div className="mt-1 font-bold text-gray-900">
                              {booking.total_price && booking.price_amount
                                ? formatKesFromCents(Math.max(Number(booking.total_price) - Number(booking.price_amount), 0))
                                : <span className="text-xs text-gray-400 font-normal">Pending</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cancellation & Refund Detail Panel */}
                      {booking.status === "cancelled" &&
                        (booking.payment_status === "reservation_paid" || booking.payment_status === "paid") && (
                        <div className="bg-red-50/50 rounded-xl border border-red-100 p-4 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-gray-500 font-semibold">Refund Status</p>
                            <p className="font-bold text-red-700 uppercase mt-0.5">{booking.refund_status || "pending"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-semibold">Refund Due By (5 business days)</p>
                            <p className="font-semibold text-gray-900 mt-0.5">{formatDateTime(booking.refund_due_at)}</p>
                          </div>
                          {booking.refund_processed_at && (
                            <div className="col-span-2">
                              <p className="text-gray-500 font-semibold">Refund Processed At</p>
                              <p className="font-semibold text-gray-900 mt-0.5">{formatDateTime(booking.refund_processed_at)}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Panel Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="text-xs text-gray-400">
                      {booking.reservation_reference && (
                        <p className="truncate max-w-[250px] sm:max-w-none">Ref: <span className="font-mono">{booking.reservation_reference}</span></p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {editingBookingId === booking.id ? (
                        <>
                          <button
                            type="button"
                            disabled={savingBookingId === booking.id}
                            onClick={() => saveBookingUpdate(booking.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C5A059] hover:bg-[#1A1A1A] text-white text-xs font-semibold rounded-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
                          >
                            {savingBookingId === booking.id ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <X size={14} />
                            Cancel Edit
                          </button>
                        </>
                      ) : (
                        <>
                          {booking.status !== "cancelled" && (
                            <button
                              type="button"
                              onClick={() => beginEdit(booking)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-xs font-semibold text-gray-700 hover:border-gray-950 rounded-lg transition-colors"
                            >
                              <Pencil size={14} />
                              Revise Booking
                            </button>
                          )}
                          {booking.payment_status === "reservation_paid" && booking.status !== "cancelled" && (
                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={finalPaymentMethods[booking.id] || "paystack"}
                                onChange={(event) =>
                                  setFinalPaymentMethods((prev) => ({
                                    ...prev,
                                    [booking.id]: event.target.value
                                  }))
                                }
                                className="border border-gray-300 bg-white rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-[#C5A059]"
                              >
                                <option value="paystack">Paystack (Card/Bank)</option>
                                <option value="mpesa">M-Pesa (STK Push)</option>
                              </select>
                              {finalPaymentMethods[booking.id] === "mpesa" && (
                                <input
                                  type="tel"
                                  value={finalMpesaPhones[booking.id] || ""}
                                  onChange={(event) =>
                                    setFinalMpesaPhones((prev) => ({
                                      ...prev,
                                      [booking.id]: event.target.value
                                    }))
                                  }
                                  placeholder="M-Pesa phone number"
                                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#C5A059]"
                                />
                              )}
                              <button
                                type="button"
                                disabled={processingFinalPaymentBookingId === booking.id}
                                onClick={() => processFinalPayment(booking, finalPaymentMethods[booking.id] || "paystack")}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50"
                              >
                                {processingFinalPaymentBookingId === booking.id ? (
                                  <Loader size={14} className="animate-spin" />
                                ) : (
                                  <Car size={14} />
                                )}
                                Pay Balance
                              </button>
                            </div>
                          )}
                          {booking.payment_status === "quote_ready" &&
                            booking.status !== "cancelled" &&
                            Number(booking.price_amount || 0) > 0 && (
                            <button
                              type="button"
                              disabled={processingReservationBookingId === booking.id}
                              onClick={() => startReservationPayment(booking)}
                              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#C5A059] hover:bg-[#1A1A1A] text-white text-xs font-semibold rounded-lg shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50"
                            >
                              {processingReservationBookingId === booking.id ? (
                                <Loader size={14} className="animate-spin" />
                              ) : (
                                <Car size={14} />
                              )}
                              Pay 20% Deposit
                            </button>
                          )}
                          {booking.payment_status === "awaiting_quote" && booking.status !== "cancelled" && (
                            <span className="inline-flex items-center px-4 py-2 bg-amber-50 text-xs font-semibold text-amber-700 rounded-lg border border-amber-200">
                              Waiting for Admin Quote
                            </span>
                          )}
                          {booking.payment_status === "unpaid" && booking.reservation_reference && booking.status !== "cancelled" && (
                            <button
                              type="button"
                              disabled={retryingVerificationBookingId === booking.id}
                              onClick={() => retryReservationVerification(booking)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 border border-amber-500 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {retryingVerificationBookingId === booking.id ? (
                                <Loader size={14} className="animate-spin" />
                              ) : (
                                <RotateCcw size={14} />
                              )}
                              Retry Verification
                            </button>
                          )}
                          {booking.payment_method === "mpesa" &&
                            ["reservation_pending", "final_pending"].includes(booking.payment_status) && (
                            <div className="w-full border border-amber-200 bg-amber-50/50 rounded-xl p-4 mt-3">
                              <p className="text-xs font-semibold text-amber-800">
                                Enter your M-Pesa receipt code to confirm instantly:
                              </p>
                              <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
                                <input
                                  type="text"
                                  value={mpesaReceiptInputs[booking.id] || ""}
                                  onChange={(event) =>
                                    setMpesaReceiptInputs((prev) => ({
                                      ...prev,
                                      [booking.id]: event.target.value
                                    }))
                                  }
                                  placeholder="e.g., QAY6F3P9XY"
                                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs focus:outline-none focus:border-[#C5A059]"
                                />
                                <button
                                  type="button"
                                  onClick={() => confirmMpesaReceipt(booking)}
                                  disabled={mpesaReceiptBookingId === booking.id}
                                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                                >
                                  {mpesaReceiptBookingId === booking.id && (
                                    <Loader size={12} className="animate-spin" />
                                  )}
                                  Confirm Receipt
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startReservationPayment(booking)}
                                  disabled={processingReservationBookingId === booking.id}
                                  className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-red-500 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {processingReservationBookingId === booking.id ? (
                                    <Loader size={12} className="animate-spin" />
                                  ) : (
                                    <RotateCcw size={12} />
                                  )}
                                  Retry Payment
                                </button>
                              </div>
                            </div>
                          )}
                          {booking.payment_status === "reservation_paid" &&
                            booking.status !== "cancelled" && (
                            <button
                              type="button"
                              disabled={savingBookingId === booking.id}
                              onClick={() => cancelReservation(booking)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-400 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {savingBookingId === booking.id ? (
                                <Loader size={14} className="animate-spin" />
                              ) : (
                                <Ban size={14} />
                              )}
                              Cancel Reservation (24h)
                            </button>
                          )}
                          {booking.payment_status === "paid" && booking.status === "cancelled" && (
                            <button
                              type="button"
                              disabled={processingRefundBookingId === booking.id || !canProcessRefund(booking)}
                              onClick={() => processRefund(booking)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#C5A059] text-xs font-semibold text-[#8B6B2E] hover:bg-[#C5A059]/10 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {processingRefundBookingId === booking.id ? (
                                <Loader size={14} className="animate-spin" />
                              ) : (
                                <RotateCcw size={14} />
                              )}
                              {canProcessRefund(booking) ? "Process Refund" : "Refund Available After 24h"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
