import { useEffect, useRef, useState } from "react";

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: string;
  aspectRatio?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  srcSet?: string;
}

export function ImageLoader({
  src,
  alt,
  className = "",
  fallbackIcon = "fas fa-image",
  aspectRatio = "aspect-square",
  priority = false,
  width = 400,
  height = 400,
  sizes,
  srcSet,
}: ImageLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState(!priority);
  const [hasError, setHasError] = useState(false);

  const normalize = (raw: string) => {
    if (!raw) return raw;
    let s = raw.replace(/&amp;/g, "&").trim();
    if (/^uploads\//.test(s)) s = "/" + s.replace(/^\/+/, "");
    return s.replace(/([^:])\/{2,}/g, "$1/");
  };

  const optimized = normalize(src);

  useEffect(() => {
    if (priority) {
      if (imgRef.current) imgRef.current.src = optimized;
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || !imgRef.current) return;
      imgRef.current.src = optimized;
      io.disconnect();
    }, { threshold: 0.1, rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, [optimized, priority]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden bg-muted ${aspectRatio} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-secondary to-muted bg-[length:200%_100%] animate-shimmer" />
      )}
      {!hasError && (
        <img
          ref={imgRef}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          sizes={sizes}
          srcSet={srcSet}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setIsLoading(false)}
          onError={() => { setHasError(true); setIsLoading(false); }}
        />
      )}
      {hasError && (
        <div className="flex w-full h-full items-center justify-center text-muted-foreground">
          <i className={`${fallbackIcon} text-2xl`} />
        </div>
      )}
    </div>
  );
}
