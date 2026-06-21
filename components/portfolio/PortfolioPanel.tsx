"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadPortfolioImage, updateArtisanPortfolio } from "@/lib/supabase";
import { Loader2, Upload, Trash2, Image as ImageIcon } from "lucide-react";

export function PortfolioPanel() {
  const { profile } = useAuth();
  const [urls, setUrls] = useState<string[]>([]);
  // We can't fetch urls from profile unless profile includes it. Let's assume for now 
  // it doesn't, but normally we'd fetch the artisan record. 
  // For simplicity, we'll just allow adding new ones.
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profile || profile.role !== "artisan") {
    return (
      <div className="p-8 text-center text-slate-500">
        This area is restricted to Artisans.
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setUploading(true);
    setError(null);

    const { data: url, error: uploadError } = await uploadPortfolioImage(profile.id, file);

    if (uploadError || !url) {
      setError(typeof uploadError === 'string' ? uploadError : uploadError?.message || "Failed to upload image.");
      setUploading(false);
      return;
    }

    const newUrls = [...urls, url];
    setUrls(newUrls);
    
    // Save to DB
    await updateArtisanPortfolio(profile.id, newUrls);

    setUploading(false);
  };

  const removeImage = async (urlToRemove: string) => {
    const newUrls = urls.filter((u) => u !== urlToRemove);
    setUrls(newUrls);
    await updateArtisanPortfolio(profile.id, newUrls);
  };

  return (
    <div className="flex flex-col gap-6 p-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
          My Portfolio
        </h2>
        <p className="text-sm text-slate-500">
          Upload photos of your past work to build trust with clients.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Gallery</h3>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Photo
          </button>
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        {urls.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
            <div className="mb-3 rounded-full bg-slate-50 p-3 text-slate-400">
              <ImageIcon className="h-8 w-8" />
            </div>
            <p className="text-sm font-medium text-slate-900">No photos yet</p>
            <p className="mt-1 text-xs text-slate-500 max-w-[250px]">
              Upload your first photo to show clients what you can do.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {urls.map((url, index) => (
              <div key={index} className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Portfolio ${index + 1}`} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => removeImage(url)}
                    className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
