import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const useCases = [
  {
    title: "Agencias de Eventos",
    description: "Gestiona múltiples eventos simultáneamente. Invitaciones personalizadas para cada cliente con tu branding.",
    features: ["Multi-evento", "Branding personalizado", "Equipos colaborativos"],
    icon: "🏢",
  },
  {
    title: "Eventos Particulares",
    description: "Casamientos, cumpleaños, aniversarios. Crea invitaciones únicas y gestiona tu lista de invitados fácilmente.",
    features: ["Fácil de usar", "Diseño personalizado", "RSVP automático"],
    icon: "🎉",
  },
  {
    title: "Eventos Corporativos",
    description: "Lanzamientos, conferencias, networking. Control total del acceso y analytics detallados.",
    features: ["Check-in profesional", "Analytics avanzados", "Integraciones"],
    icon: "💼",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Para todos los tipos de eventos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Desde eventos íntimos hasta grandes producciones
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <Card key={index} className="border-gray-200 hover:border-[#ff5040] hover:shadow-xl transition-all">
              <CardHeader>
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <CardTitle className="text-2xl">{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600 mb-4">
                  {useCase.description}
                </CardDescription>
                <ul className="space-y-2">
                  {useCase.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700">
                      <span className="text-[#ff5040] mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
