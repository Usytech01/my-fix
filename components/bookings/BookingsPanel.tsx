"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchUserBookings, updateBookingStatus } from "@/lib/supabase";
import type { Booking } from "@/lib/types";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { ReviewModal } from "../reviews/ReviewModal";

export function BookingsPanel() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function loadBookings() {
      if (!profile) return;
      setLoading(true);
      const { data, error } = await fetchUserBookings(profile.id, profile.role as "client" | "artisan");
      if (data) {
        setBookings(data as any as Booking[]);
      } else {
        console.error("Error loading bookings:", error);
      }
      setLoading(false);
    }
    loadBookings();
  }, [profile]);

  const handleUpdateStatus = async (bookingId: string, status: string, escrowStatus?: string) => {
    const { error } = await updateBookingStatus(bookingId, status, escrowStatus);
    if (!error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: status as any, escrow_status: escrowStatus as any ?? b.escrow_status } : b))
      );
    }
  };

  if (!profile) {
    return <div className="p-8 text-center text-slate-500">Please sign in to view bookings.</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            My Bookings
          </h2>
          <p className="text-sm text-slate-500">
            {profile.role === "client" ? "Manage your requested jobs." : "Manage your incoming jobs."}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-sm text-slate-500">No bookings found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {profile.role === "client" 
                      ? booking.artisan?.full_name 
                      : booking.client?.full_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Scheduled for: {new Date(booking.scheduled_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 capitalize">
                    {booking.status}
                  </span>
                  <span className="font-semibold text-slate-900">
                    ₦{booking.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                <span className="font-medium text-slate-900">Job Description:</span> {booking.job_description}
              </div>

              {/* Actions based on role and status */}
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.role === "artisan" && booking.status === "pending" && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(booking.id, "accepted")}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" /> Accept Job
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(booking.id, "rejected")}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <XCircle className="h-4 w-4" /> Decline
                    </button>
                  </>
                )}

                {profile.role === "client" && booking.status === "accepted" && (
                  <button 
                    onClick={() => handleUpdateStatus(booking.id, "paid", "held")}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                  >
                    Simulate Payment (Escrow)
                  </button>
                )}

                {profile.role === "artisan" && booking.status === "paid" && (
                  <button 
                    onClick={() => handleUpdateStatus(booking.id, "completed")}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}

                {profile.role === "client" && booking.status === "completed" && (
                  <button 
                    onClick={() => setReviewingBooking(booking)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                  >
                    Leave Review & Release Funds
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewingBooking && (
        <ReviewModal 
          booking={reviewingBooking} 
          onClose={() => setReviewingBooking(null)} 
          onSuccess={() => {
            handleUpdateStatus(reviewingBooking.id, "completed", "released");
            setReviewingBooking(null);
          }}
        />
      )}
    </div>
  );
}
