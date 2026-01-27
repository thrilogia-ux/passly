"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, History, CreditCard, Building2, X } from "lucide-react";
import { 
  TOKEN_PACKAGES, 
  PRICE_PER_TOKEN_ARS,
  formatARS,
  getPackagePriceARS,
  getPricePerInvitation
} from "@/lib/pricing";

type PaymentMethod = "mercadopago" | "bank" | null;

export default function TokensPage() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [amount, setAmount] = useState(100);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  
  // Bank transfer form
  const [bankForm, setBankForm] = useState({
    bankName: "",
    transactionNumber: "",
  });

  useEffect(() => {
    loadBalance();
    
    // Check for payment success/failure in URL
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const tokensAdded = params.get("tokens");
    
    if (paymentStatus === "success") {
      const message = tokensAdded 
        ? `¡Pago exitoso! Se agregaron ${tokensAdded} tokens a tu cuenta.`
        : "¡Pago exitoso! Los tokens se agregarán a tu cuenta.";
      alert(message);
      loadBalance();
      window.history.replaceState({}, "", "/dashboard/tokens");
    } else if (paymentStatus === "failure") {
      alert("El pago fue rechazado. Por favor, intentá nuevamente.");
      window.history.replaceState({}, "", "/dashboard/tokens");
    } else if (paymentStatus === "pending") {
      alert("El pago está pendiente. Los tokens se agregarán cuando se confirme.");
      window.history.replaceState({}, "", "/dashboard/tokens");
    }
  }, []);

  const loadBalance = async () => {
    try {
      const res = await fetch("/api/tokens");
      if (!res.ok) {
        throw new Error("Error loading balance");
      }
      const data = await res.json();
      setBalance(data.balance);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error loading balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (tokens: number, method: PaymentMethod) => {
    setAmount(tokens);
    setSelectedPackage(tokens);
    setSelectedPaymentMethod(method);
    setShowPaymentModal(true);
  };

  const handleMercadoPago = async () => {
    setPurchasing(true);
    try {
      const priceARS = getPackagePriceARS(amount);
      
      const res = await fetch("/api/payments/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tokens: amount, 
          amount: priceARS
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.details || data.error || "Error creating payment");
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error: any) {
      alert(error.message || "Error al procesar el pago");
      setPurchasing(false);
    }
  };

  const handleBankTransfer = async () => {
    if (!bankForm.bankName || !bankForm.transactionNumber) {
      alert("Por favor, completá todos los campos");
      return;
    }

    setPurchasing(true);
    try {
      const priceARS = getPackagePriceARS(amount);
      
      const res = await fetch("/api/payments/bank-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokens: amount,
          bankName: bankForm.bankName,
          transactionNumber: bankForm.transactionNumber,
          amount: priceARS,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error creating transfer request");
      }

      const data = await res.json();
      alert(
        `Solicitud de transferencia creada.\n\n` +
        `Por favor, realizá la transferencia a:\n${data.instructions.bankAccount}\n` +
        `Monto: ${formatARS(priceARS)}\n` +
        `Referencia: ${data.instructions.reference}\n\n` +
        `Los tokens se agregarán una vez aprobada la transferencia.`
      );
      
      setShowPaymentModal(false);
      setBankForm({ bankName: "", transactionNumber: "" });
      await loadBalance();
    } catch (error: any) {
      alert(error.message || "Error al crear la solicitud");
    } finally {
      setPurchasing(false);
    }
  };

  // Calcular precio para cantidad personalizada
  const customPriceARS = getPackagePriceARS(amount);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Gestión de Tokens</h1>
        <p className="mt-2 text-sm md:text-base text-gray-600">
          Comprá tokens para enviar invitaciones
        </p>
      </div>

      {/* Balance Card */}
      <Card className="mb-6 bg-gradient-to-br from-[#ff5040] to-[#ff8a40] text-white border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm opacity-90">Balance Actual</p>
              <p className="text-3xl md:text-4xl font-bold mt-2">{loading ? "..." : balance}</p>
              <p className="text-sm opacity-75 mt-1">tokens disponibles</p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <Coins className="w-12 h-12" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Packages */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        {TOKEN_PACKAGES.map((pkg) => {
          const pricePerInvitation = getPricePerInvitation(pkg.tokens);
          
          return (
            <Card
              key={pkg.tokens}
              className={`relative transition-all hover:shadow-lg ${
                pkg.popular ? "ring-2 ring-[#ff5040] scale-105" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#cdfa55] to-[#b8e644] text-[#303030] px-3 py-1 rounded-full text-xs font-semibold shadow-md whitespace-nowrap">
                  Más Popular
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{pkg.tokens} tokens</CardTitle>
                <div className="mt-2">
                  <p className="text-2xl font-bold text-gray-900">{formatARS(pkg.priceARS)}</p>
                  <p className="text-xs text-gray-500">{formatARS(pricePerInvitation)} por invitación</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                <Button
                  className="w-full"
                  onClick={() => handlePackageSelect(pkg.tokens, "mercadopago")}
                  disabled={purchasing}
                  variant="default"
                  size="sm"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  MercadoPago
                </Button>
                <Button
                  className="w-full"
                  onClick={() => handlePackageSelect(pkg.tokens, "bank")}
                  disabled={purchasing}
                  variant="secondary"
                  size="sm"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Transferencia
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom Amount */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Compra Personalizada</CardTitle>
          <CardDescription>Ingresá la cantidad de tokens que querés comprar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Cantidad de tokens"
              min="1"
              className="flex-1"
            />
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => handlePackageSelect(amount, "mercadopago")}
                disabled={purchasing || amount < 1}
                variant="default"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                MercadoPago
              </Button>
              <Button
                onClick={() => handlePackageSelect(amount, "bank")}
                disabled={purchasing || amount < 1}
                variant="secondary"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Transferencia
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Precio: <strong>{formatARS(customPriceARS)}</strong> ({formatARS(PRICE_PER_TOKEN_ARS)} por token)
          </p>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {selectedPaymentMethod === "mercadopago" && "Pagar con MercadoPago"}
                {selectedPaymentMethod === "bank" && "Transferencia Bancaria"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPaymentMethod(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Cantidad de tokens</p>
                <p className="text-2xl font-bold">{amount}</p>
                <p className="text-lg font-semibold text-[#ff5040] mt-2">
                  Total: {formatARS(getPackagePriceARS(amount))}
                </p>
              </div>

              {selectedPaymentMethod === "mercadopago" && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Serás redirigido a MercadoPago para completar el pago.
                  </p>
                  <Button
                    onClick={handleMercadoPago}
                    disabled={purchasing}
                    className="w-full"
                  >
                    {purchasing ? "Procesando..." : "Continuar a MercadoPago"}
                  </Button>
                </div>
              )}

              {selectedPaymentMethod === "bank" && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Completá los datos de tu transferencia bancaria. Los tokens se agregarán una vez aprobada la transferencia.
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Banco</label>
                    <Input
                      value={bankForm.bankName}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, bankName: e.target.value })
                      }
                      placeholder="Ej: Banco Nación"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Número de Transacción</label>
                    <Input
                      value={bankForm.transactionNumber}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, transactionNumber: e.target.value })
                      }
                      placeholder="Número de referencia de la transferencia"
                      required
                    />
                  </div>
                  <Button
                    onClick={handleBankTransfer}
                    disabled={purchasing}
                    className="w-full"
                    variant="secondary"
                  >
                    {purchasing ? "Procesando..." : "Enviar Solicitud"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historial de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay transacciones aún</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors gap-2"
                >
                  <div className="flex-1">
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div
                    className={`font-semibold text-lg ${
                      tx.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount} tokens
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
