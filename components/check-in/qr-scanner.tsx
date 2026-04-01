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

/** Cámara trasera por etiqueta del dispositivo (más fiable que solo facingMode en móvil). */
function pickRearCameraId(devices: { id: string; label: string }[]): string | undefined {
  if (!devices.length) return undefined;

  const facingBack = devices.find((d) =>
    /facing\s+back|facing\s+environment/i.test(d.label)
  );
  if (facingBack) return facingBack.id;

  const lower = (s: string) => s.toLowerCase();
  const rearHints = [
    "back",
    "rear",
    "environment",
    "trasera",
    "posterior",
    "traseira",
    "arrière",
    "wide angle",
    "wide-angle",
  ];
  const frontHints = [
    "front",
    "user",
    "selfie",
    "face",
    "facial",
    "delantera",
    "truedepth",
  ];

  const matchesRear = (label: string) => rearHints.some((h) => lower(label).includes(h));
  const matchesFront = (label: string) => frontHints.some((h) => lower(label).includes(h));

  const rearOnly = devices.filter((d) => matchesRear(d.label) && !matchesFront(d.label));
  if (rearOnly.length >= 1) return rearOnly[0].id;

  const notClearlyFront = devices.filter((d) => !matchesFront(d.label) && d.label.trim() !== "");
  if (notClearlyFront.length === 1) return notClearlyFront[0].id;

  return undefined;
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

      const onDecoded = (decodedText: string) => {
        console.log("✅ QR Code escaneado:", decodedText);
        scanner.stop().then(() => {
          setScanning(false);
          onScan(decodedText);
        }).catch((err) => {
          console.error("Error deteniendo scanner:", err);
          setScanning(false);
        });
      };

      const onFrameError = (errorMessage: string) => {
        if (process.env.NODE_ENV === "development" && Math.random() < 0.1) {
          console.log("Escaneando...", errorMessage);
        }
      };

      const scanConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 } as const,
        disableFlip: true,
      };

      let started = false;
      const cameras = await Html5Qrcode.getCameras();
      const rearId = pickRearCameraId(cameras);

      if (rearId) {
        try {
          await scanner.start(rearId, scanConfig, onDecoded, onFrameError);
          started = true;
        } catch (e) {
          console.warn("[QR] deviceId trasero falló, probando facingMode…", e);
        }
      }

      if (!started) {
        try {
          await scanner.start(
            { facingMode: { exact: "environment" } },
            scanConfig,
            onDecoded,
            onFrameError
          );
          started = true;
        } catch {
          /* sin cámara trasera (p. ej. laptop) */
        }
      }

      if (!started) {
        await scanner.start(
          { facingMode: "environment" },
          scanConfig,
          onDecoded,
          onFrameError
        );
      }

      scannerRef.current = scanner;
      setScanning(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al iniciar la cámara";
      setError(message);
      onError?.(message);
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
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
            <Button variant="destructive" size="sm" onClick={stopScanning}>
              <X className="w-4 h-4 mr-1" />
              Detener
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {!scanning ? (
          <Button onClick={startScanning} className="flex-1" variant="default">
            <Camera className="w-4 h-4 mr-2" />
            Iniciar Escaneo
          </Button>
        ) : (
          <Button onClick={stopScanning} className="flex-1" variant="outline">
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
