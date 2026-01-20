const steps = [
  {
    number: "1",
    title: "Crea tu Evento",
    description: "Define fecha, hora, ubicación y detalles. Todo en minutos.",
    icon: "📅",
  },
  {
    number: "2",
    title: "Diseña tu Invitación",
    description: "Sube tu diseño o usa nuestros templates. Posiciona el QR exactamente donde quieras.",
    icon: "🎨",
  },
  {
    number: "3",
    title: "Invita a tus Invitados",
    description: "Importa tu lista o agrega invitados manualmente. Envía invitaciones por email automáticamente.",
    icon: "✉️",
  },
  {
    number: "4",
    title: "Check-in en el Evento",
    description: "Escanea códigos QR al llegar. Registro instantáneo y analytics en tiempo real.",
    icon: "📱",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Cómo Funciona
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple, rápido y poderoso. En 4 pasos estás listo
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#ff5040] to-[#ff8a40] flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {step.number}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-[#ff5040] to-transparent transform translate-x-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
