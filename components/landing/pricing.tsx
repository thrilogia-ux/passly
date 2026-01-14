import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const tokenPacks = [
  { tokens: 50, price: 9.99, popular: false },
  { tokens: 100, price: 17.99, popular: false },
  { tokens: 250, price: 39.99, popular: true },
  { tokens: 500, price: 69.99, popular: false },
  { tokens: 1000, price: 119.99, popular: false },
];

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
          <Card className="max-w-md mx-auto border-2 border-[#00b5ff] shadow-xl">
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
                  <span className="text-[#00b5ff] mr-2">✓</span>
                  10 invitaciones gratis
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-[#00b5ff] mr-2">✓</span>
                  Diseño personalizado
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-[#00b5ff] mr-2">✓</span>
                  QR único por invitación
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-[#00b5ff] mr-2">✓</span>
                  Check-in con QR
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-[#00b5ff] mr-2">✓</span>
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
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Packs de Tokens
          </h3>
          <p className="text-center text-gray-600 mb-12">
            Después de las 10 invitaciones gratis, compra tokens según tu necesidad
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {tokenPacks.map((pack, index) => (
              <Card
                key={index}
                className={`relative border-2 transition-all hover:shadow-xl ${
                  pack.popular
                    ? "border-[#00b5ff] shadow-lg scale-105"
                    : "border-gray-200"
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#00b5ff] to-[#0099cc] text-white px-3 py-1 rounded-full text-xs font-semibold">
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
                      ${pack.price}
                    </span>
                    <span className="text-gray-600 ml-1">USD</span>
                  </div>
                  <CardDescription className="mt-2">
                    ${(pack.price / pack.tokens).toFixed(3)} por invitación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <span className="text-[#00b5ff] mr-2">✓</span>
                      {pack.tokens} invitaciones
                    </li>
                    <li className="flex items-center">
                      <span className="text-[#00b5ff] mr-2">✓</span>
                      Sin expiración
                    </li>
                    <li className="flex items-center">
                      <span className="text-[#00b5ff] mr-2">✓</span>
                      Uso ilimitado
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={pack.popular ? "default" : "outline"}
                    className="w-full"
                    disabled
                  >
                    Próximamente
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
