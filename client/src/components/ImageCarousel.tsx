import { useState, useEffect, useRef } from "react";
import { ImageLoader } from "./ImageLoader";

interface ImageCarouselProps {
  images: string[];
  videos?: string[];
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackIcon?: string;
  autoRotate?: boolean;
  rotateInterval?: number; // ms
}

export function ImageCarousel({
  images,
  videos = [],
  alt,
  className = "",
  width = 400,
  height = 400,
  fallbackIcon = "fas fa-image",
  autoRotate = true,
  rotateInterval = 8000, // un poco más rápido y ligero que 30s
}: ImageCarouselProps) {
  const allMedia = [...images, ...videos];
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inViewRef = useRef(false);
  const rafId = useRef<number | null>(null);
  const lastTick = useRef(0);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // == Visibilidad del carrusel (IntersectionObserver) ==
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        inViewRef.current = e.isIntersecting;
        // Pausa/reanuda videos cuando entra/sale
        const vids = Array.from(el.querySelectorAll("video")) as HTMLVideoElement[];
        if (e.isIntersecting && !document.hidden) {
          vids.forEach(v => v.play().catch(() => {}));
        } else {
          vids.forEach(v => v.pause());
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // == Pausa global si pestaña oculta ==
  useEffect(() => {
    const onVis = () => {
      const hidden = document.hidden || !inViewRef.current;
      const el = containerRef.current;
      if (!el) return;
      const vids = Array.from(el.querySelectorAll("video")) as HTMLVideoElement[];
      vids.forEach(v => (hidden ? v.pause() : v.play().catch(() => {})));
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // == Rotación con rAF (sin setInterval) SOLO si visible ==
  useEffect(() => {
    if (!autoRotate || reduceMotion || allMedia.length <= 1) return;

    const loop = (t: number) => {
      if (inViewRef.current && !document.hidden) {
        if (t - lastTick.current >= rotateInterval) {
          setCurrentIndex((p) => (p + 1) % allMedia.length);
          lastTick.current = t;
        }
      }
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null;
    };
  }, [autoRotate, rotateInterval, allMedia.length, reduceMotion]);

  const isVideo = (url: string) => videos.includes(url);

  const nextMedia = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevMedia = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };

  const goToMedia = (i: number) => setCurrentIndex(i);

  if (allMedia.length === 0) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <i className={`${fallbackIcon} text-muted-foreground text-2xl`} />
      </div>
    );
  }

  const currentMedia = allMedia[currentIndex];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative w-full h-full overflow-hidden">
        {isVideo(currentMedia) ? (
          <video
            key={currentMedia}
            className="w-full h-full object-cover"
            // ⚠️ NO cargamos data a lo loco
            preload="metadata"
            muted
            loop
            playsInline
            // src solo si está en viewport → ahorro de datos
            src={inViewRef.current ? currentMedia : undefined}
            onCanPlay={(e) => {
              if (!document.hidden && inViewRef.current) {
                (e.currentTarget as HTMLVideoElement).play().catch(() => {});
              }
            }}
          />
        ) : (
          <ImageLoader
            key={currentMedia}
            src={currentMedia}
            alt={alt}
            className="w-full h-full"
            width={width}
            height={height}
          />
        )}

        {/* Flechas (si hay varias) */}
        {allMedia.length > 1 && (
          <>
            <button
              onClick={prevMedia}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
              data-testid="carousel-prev"
            >
              <i className="fas fa-chevron-left text-xs" />
            </button>
            <button
              onClick={nextMedia}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
              data-testid="carousel-next"
            >
              <i className="fas fa-chevron-right text-xs" />
            </button>
          </>
        )}

        {/* Indicador de tipo */}
        {isVideo(currentMedia) && (
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <i className="fas fa-play text-xs" />
            <span>Video</span>
          </div>
        )}
      </div>

      {/* Puntos (si hay varias) */}
      {allMedia.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {allMedia.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToMedia(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/75"
              }`}
              data-testid={`carousel-dot-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
