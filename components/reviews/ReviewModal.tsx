"use client";

import { useState } from "react";
import type { Booking } from "@/lib/types";
import { submitReview } from "@/lib/supabase";
import { Star, Loader2, X } from "lucide-react";

interface ReviewModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({ booking, onClose, onSuccess }: ReviewModalProps) {
  const [quality, setQuality] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [professionalism, setProfessionalism] = useState(0);
  const [value, setValue] = useState(0);
  const [cleanliness, setCleanliness] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quality || !punctuality || !professionalism || !value || !cleanliness) {
      setError("Please provide a rating for all 5 dimensions.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: submitError } = await submitReview(
      booking.id,
      quality,
      punctuality,
      professionalism,
      value,
      cleanliness,
      comment
    );

    setSubmitting(false);

    if (submitError) {
      setError(typeof submitError === 'string' ? submitError : submitError.message);
    } else {
      onSuccess();
    }
  };

  const StarRating = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 transition-colors ${
              star <= value ? "text-amber-400" : "text-slate-200 hover:text-amber-200"
            }`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 font-display">Rate {booking.artisan?.full_name}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-sm text-slate-500 mb-6">
          Your feedback helps build trust in our community. Please rate the service provided.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <StarRating label="Quality of Work" value={quality} onChange={setQuality} />
          <StarRating label="Punctuality" value={punctuality} onChange={setPunctuality} />
          <StarRating label="Professionalism" value={professionalism} onChange={setProfessionalism} />
          <StarRating label="Value for Money" value={value} onChange={setValue} />
          <StarRating label="Cleanliness" value={cleanliness} onChange={setCleanliness} />

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Additional Comments</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[100px]"
              placeholder="How did the job go?"
            />
          </div>

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
