import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { UseCases } from "@/components/landing/use-cases";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Contact } from "@/components/landing/contact";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#00b5ff] to-[#0099cc] bg-clip-text text-transparent">
                PASSLY
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Comenzar Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <Hero />
        <Features />
        <UseCases />
        <HowItWorks />
        <Pricing />
        <Contact />
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-[#00b5ff] to-[#0099cc] bg-clip-text text-transparent mb-4">
                PASSLY
              </h3>
              <p className="text-sm text-gray-600">
                La plataforma más completa para gestionar invitaciones digitales y check-in de eventos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#features" className="hover:text-[#00b5ff]">Características</Link></li>
                <li><Link href="#pricing" className="hover:text-[#00b5ff]">Precios</Link></li>
                <li><Link href="#use-cases" className="hover:text-[#00b5ff]">Casos de Uso</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#contact" className="hover:text-[#00b5ff]">Contacto</Link></li>
                <li><Link href="/login" className="hover:text-[#00b5ff]">Iniciar Sesión</Link></li>
                <li><Link href="/register" className="hover:text-[#00b5ff]">Registrarse</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-[#00b5ff]">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-[#00b5ff]">Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} PASSLY. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
