// Configuración centralizada de precios
// Actualizar el tipo de cambio según el dólar oficial

// Tipo de cambio: Dólar oficial (actualizar según corresponda)
export const USD_TO_ARS = 1100; // $1 USD = $1100 ARS (dólar oficial enero 2026)

// Paquetes de tokens disponibles
export const TOKEN_PACKAGES = [
  { tokens: 50, priceUSD: 5, popular: false },
  { tokens: 100, priceUSD: 9, popular: false },
  { tokens: 250, priceUSD: 20, popular: true },
  { tokens: 500, priceUSD: 35, popular: false },
  { tokens: 1000, priceUSD: 60, popular: false },
];

// Precio por token individual (para compras personalizadas)
export const PRICE_PER_TOKEN_USD = 0.10; // $0.10 USD por token

// Funciones de conversión
export function usdToArs(usd: number): number {
  return Math.round(usd * USD_TO_ARS);
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Obtener precio en ARS para un paquete
export function getPackagePriceARS(tokens: number): number {
  const pkg = TOKEN_PACKAGES.find((p) => p.tokens === tokens);
  if (pkg) {
    return usdToArs(pkg.priceUSD);
  }
  // Para compras personalizadas
  return usdToArs(tokens * PRICE_PER_TOKEN_USD);
}

// Obtener precio en USD para un paquete
export function getPackagePriceUSD(tokens: number): number {
  const pkg = TOKEN_PACKAGES.find((p) => p.tokens === tokens);
  if (pkg) {
    return pkg.priceUSD;
  }
  // Para compras personalizadas
  return tokens * PRICE_PER_TOKEN_USD;
}
