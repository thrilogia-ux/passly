"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Move, Maximize2, Minimize2, Grid3x3 } from "lucide-react";

type QRPosition = 
  | "top-left" 
  | "top-center" 
  | "top-right"
  | "center-left" 
  | "center" 
  | "center-right"
  | "bottom-left" 
  | "bottom-center" 
  | "bottom-right"
  | "custom";

interface QRPositionEditorV2Props {
  backgroundImage: string;
  onPositionChange: (position: { 
    zone: QRPosition;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }) => void;
  initialPosition?: { 
    zone?: QRPosition;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
  qrSize?: number;
}

export function QRPositionEditorV2({ 
  backgroundImage, 
  onPositionChange, 
  initialPosition,
  qrSize = 200
}: QRPositionEditorV2Props) {
  const [selectedZone, setSelectedZone] = useState<QRPosition>(
    initialPosition?.zone || "bottom-right"
  );
  const [customPosition, setCustomPosition] = useState({
    x: initialPosition?.x || 0,
    y: initialPosition?.y || 0,
    width: initialPosition?.width || qrSize,
    height: initialPosition?.height || qrSize,
  });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
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

  // Calcular posición basada en la zona seleccionada
  const getZonePosition = (zone: QRPosition, imgWidth: number, imgHeight: number, qrW: number, qrH: number) => {
    const margin = 20; // Margen desde los bordes
    
    switch (zone) {
      case "top-left":
        return { x: margin, y: margin };
      case "top-center":
        return { x: (imgWidth - qrW) / 2, y: margin };
      case "top-right":
        return { x: imgWidth - qrW - margin, y: margin };
      case "center-left":
        return { x: margin, y: (imgHeight - qrH) / 2 };
      case "center":
        return { x: (imgWidth - qrW) / 2, y: (imgHeight - qrH) / 2 };
      case "center-right":
        return { x: imgWidth - qrW - margin, y: (imgHeight - qrH) / 2 };
      case "bottom-left":
        return { x: margin, y: imgHeight - qrH - margin };
      case "bottom-center":
        return { x: (imgWidth - qrW) / 2, y: imgHeight - qrH - margin };
      case "bottom-right":
        return { x: imgWidth - qrW - margin, y: imgHeight - qrH - margin };
      case "custom":
        return { x: customPosition.x, y: customPosition.y };
      default:
        return { x: margin, y: margin };
    }
  };

  const currentPosition = selectedZone === "custom" 
    ? customPosition 
    : imageSize.width > 0 && imageSize.height > 0
    ? {
        ...getZonePosition(selectedZone, imageSize.width, imageSize.height, customPosition.width, customPosition.height),
        width: customPosition.width,
        height: customPosition.height,
      }
    : customPosition;

  useEffect(() => {
    if (imageSize.width > 0 && imageSize.height > 0) {
      const pos = selectedZone === "custom" 
        ? customPosition
        : {
            ...getZonePosition(selectedZone, imageSize.width, imageSize.height, customPosition.width, customPosition.height),
            width: customPosition.width,
            height: customPosition.height,
          };
      
      onPositionChange({
        zone: selectedZone,
        ...pos,
      });
    }
  }, [selectedZone, customPosition, imageSize]);

  const handleZoneSelect = (zone: QRPosition) => {
    setSelectedZone(zone);
    if (zone !== "custom") {
      // Calcular posición automáticamente
      if (imageSize.width > 0 && imageSize.height > 0) {
        const pos = getZonePosition(zone, imageSize.width, imageSize.height, customPosition.width, customPosition.height);
        setCustomPosition({
          ...customPosition,
          x: pos.x,
          y: pos.y,
        });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedZone !== "custom") {
      setSelectedZone("custom");
    }
    setDragging(true);
    setDragStart({
      x: e.clientX - currentPosition.x,
      y: e.clientY - currentPosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && containerRef.current && selectedZone === "custom") {
      const rect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragStart.x;
      const newY = e.clientY - rect.top - dragStart.y;
      
      const maxX = imageSize.width - currentPosition.width;
      const maxY = imageSize.height - currentPosition.height;
      
      setCustomPosition({
        ...customPosition,
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleSizeChange = (delta: number) => {
    const newSize = Math.max(50, Math.min(500, customPosition.width + delta));
    setCustomPosition({
      ...customPosition,
      width: newSize,
      height: newSize,
    });
  };

  return (
    <div className="w-full">
      {/* Selector de zonas */}
      <div className="mb-4">
        <label className="text-sm font-medium block mb-2">Posición del QR</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            "top-left", "top-center", "top-right",
            "center-left", "center", "center-right",
            "bottom-left", "bottom-center", "bottom-right",
          ] as QRPosition[]).map((zone) => (
            <Button
              key={zone}
              type="button"
              variant={selectedZone === zone ? "default" : "outline"}
              size="sm"
              onClick={() => handleZoneSelect(zone)}
              className="text-xs"
            >
              {zone.replace("-", " ")}
            </Button>
          ))}
          <Button
            type="button"
            variant={selectedZone === "custom" ? "default" : "outline"}
            size="sm"
            onClick={() => handleZoneSelect("custom")}
            className="text-xs col-span-3"
          >
            <Move className="w-4 h-4 mr-1" />
            Personalizado (arrastrar)
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div 
        ref={containerRef}
        className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img 
          ref={imageRef}
          src={backgroundImage} 
          alt="Template preview" 
          className="w-full h-auto max-h-[600px] object-contain"
        />
        {imageSize.width > 0 && imageSize.height > 0 && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/20 cursor-move group"
            style={{
              left: `${(currentPosition.x / imageSize.width) * 100}%`,
              top: `${(currentPosition.y / imageSize.height) * 100}%`,
              width: `${(currentPosition.width / imageSize.width) * 100}%`,
              height: `${(currentPosition.height / imageSize.height) * 100}%`,
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs text-blue-600 bg-white/80 px-2 py-1 rounded">
                QR Code
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controles de tamaño */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex-1">
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
              value={Math.round(customPosition.width)}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setCustomPosition({
                  ...customPosition,
                  width: newSize,
                  height: newSize,
                });
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
    </div>
  );
}
