import { useEffect, useRef, useState } from "react";
import { ImageLoader } from "./ImageLoader";
import { useInViewport } from "@/hooks/useInViewport";

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
  rotateInterval = 8000, // bajamos a 8s por UX y ahorro
}: ImageCarouselProps) {
  const media = [...images, ...videos];
  const { ref, inView } = useInViewport<HTMLDivElement>({ threshold: 0.4 });
  const [idx, setIdx] = useState(0);
  const last = useRef(0);
  const raf = useRef<number | null>(null);
  const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // rAF loop (solo visible, sin timers)
  useEffect(() => {
    if (!autoRotate || reduceMotion || media.length <= 1) return;
    const loop = (t: number) => {
      if (!document.hidden && inView) {
        if (t - last.current >= rotateInterval) {
          setIdx((v) => (v + 1) % media.length);
          last.current = t;
        }
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [autoRotate, inView, rotateInterval, media.length, reduceMotion]);

  // Pausar/Play videos al cambiar visibilidad o slide
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const vids = Array.from(container.querySelectorAll("video")) as HTMLVideoElement[];
    const onVis = () => {
      const hidden = document.hidden || !inView;
      vids.forEach(v => hidden ? v.pause() : v.play().catch(()=>{}));
    };
    document.addEventListener("visibilitychange", onVis);
    onVis();
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [inView, idx, ref]);

  const isVideo = (url: string) => videos.includes(url);

  const next = (e?: React.MouseEvent) => { e?.stopPropagation(); setIdx((v) => (v + 1) % media.length); };
  const prev = (e?: React.MouseEvent) => { e?.stopPropagation(); setIdx((v) => (v - 1 + media.length) % media.length); };
  const goTo = (i: number) => setIdx(i);

  if (media.length === 0) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <i className={`${fallbackIcon} text-muted-foreground text-2xl`} />
      </div>
    );
  }

  const current = media[idx];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="relative w-full h-full overflow-hidden">
        {isVideo(current) ? (
          <video
            key={current}
            className="w-full h-full object-cover"
            preload="metadata"
            muted
            loop
            playsInline
            // src solo si visible, así no chupa ancho de banda offscreen
            src={inView ? current : undefined}
            onCanPlay={(e) => !document.hidden && (e.currentTarget as HTMLVideoElement).play().catch(()=>{})}
          />
        ) : (
          <ImageLoader
            key={current}
            src={current}
            alt={alt}
            className="w-full h-full"
            width={width}
            height={height}
          />
        )}

        {media.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
              data-testid="carousel-prev"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
              data-testid="carousel-next"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </>
        )}

        {isVideo(current) && (
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <i className="fas fa-play text-xs"></i><span>Video</span>
          </div>
        )}
      </div>

      {media.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {media.map((_, i) => (
            <button
              key={i}
              onClick={(e)=>{e.stopPropagation(); goTo(i);}}
              className={`w-2 h-2 rounded-full transition-all ${i===idx ? "bg-white" : "bg-white/50 hover:bg-white/75"}`}
              data-testid={`carousel-dot-${i}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
