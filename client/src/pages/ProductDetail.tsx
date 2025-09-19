import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import type { Product } from "@shared/schema";
import { formatPrice } from "@/utils/currency";

type MediaItem =
  | { type: "image"; url: string }
  | { type: "video"; url: string };

export default function ProductDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();

  const [selected, setSelected] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // swipe refs
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);

  // datos
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const product = useMemo(
    () =>
      products.find((p) => String(p.id) === String(params.id)) ??
      products.find((p: any) => p.slug === params.id),
    [products, params.id],
  );

  // media combinado
  const media: MediaItem[] = useMemo(() => {
    const imgs = (product?.images || [])
      .filter(Boolean)
      .map((url) => ({ type: "image" as const, url }));
    const vids = (product?.videos || [])
      .filter(Boolean)
      .map((url) => ({ type: "video" as const, url }));
    return [...imgs, ...vids];
  }, [product]);

  // helpers
  const stars = (n: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`${i < n ? "fas" : "far"} fa-star text-sm text-yellow-400`}
        aria-hidden="true"
      />
    ));

  const handleBack = () => setLocation("/");

  const productUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/product/${product?.id}`
      : `/product/${product?.id}`;

  const handleWhatsApp = () => {
    const msg = `Quiero más información sobre: ${product?.name} - ${product ? formatPrice(product.price) : ""}`;
    window.open(`https://wa.me/18295344286?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleShare = () => {
    const data = {
      title: `${product?.name} - FULLTECH`,
      text: `¡Mira este producto! ${product?.name} - ${product ? formatPrice(product.price) : ""}`,
      url: productUrl,
    };
    if (navigator.share) navigator.share(data);
    else window.open(`https://wa.me/18295344286?text=${encodeURIComponent(`${data.text}\n${productUrl}`)}`, "_blank");
  };

  // teclado en fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowLeft") setSelected((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setSelected((i) => Math.min(media.length - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, media.length]);

  // swipe
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    deltaX.current = e.touches[0].clientX - startX.current;
  };
  const onTouchEnd = () => {
    const d = deltaX.current;
    startX.current = null;
    deltaX.current = 0;
    if (d > 40) setSelected((i) => Math.max(0, i - 1));
    if (d < -40) setSelected((i) => Math.min(media.length - 1, i + 1));
  };

  // loading / not found
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background">
        <TopBar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-sm font-medium text-foreground">Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="w-full min-h-screen bg-background">
        <TopBar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <p className="text-4xl md:text-6xl mb-4">😕</p>
            <h3 className="text-lg md:text-2xl font-semibold mb-2">Producto no encontrado</h3>
            <button
              onClick={handleBack}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Volver al catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ¿Hay bloques de detalle para renderizar abajo?
  const hasExtended =
    Boolean(product.description && product.description.trim().length > 100) ||
    Boolean((product as any).specs && (Array.isArray((product as any).specs) ? (product as any).specs.length : Object.keys((product as any).specs || {}).length));

  return (
    <div className="w-full min-h-screen bg-background">
      {/* HEADER FIJO */}
      <TopBar />

      {/* CONTENIDO PRINCIPAL CON SCROLL */}
      <div className="pt-16 min-h-screen">
        {/* LAYOUT PRINCIPAL */}
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* COLUMNA IZQUIERDA: IMÁGENES */}
            <div className="space-y-4">
              {/* IMAGEN PRINCIPAL */}
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl">
                <div className="w-full">
                  {media[selected]?.type === "video" ? (
                    <video
                      src={media[selected].url}
                      className="w-full h-auto"
                      controls
                      autoPlay
                      muted
                      loop
                    />
                  ) : (
                    <img
                      src={media[selected]?.url}
                      alt={product.name}
                      className="w-full h-auto cursor-pointer hover:scale-105 transition-transform duration-300"
                      draggable={false}
                      onClick={() => setFullscreen(true)}
                    />
                  )}
                </div>
                
                {/* BOTÓN ZOOM ELEGANTE */}
                <button
                  onClick={() => setFullscreen(true)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
                  title="Ver en pantalla completa"
                >
                  <i className="fas fa-expand text-gray-700 text-sm" />
                </button>
              </div>

              {/* MINIATURAS AL LADO */}
              {media.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {media.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => setSelected(i)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105
                        ${selected === i 
                          ? "border-primary ring-2 ring-primary/30 shadow-lg" 
                          : "border-gray-200 hover:border-primary/50"}`}
                    >
                      {m.type === "video" ? (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                          <i className="fas fa-play text-white text-sm" />
                        </div>
                      ) : (
                        <img
                          src={m.url}
                          alt={`${product.name} ${i + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA: INFORMACIÓN */}
            <div className="space-y-6">
              {/* TÍTULO Y RATING */}
              <div className="space-y-3">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-3">
                  <div className="flex">{stars(product.rating || 5)}</div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount || 0} reseñas)
                  </span>
                </div>
              </div>

              {/* PRECIO DESTACADO */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-xl border border-primary/20">
                <div className="space-y-2">
                  <span className="text-4xl lg:text-5xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              {product.description && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Descripción</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* BOTONES DE ACCIÓN */}
              <div className="space-y-4 pt-6">
                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                  <i className="fab fa-whatsapp text-xl"></i>
                  Pedir por WhatsApp
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-share-alt"></i>
                    Compartir
                  </button>
                  <button
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    title="Favorito"
                  >
                    <i className="far fa-heart"></i>
                    Favorito
                  </button>
                </div>
              </div>

              {/* INFORMACIÓN ADICIONAL */}
              <div className="pt-6 space-y-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <i className="fas fa-shield-alt text-green-600"></i>
                    <span>Garantía incluida</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <i className="fas fa-truck text-blue-600"></i>
                    <span>Delivery disponible</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <i className="fas fa-headset text-purple-600"></i>
                    <span>Soporte 24/7</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <i className="fas fa-medal text-orange-600"></i>
                    <span>Calidad premium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CONTENIDO EXTENDIDO */}
          {hasExtended && (
            <div className="mt-16 space-y-8">
              {product.description && product.description.length > 100 && (
                <div className="bg-card text-card-foreground rounded-2xl p-8 shadow-sm border border-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                    <i className="fas fa-info-circle text-primary"></i>
                    Descripción Completa
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {(product as any).specs && (
                <div className="bg-card text-card-foreground rounded-2xl p-8 shadow-sm border border-border">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                    <i className="fas fa-cog text-primary"></i>
                    Especificaciones Técnicas
                  </h2>
                  {Array.isArray((product as any).specs) ? (
                    <ul className="list-none space-y-3">
                      {(product as any).specs.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <i className="fas fa-check-circle text-green-600 mt-1"></i>
                          <span className="text-muted-foreground">{s}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries((product as any).specs as Record<string, string>).map(([k, v]) => (
                        <div key={k} className="space-y-1">
                          <dt className="font-semibold text-foreground">{k}</dt>
                          <dd className="text-muted-foreground">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* BOTÓN FLOTANTE DE REGRESO */}
      <button
        onClick={handleBack}
        className="fixed top-20 left-4 w-12 h-12 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-200 z-50 border border-gray-200"
        title="Volver al catálogo"
      >
        <i className="fas fa-arrow-left text-gray-700" />
      </button>

      {/* FULLSCREEN MODAL */}
      {fullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-10"
            title="Cerrar"
          >
            <i className="fas fa-times text-white text-lg"></i>
          </button>

          {media.length > 1 && (
            <>
              <button
                onClick={() => setSelected((i) => Math.max(0, i - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                title="Anterior"
              >
                <i className="fas fa-chevron-left text-white" />
              </button>
              <button
                onClick={() => setSelected((i) => Math.min(media.length - 1, i + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                title="Siguiente"
              >
                <i className="fas fa-chevron-right text-white" />
              </button>
            </>
          )}

          <div className="w-full h-full flex items-center justify-center p-2">
            {media[selected]?.type === "video" ? (
              <video src={media[selected].url} className="max-w-full max-h-full rounded-lg" controls autoPlay />
            ) : (
              <img
                src={media[selected]?.url}
                alt={product.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
