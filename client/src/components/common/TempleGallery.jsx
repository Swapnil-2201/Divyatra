import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Images } from 'lucide-react';
import { TEMPLE_IMAGES } from '../../data/templeImages';

/**
 * TempleGallery
 * Displays the 3 gallery images for a temple.
 * Click any image to open a full-screen lightbox with prev/next navigation.
 */
export const TempleGallery = ({ templeId, templeName }) => {
  const gallery = TEMPLE_IMAGES[templeId]?.gallery;
  const [lightboxIndex, setLightboxIndex] = useState(null); // null = closed

  if (!gallery || gallery.length === 0) return null;

  const total = gallery.length;

  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () => setLightboxIndex((lightboxIndex - 1 + total) % total);
  const next = () => setLightboxIndex((lightboxIndex + 1) % total);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  return (
    <>
      {/* ── Gallery Grid ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Images className="w-4 h-4 text-[#E97820]" />
            <h3 className="text-sm font-semibold text-[#102A56]">
              Photo Gallery
            </h3>
            <span className="text-xs text-slate-400">— {total} photos</span>
          </div>
        </div>

        <div className={`grid gap-2.5 sm:gap-3 ${
          total === 1 ? 'grid-cols-1' :
          total === 2 ? 'grid-cols-1 sm:grid-cols-2' :
          'grid-cols-1 sm:grid-cols-3'
        }`}>
          {gallery.map((src, idx) => (
            <button
              key={idx}
              onClick={() => openLightbox(idx)}
              className={`group relative overflow-hidden rounded-xl bg-slate-100 border border-[#E5DED0] hover:border-[#E97820]/40 transition-all ${
                total === 3 && idx === 0 ? 'sm:col-span-2 sm:row-span-1' : ''
              }`}
              style={{ aspectRatio: total === 3 && idx === 0 ? '16/8' : '4/3' }}
              aria-label={`View photo ${idx + 1} of ${total}`}
            >
              <img
                src={src}
                alt={`${templeName} — photo ${idx + 1}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-[#102A56]/0 group-hover:bg-[#102A56]/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          role="dialog"
          aria-label="Image lightbox"
        >
          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={gallery[lightboxIndex]}
              alt={`${templeName} — photo ${lightboxIndex + 1}`}
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />

            {/* Caption */}
            <p className="text-center text-white/60 text-xs mt-3">
              {templeName} &mdash; {lightboxIndex + 1} / {total}
            </p>
          </div>

          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close gallery"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev */}
          {total > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next */}
          {total > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Dot indicators */}
          {total > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {gallery.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === lightboxIndex ? 'bg-[#E97820] scale-125' : 'bg-white/40'
                  }`}
                  aria-label={`Go to photo ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
