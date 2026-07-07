"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadPortfolioImage, updateArtisanPortfolio, fetchArtisanDetails } from "@/lib/supabase";
import { Loader2, Upload, Trash2, Image as ImageIcon } from "lucide-react";

export function PortfolioPanel() {
  const { profile, bypassMode } = useAuth();
  const [urls, setUrls] = useState<string[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing portfolio images on mount
  useEffect(() => {
    if (!profile || profile.role !== "artisan") {
      setLoadingGallery(false);
      return;
    }

    async function loadGallery() {
      setLoadingGallery(true);
      try {
        if (bypassMode) {
          // In demo mode, restore from localStorage
          const saved = localStorage.getItem(`myfix_portfolio_${profile!.id}`);
          if (saved) {
            setUrls(JSON.parse(saved));
          }
        } else {
          // Live Supabase mode
          const { data } = await fetchArtisanDetails(profile!.id);
          if (data?.portfolio_urls && Array.isArray(data.portfolio_urls)) {
            setUrls(data.portfolio_urls);
          }
        }
      } catch (e) {
        console.error("Failed to load portfolio:", e);
      } finally {
        setLoadingGallery(false);
      }
    }

    loadGallery();
  }, [profile, bypassMode]);

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

    if (bypassMode) {
      // Demo mode: create an object URL as a placeholder
      const objectUrl = URL.createObjectURL(file);
      const newUrls = [...urls, objectUrl];
      setUrls(newUrls);
      localStorage.setItem(`myfix_portfolio_${profile!.id}`, JSON.stringify(newUrls));
      setUploading(false);
      return;
    }

    const { data: url, error: uploadError } = await uploadPortfolioImage(profile!.id, file);

    if (uploadError || !url) {
      setError(typeof uploadError === 'string' ? uploadError : (uploadError as any)?.message || "Failed to upload image.");
      setUploading(false);
      return;
    }

    const newUrls = [...urls, url];
    setUrls(newUrls);
    // Save to DB
    await updateArtisanPortfolio(profile!.id, newUrls);
    setUploading(false);
  };

  const removeImage = async (urlToRemove: string) => {
    const newUrls = urls.filter((u) => u !== urlToRemove);
    setUrls(newUrls);
    if (bypassMode) {
      localStorage.setItem(`myfix_portfolio_${profile!.id}`, JSON.stringify(newUrls));
    } else {
      await updateArtisanPortfolio(profile!.id, newUrls);
    }
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
            disabled={uploading || loadingGallery}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Photo
          </button>
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        {loadingGallery ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <p className="mt-3 text-sm text-slate-500">Loading your portfolio...</p>
          </div>
        ) : urls.length === 0 ? (
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
