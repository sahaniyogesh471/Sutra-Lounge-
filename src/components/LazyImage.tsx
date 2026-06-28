import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  /** When true, skips IntersectionObserver and loads immediately (use for above-the-fold images) */
  eager?: boolean;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  eager = false,
  ...props
}) => {
  const [isIntersected, setIsIntersected] = useState(eager);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${wrapperClassName}`}
      style={{ backgroundColor: 'rgba(245,238,223,0.6)', contain: 'layout paint', willChange: 'transform' }}
    >
      {/* Shimmer skeleton shown while loading */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'linear-gradient(90deg, #f5eedf 25%, #fdf8f0 50%, #f5eedf 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s ease-in-out infinite',
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
      {isIntersected && !hasError && (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onLoad={() => setIsLoaded(true)}
          onError={() => { setHasError(true); setIsLoaded(true); }}
          className={`transition-opacity duration-500 ease-out select-none ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
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
