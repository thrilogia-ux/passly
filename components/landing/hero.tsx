import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6">
            Invitaciones Digitales
            <br />
            <span className="bg-gradient-to-r from-[#00b5ff] to-[#0099cc] bg-clip-text text-transparent">
              que Impresionan
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
