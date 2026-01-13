"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QRScanner } from "@/components/check-in/qr-scanner";
import { QrCode, Camera, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function CheckInContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  
  const [qrToken, setQrToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; guest?: any; event?: any } | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera");
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    if (eventId) {
      fetch(`/api/events/${eventId}`)
        .then(r => r.json())
        .then(data => setEvent(data))
        .catch(err => console.error("Error loading event:", err));
    }
  }, [eventId]);

  const handleCheckIn = async (token?: string) => {
    const tokenToUse = token || qrToken;
    if (!tokenToUse) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: tokenToUse,
          zone: "general",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({ success: false, message: data.error || "Error en check-in" });
      } else {
        setResult({
          success: true,
          message: `Check-in exitoso`,
          guest: data.guest,
          event: data.event,
        });
        setQrToken("");
        setShowScanner(false);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setResult(null);
        }, 5000);
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || "Error en check-in" });
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (token: string) => {
    handleCheckIn(token);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-4 mb-4">
          {eventId && (
            <Link href={`/dashboard/events/${eventId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Evento
              </Button>
            </Link>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Check-in de Invitados</h1>
        <p className="mt-2 text-sm md:text-base text-gray-600">
          {event 
            ? `Escanea el código QR para el evento: ${event.name}`
            : "Escanea el código QR con la cámara o ingresa el token manualmente"}
        </p>
      </div>

      {/* Result Message */}
      {result && (
        <Card className={`mb-6 border-2 ${
          result.success 
            ? "border-green-500 bg-green-50" 
            : "border-red-500 bg-red-50"
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  result.success ? "text-green-800" : "text-red-800"
                }`}>
                  {result.message}
                </p>
                {result.success && result.guest && (
                  <div className="text-sm text-green-700 mt-2 space-y-1">
                    <p className="font-medium">Invitado: {result.guest.name}</p>
                    <p>{result.guest.email}</p>
                    {result.event && (
                      <p className="text-xs text-green-600 mt-1">Evento: {result.event.name}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* QR Scanner Section */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Escaneo por Cámara
            </CardTitle>
            <CardDescription>
              Usa la cámara de tu dispositivo para escanear el código QR
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showScanner ? (
              <QRScanner
                onScan={handleScan}
                onError={(error) => {
                  setResult({ success: false, message: error });
                }}
                onClose={() => setShowScanner(false)}
              />
            ) : (
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-gray-400" />
                </div>
                <Button
                  onClick={() => setShowScanner(true)}
                  className="w-full"
                  variant="default"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Activar Cámara
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Input Section */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Ingreso Manual
            </CardTitle>
            <CardDescription>
              Ingresa el token del código QR manualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCheckIn();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label htmlFor="token" className="text-sm font-medium">
                  Token QR *
                </label>
                <Input
                  id="token"
                  value={qrToken}
                  onChange={(e) => setQrToken(e.target.value)}
                  placeholder="Pega el token del QR aquí"
                  required
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !qrToken}
                className="w-full"
              >
                {loading ? "Procesando..." : "Realizar Check-in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">Instrucciones:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Para escanear con cámara: presiona "Activar Cámara" y apunta al código QR</li>
            <li>Para ingreso manual: copia y pega el token del código QR</li>
            <li>El sistema validará automáticamente el código y registrará el check-in</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-4xl mx-auto p-8">Cargando...</div>}>
      <CheckInContent />
    </Suspense>
  );
}
