import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  const [isIntersected, setIsIntersected] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If Intersection Observer is not supported, load immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersected(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '150px', // Start loading 150px before entering viewport
        threshold: 0.01,
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-cream-deep/60 ${wrapperClassName}`}
      id={`lazy-wrapper-${alt.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
    >
      {/* Premium Shimmer and Blur Background */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 z-0 flex items-center justify-center animate-pulse"
          style={{
            background: 'linear-gradient(110deg, #f5eedf 8%, #fbf7ef 18%, #f5eedf 33%)',
            backgroundSize: '200% 100%',
          }}
        >
          {/* Subtle gold center glowing element */}
          <div className="w-12 h-12 rounded-full bg-gold/5 blur-md" />
        </div>
      )}

      {/* Actual image with lazy-load animation */}
      {isIntersected && (
        <img
          src={src}
          alt={alt}
          onLoad={() => {
            setIsLoaded(true);
            setHasError(false);
          }}
          onError={() => {
            setHasError(true);
            setIsLoaded(false);
          }}
          loading="lazy"
          className={`transition-all duration-700 ease-out select-none
            ${isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-[1.02]'}
            ${className}`}
          {...props}
        />
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-cream-deep text-charcoal-muted text-xs font-medium text-center px-4">
          Image unavailable
        </div>
      )}
    </div>
  );
};
