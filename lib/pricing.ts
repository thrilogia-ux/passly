// Configuración centralizada de precios (en pesos argentinos)

// Paquetes de tokens disponibles
export const TOKEN_PACKAGES = [
  { tokens: 50, priceARS: 44000, popular: false },
  { tokens: 100, priceARS: 79200, popular: false },
  { tokens: 250, priceARS: 176000, popular: true },
  { tokens: 500, priceARS: 308000, popular: false },
  { tokens: 1000, priceARS: 528000, popular: false },
];

// Precio por token individual (para compras personalizadas)
// Referencia: $792 por token (paquete 100, precio duplicado)
export const PRICE_PER_TOKEN_ARS = 792;

// Funciones de formato
export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Obtener precio en ARS para un paquete
export function getPackagePriceARS(tokens: number): number {
  const pkg = TOKEN_PACKAGES.find((p) => p.tokens === tokens);
  if (pkg) {
    return pkg.priceARS;
  }
  // Para compras personalizadas
  return tokens * PRICE_PER_TOKEN_ARS;
}

// Obtener precio por invitación de un paquete
export function getPricePerInvitation(tokens: number): number {
  const pkg = TOKEN_PACKAGES.find((p) => p.tokens === tokens);
  if (pkg) {
    return Math.round(pkg.priceARS / pkg.tokens);
  }
  return PRICE_PER_TOKEN_ARS;
}
