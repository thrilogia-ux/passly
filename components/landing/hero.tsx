"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

// Videos de fondo del hero (en public/). ?v=5 fuerza recarga al cambiar archivos.
const HERO_VIDEOS = [
  "/hero-video-1.mp4.mp4?v=5",
  "/hero-video-2.mp4.mp4?v=5",
  "/hero-video-3.mp4.mp4?v=5",
];

const CROSSFADE_MS = 500;

function pickRandomIndex(currentIndex: number): number {
  if (HERO_VIDEOS.length <= 1) return 0;
  const others = HERO_VIDEOS.map((_, i) => i).filter((i) => i !== currentIndex);
  return others[Math.floor(Math.random() * others.length)];
}

export function Hero() {
  const [videoError, setVideoError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(() =>
    Math.floor(Math.random() * HERO_VIDEOS.length)
  );
  const [nextIndex, setNextIndex] = useState<number>(() =>
    pickRandomIndex(currentIndex)
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0); // 0 = primer video es el "actual", 1 = segundo
  const ref0 = useRef<HTMLVideoElement>(null);
  const ref1 = useRef<HTMLVideoElement>(null);

  const handleEnded = () => {
    if (isTransitioning) return;
    const nextRef = activeSlot === 0 ? ref1 : ref0;
    nextRef.current?.play().catch(() => {});
    setIsTransitioning(true);
  };

  useEffect(() => {
    if (!isTransitioning) return;
    const t = setTimeout(() => {
      const newNext = pickRandomIndex(nextIndex);
      setCurrentIndex(nextIndex);
      setNextIndex(newNext);
      setActiveSlot((s) => (s === 0 ? 1 : 0));
      setIsTransitioning(false);
      const inactiveRef = activeSlot === 0 ? ref0 : ref1;
      if (inactiveRef.current) inactiveRef.current.src = HERO_VIDEOS[newNext];
    }, CROSSFADE_MS);
    return () => clearTimeout(t);
  }, [isTransitioning]);

  const showVideo = HERO_VIDEOS.length > 0 && !videoError;

  // Forzar play en móvil (iOS/Safari suelen ignorar autoPlay sin interacción)
  useEffect(() => {
    if (!showVideo) return;
    const activeRef = activeSlot === 0 ? ref0 : ref1;
    const el = activeRef.current;
    if (!el) return;
    el.muted = true;
    el.playsInline = true;
    const p = el.play();
    if (p?.catch) p.catch(() => {});
  }, [showVideo, activeSlot, isTransitioning]);

  const src0 = activeSlot === 0 ? HERO_VIDEOS[currentIndex] : HERO_VIDEOS[nextIndex];
  const src1 = activeSlot === 0 ? HERO_VIDEOS[nextIndex] : HERO_VIDEOS[currentIndex];
  const opacity0 =
    (activeSlot === 0 && !isTransitioning) || (activeSlot === 1 && isTransitioning)
      ? 1
      : 0;
  const opacity1 =
    (activeSlot === 1 && !isTransitioning) || (activeSlot === 0 && isTransitioning)
      ? 1
      : 0;

  return (
    <section className="relative min-h-[32rem] overflow-hidden bg-gradient-to-br from-[#fff1ec] via-white to-[#ffe4dd]">
      {/* Dos videos con crossfade: sin hueco en blanco al cambiar */}
      {showVideo && (
        <>
          <video
            ref={ref0}
            src={src0}
            autoPlay
            muted
            playsInline
            preload="auto"
            onLoadedData={() => { ref0.current?.play().catch(() => {}); }}
            onEnded={activeSlot === 0 ? handleEnded : undefined}
            onError={() => setVideoError(true)}
            className="absolute inset-0 h-full w-full object-cover grayscale contrast-[1.03] saturate-[0.98] transition-opacity duration-500 ease-in-out"
            style={{ opacity: opacity0 }}
            aria-hidden
          />
          <video
            ref={ref1}
            src={src1}
            autoPlay={false}
            muted
            playsInline
            preload="auto"
            onLoadedData={() => { ref1.current?.play().catch(() => {}); }}
            onEnded={activeSlot === 1 ? handleEnded : undefined}
            onError={() => setVideoError(true)}
            className="absolute inset-0 h-full w-full object-cover grayscale contrast-[1.03] saturate-[0.98] transition-opacity duration-500 ease-in-out"
            style={{ opacity: opacity1 }}
            aria-hidden
          />
          {/* Filtro naranja sobre todo el hero */}
          <div
            className="absolute inset-0 bg-[#ff5040]/30 pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#ff5040]/20 via-[#ff8a40]/15 to-[#ff5040]/25 mix-blend-overlay pointer-events-none"
            aria-hidden
          />
          {/* Grano fino tipo película (sutil y agradable) */}
          <div
            className="absolute inset-0 opacity-[0.22] mix-blend-soft-light pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(128,128,128,0.5) 0.5px, transparent 0.5px)`,
              backgroundSize: "4px 4px",
            }}
            aria-hidden
          />
          {/* Overlay para legibilidad del texto (sobre naranja y granos) */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/25 to-[#fff1ec]/50 pointer-events-none"
            aria-hidden
          />
        </>
      )}

      {/* Contenido del hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-[#ff5040] to-[#ff8a40] bg-clip-text text-transparent">
              Smart access para eventos modernos
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-white max-w-3xl mx-auto mb-8 drop-shadow-md">
            Diseña invitaciones personalizadas, gestiona eventos y realiza check-in con QR.
            Todo en una plataforma simple y poderosa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6">
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-lg sm:text-xl font-medium text-white drop-shadow-md">
            ✨ 10 invitaciones gratis para empezar
          </p>
        </div>
      </div>
    </section>
  );
}
