"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Video de fondo del hero: deja vacío para usar solo el gradiente.
// URL con CORS habilitado para que funcione en Vercel. Para video propio: poné hero-bg.mp4 en public/ y usá "/hero-bg.mp4"
const HERO_VIDEO_URL = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const HERO_VIDEO_POSTER = ""; // opcional: imagen mientras carga el video (ej. "/hero-poster.jpg")

export function Hero() {
  const [videoError, setVideoError] = useState(false);
  const showVideo = HERO_VIDEO_URL && !videoError;

  return (
    <section className="relative min-h-[32rem] overflow-hidden bg-gradient-to-br from-[#fff1ec] via-white to-[#ffe4dd]">
      {/* Capa de video (solo si hay URL y no falló) */}
      {showVideo && (
        <>
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={HERO_VIDEO_POSTER || undefined}
            onError={() => setVideoError(true)}
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
          {/* Overlay para que el texto sea legible */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-[#fff1ec]/90"
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
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
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
          <p className="mt-6 text-sm text-gray-500">
            ✨ 10 invitaciones gratis para empezar
          </p>
        </div>
      </div>
    </section>
  );
}
