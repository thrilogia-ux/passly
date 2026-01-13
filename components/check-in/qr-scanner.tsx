"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScan: (token: string) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export function QRScanner({ onScan, onError, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode("qr-reader");
      
      await scanner.start(
        {
          facingMode: "environment", // Usar cámara trasera en móviles
        },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code escaneado exitosamente
          console.log("✅ QR Code escaneado:", decodedText);
          scanner.stop().then(() => {
            setScanning(false);
            onScan(decodedText);
          }).catch((err) => {
            console.error("Error deteniendo scanner:", err);
            setScanning(false);
          });
        },
        (errorMessage) => {
          // Ignorar errores de escaneo continuo (solo log en desarrollo)
          if (process.env.NODE_ENV === "development") {
            // Log cada 10 intentos para no saturar la consola
            if (Math.random() < 0.1) {
              console.log("Escaneando...", errorMessage);
            }
          }
        }
      );

      scannerRef.current = scanner;
      setScanning(true);
    } catch (err: any) {
      setError(err.message || "Error al iniciar la cámara");
      onError?.(err.message);
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        // Ignorar errores al detener
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="w-full">
      <div className="relative bg-black rounded-lg overflow-hidden" ref={containerRef}>
        <div id="qr-reader" className="w-full" style={{ minHeight: "300px" }}></div>
        
        {!scanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white p-4">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Presiona el botón para iniciar el escaneo</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {scanning && (
          <div className="absolute top-4 right-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={stopScanning}
            >
              <X className="w-4 h-4 mr-1" />
              Detener
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {!scanning ? (
          <Button
            onClick={startScanning}
            className="flex-1"
            variant="default"
          >
            <Camera className="w-4 h-4 mr-2" />
            Iniciar Escaneo
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            className="flex-1"
            variant="outline"
          >
            Detener Escaneo
          </Button>
        )}
        {onClose && (
          <Button onClick={onClose} variant="ghost">
            Cerrar
          </Button>
        )}
      </div>
    </div>
  );
}
