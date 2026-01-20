import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Diseño Personalizado",
    description: "Crea invitaciones únicas con tu propio diseño. Sube imágenes de fondo y posiciona el QR exactamente donde quieras.",
    icon: "🎨",
  },
  {
    title: "QR Inteligente",
    description: "Cada invitación tiene un QR único e intransferible. Controla el acceso y previene el fraude automáticamente.",
    icon: "📱",
  },
  {
    title: "Check-in Rápido",
    description: "Escanea códigos QR desde cualquier dispositivo. Check-in instantáneo con registro de hora y zona.",
    icon: "⚡",
  },
  {
    title: "RSVP Integrado",
    description: "Los invitados pueden confirmar asistencia directamente desde la invitación. Gestiona restricciones alimentarias y acompañantes.",
    icon: "✅",
  },
  {
    title: "Analytics en Tiempo Real",
    description: "Ve quién confirmó, quién asistió y métricas detalladas de tus eventos en tiempo real.",
    icon: "📊",
  },
  {
    title: "Multi-Evento",
    description: "Gestiona múltiples eventos simultáneamente. Perfecto para agencias y organizadores profesionales.",
    icon: "🎯",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Todo lo que necesitas
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Una plataforma completa para gestionar tus eventos de principio a fin
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-gray-200 hover:border-[#ff5040] hover:shadow-lg transition-all">
              <CardHeader>
                <div className="text-4xl mb-2">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
