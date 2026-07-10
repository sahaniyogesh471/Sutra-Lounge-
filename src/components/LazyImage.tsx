import React, { useState, useEffect, useRef } from 'react';
import { getLQIPForImage } from '../lqip-data';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  /** When true, skips IntersectionObserver and loads immediately (use for above-the-fold images) */
  eager?: boolean;
  /** Fallback image URL if primary fails to load */
  fallback?: string;
  /** Blur-up/placeholder image for progressive loading */
  blurDataUrl?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  eager = false,
  fallback,
  blurDataUrl,
  ...props
}) => {
  const [isIntersected, setIsIntersected] = useState(eager);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get LQIP blur placeholder (auto-detect from image URL if not provided)
  const lqipUrl = blurDataUrl || getLQIPForImage(src);

  useEffect(() => {
    if (eager) return;

    // IntersectionObserver not available (SSR / old browser) — load immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsIntersected(true);
          observer.disconnect();
        }
      },
      {
        // Pre-load images 600px before they enter viewport for instant visual appearance
        rootMargin: '600px 0px',
        threshold: 0,
      }
    );

    const el = containerRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  // Reset loaded state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setRetryCount(0);
    setCurrentSrc(src);
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-cream-soft ${wrapperClassName}`}
      style={{ backgroundColor: 'rgba(245,238,223,0.6)', contain: 'layout paint', willChange: 'transform' }}
    >
      {/* LQIP Blur Placeholder - shows instantly while full image loads */}
      {lqipUrl && !isLoaded && !hasError && (
        <img
          src={lqipUrl}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover blur-md transition-opacity duration-300"
          style={{ opacity: isIntersected ? 1 : 0 }}
          aria-hidden="true"
          decoding="async"
        />
      )}

      {/* Shimmer skeleton shown while loading - fast, lightweight */}
      {!isLoaded && !hasError && !lqipUrl && (
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(245,238,223,0.8) 0%, rgba(253,248,240,0.9) 50%, rgba(245,238,223,0.8) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.2s ease-in-out infinite',
          }}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-cream-deep/80">
          <span className="text-[10px] text-charcoal-muted/50 font-medium">Image unavailable</span>
        </div>
      )}

      {/* Actual image — only rendered once in viewport */}
      {isIntersected && (
        <>
          {!hasError && (
            <img
              src={currentSrc}
              alt={alt}
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              fetchPriority={eager ? 'high' : 'auto'}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onLoad={() => {
                setIsLoaded(true);
                setHasError(false);
              }}
              onError={() => {
                setIsLoaded(true);
                // Try fallback image if available and haven't tried yet
                if (fallback && currentSrc !== fallback && retryCount === 0) {
                  setCurrentSrc(fallback);
                  setRetryCount(1);
                  setIsLoaded(false);
                } else {
                  setHasError(true);
                }
              }}
              className={`transition-opacity duration-300 ease-out select-none w-full h-full ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              } ${className}`}
              {...props}
            />
          )}
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-cream-deep/50 text-charcoal-muted/60 text-xs font-medium gap-2 p-4">
              <span>Image Loading</span>
              <span className="text-[10px] opacity-75">Check connection</span>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};
