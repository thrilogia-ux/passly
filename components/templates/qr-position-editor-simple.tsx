"use client";

import { useState, useEffect, useRef } from "react";
import { Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRPositionEditorSimpleProps {
  backgroundImage: string;
  onPositionChange: (position: { 
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  initialPosition?: { 
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
  qrSize?: number;
}

export function QRPositionEditorSimple({ 
  backgroundImage, 
  onPositionChange, 
  initialPosition,
  qrSize = 200
}: QRPositionEditorSimpleProps) {
  const [position, setPosition] = useState({
    y: initialPosition?.y || 0,
    width: initialPosition?.width || qrSize,
    height: initialPosition?.height || qrSize,
  });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [verticalPercent, setVerticalPercent] = useState(80); // Por defecto 80% desde arriba
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      const updateSize = () => {
        const realWidth = img.naturalWidth || img.offsetWidth;
        const realHeight = img.naturalHeight || img.offsetHeight;
        setImageSize({
          width: realWidth,
          height: realHeight,
        });
      };
      img.addEventListener("load", updateSize);
      updateSize();
      return () => img.removeEventListener("load", updateSize);
    }
  }, [backgroundImage]);

  // Si hay initialPosition, calcular el porcentaje vertical inicial
  useEffect(() => {
    if (initialPosition?.y !== undefined && imageSize.height > 0) {
      const qrHeight = initialPosition.height || position.height;
      const centerY = initialPosition.y + (qrHeight / 2);
      const percent = (centerY / imageSize.height) * 100;
      setVerticalPercent(Math.max(0, Math.min(100, percent)));
    }
  }, [imageSize.height, initialPosition]);

  // Calcular posición: X siempre centrado, Y según el porcentaje vertical
  useEffect(() => {
    if (imageSize.width > 0 && imageSize.height > 0) {
      const centerX = (imageSize.width - position.width) / 2; // Siempre centrado
      const y = (imageSize.height * verticalPercent / 100) - (position.height / 2); // Centrado en el porcentaje vertical
      
      const clampedY = Math.max(0, Math.min(y, imageSize.height - position.height));
      
      const newPosition = {
        x: centerX,
        y: clampedY,
        width: position.width,
        height: position.height,
      };
      
      setPosition(prev => ({ ...prev, ...newPosition }));
      onPositionChange(newPosition);
    }
  }, [verticalPercent, position.width, position.height, imageSize]);

  const handleSizeChange = (delta: number) => {
    const newSize = Math.max(50, Math.min(500, position.width + delta));
    setPosition(prev => ({
      ...prev,
      width: newSize,
      height: newSize,
    }));
  };

  const centerX = imageSize.width > 0 ? (imageSize.width - position.width) / 2 : 0;
  const currentY = imageSize.height > 0 
    ? Math.max(0, Math.min(
        (imageSize.height * verticalPercent / 100) - (position.height / 2),
        imageSize.height - position.height
      ))
    : position.y;

  return (
    <div className="w-full">
      {/* Controles */}
      <div className="space-y-4 mb-4">
        {/* Slider de posición vertical */}
        <div>
          <label className="text-sm font-medium block mb-3">
            Posición Vertical del QR
          </label>
          <div className="space-y-2">
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={verticalPercent}
                onChange={(e) => setVerticalPercent(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${verticalPercent}%, #e5e7eb ${verticalPercent}%, #e5e7eb 100%)`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Arriba (0%)</span>
              <span className="font-medium text-blue-600">{Math.round(verticalPercent)}%</span>
              <span>Abajo (100%)</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 El QR siempre estará centrado horizontalmente. Ajusta este control para moverlo más arriba o más abajo.
            </p>
          </div>
        </div>

        {/* Controles de tamaño */}
        <div>
          <label className="text-sm font-medium block mb-2">Tamaño del QR</label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSizeChange(-10)}
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <input
              type="number"
              value={Math.round(position.width)}
              onChange={(e) => {
                const newSize = Math.max(50, Math.min(500, Number(e.target.value)));
                setPosition(prev => ({
                  ...prev,
                  width: newSize,
                  height: newSize,
                }));
              }}
              className="flex-1 px-2 py-1 border rounded text-sm text-center"
              min="50"
              max="500"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSizeChange(10)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
        <img 
          ref={imageRef}
          src={backgroundImage} 
          alt="Template preview" 
          className="w-full h-auto max-h-[600px] object-contain"
        />
        {imageSize.width > 0 && imageSize.height > 0 && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/20"
            style={{
              left: `${(centerX / imageSize.width) * 100}%`,
              top: `${(currentY / imageSize.height) * 100}%`,
              width: `${(position.width / imageSize.width) * 100}%`,
              height: `${(position.height / imageSize.height) * 100}%`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs text-blue-600 bg-white/80 px-2 py-1 rounded font-medium">
                QR Code (Centrado)
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}