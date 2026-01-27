import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TOKEN_PACKAGES, USD_TO_ARS, usdToArs, formatARS } from "@/lib/pricing";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Planes y Precios
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comienza gratis y escala según tus necesidades
          </p>
        </div>

        {/* Free Plan */}
        <div className="mb-16">
          <Card className="max-w-md mx-auto border-2 border-[#ff5040] shadow-xl">
            <CardHeader className="text-center">
              <div className="inline-block px-3 py-1 bg-[#cdfa55] text-[#303030] rounded-full text-sm font-semibold mb-2">
                PLAN GRATIS
              </div>
              <CardTitle className="text-3xl font-bold">Gratis</CardTitle>
              <CardDescription className="text-lg mt-2">
                10 invitaciones incluidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-700">
                  <span className="text-[#ff5040] mr-2">✓</span>
                  10 invitaciones gratis
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-[#ff5040] mr-2">✓</span>
                  Diseño personalizado
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-[#ff5040] mr-2">✓</span>
                  QR único por invitación
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-[#ff5040] mr-2">✓</span>
                  Check-in con QR
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-[#ff5040] mr-2">✓</span>
                  RSVP integrado
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/register" className="w-full">
                <Button className="w-full" size="lg">
                  Comenzar Gratis
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Token Packs */}
        <div>
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Packs de Tokens
          </h3>
          <p className="text-center text-gray-600 mb-4">
            Después de las 10 invitaciones gratis, compra tokens según tu necesidad
          </p>
          <p className="text-center text-sm text-gray-500 mb-12">
            Precios en pesos argentinos (cotización: 1 USD = {formatARS(USD_TO_ARS)})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {TOKEN_PACKAGES.map((pack, index) => {
              const priceARS = usdToArs(pack.priceUSD);
              const pricePerInvitation = priceARS / pack.tokens;
              
              return (
                <Card
                  key={index}
                  className={`relative border-2 transition-all hover:shadow-xl ${
                    pack.popular
                      ? "border-[#ff5040] shadow-lg scale-105"
                      : "border-gray-200"
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-[#ff5040] to-[#ff8a40] text-white px-3 py-1 rounded-full text-xs font-semibold">
                        MÁS POPULAR
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                      {pack.tokens} Tokens
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatARS(priceARS)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      (${pack.priceUSD} USD)
                    </p>
                    <CardDescription className="mt-2">
                      {formatARS(Math.round(pricePerInvitation))} por invitación
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center">
                        <span className="text-[#ff5040] mr-2">✓</span>
                        {pack.tokens} invitaciones
                      </li>
                      <li className="flex items-center">
                        <span className="text-[#ff5040] mr-2">✓</span>
                        Sin expiración
                      </li>
                      <li className="flex items-center">
                        <span className="text-[#ff5040] mr-2">✓</span>
                        Uso ilimitado
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href="/register" className="w-full">
                      <Button
                        variant={pack.popular ? "default" : "outline"}
                        className="w-full"
                      >
                        Comprar
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
