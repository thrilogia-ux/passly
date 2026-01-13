"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Move, Maximize2, Minimize2 } from "lucide-react";

interface QRPositionEditorProps {
  backgroundImage: string;
  onPositionChange: (position: { 
    x: number; 
    y: number; 
    width: number; 
    height: number;
    previewWidth?: number;
    previewHeight?: number;
    percentX?: number;
    percentY?: number;
    percentWidth?: number;
    percentHeight?: number;
    realImageWidth?: number;
    realImageHeight?: number;
  }) => void;
  initialPosition?: { x: number; y: number; width: number; height: number; previewWidth?: number; previewHeight?: number; percentX?: number; percentY?: number; percentWidth?: number; percentHeight?: number; realImageWidth?: number; realImageHeight?: number };
  qrSize?: number;
}

export function QRPositionEditor({ 
  backgroundImage, 
  onPositionChange, 
  initialPosition,
  qrSize = 200
}: QRPositionEditorProps) {
  const [position, setPosition] = useState(
    initialPosition || { x: 100, y: 100, width: qrSize, height: qrSize }
  );
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      const updateSize = () => {
        // Obtener dimensiones REALES de la imagen (naturalWidth/naturalHeight)
        // Estas son las dimensiones originales del archivo, no las mostradas
        const realWidth = img.naturalWidth || img.offsetWidth;
        const realHeight = img.naturalHeight || img.offsetHeight;
        
        // Y también las dimensiones mostradas en el preview
        const displayWidth = img.offsetWidth;
        const displayHeight = img.offsetHeight;
        
        setImageSize({
          width: displayWidth,
          height: displayHeight,
        });
        
        // Guardar dimensiones reales en un ref para usarlas después
        (img as any).__realWidth = realWidth;
        (img as any).__realHeight = realHeight;
      };
      img.addEventListener("load", updateSize);
      updateSize();
      return () => img.removeEventListener("load", updateSize);
    }
  }, [backgroundImage]);

  const handleMouseDown = (e: React.MouseEvent, type: "drag" | "resize") => {
    e.preventDefault();
    if (type === "drag") {
      setDragging(true);
    } else {
      setResizing(true);
    }
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragStart.x;
      const newY = e.clientY - rect.top - dragStart.y;
      
      // Limitar dentro del contenedor
      const maxX = imageSize.width - position.width;
      const maxY = imageSize.height - position.height;
      
      setPosition({
        ...position,
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    } else if (resizing && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left - position.x;
      const newHeight = e.clientY - rect.top - position.y;
      
      const minSize = 50;
      const maxSize = Math.min(imageSize.width, imageSize.height) * 0.5;
      
      setPosition({
        ...position,
        width: Math.max(minSize, Math.min(newWidth, maxSize)),
        height: Math.max(minSize, Math.min(newHeight, maxSize)),
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
    // SOLUCIÓN RADICAL: Calcular porcentajes basados en la imagen REAL
    if (imageRef.current && imageSize.width > 0 && imageSize.height > 0) {
      const img = imageRef.current;
      const realWidth = (img as any).__realWidth || img.naturalWidth || imageSize.width;
      const realHeight = (img as any).__realHeight || img.naturalHeight || imageSize.height;
      
      // Calcular la escala del preview a la imagen real
      const scaleX = realWidth / imageSize.width;
      const scaleY = realHeight / imageSize.height;
      
      // Convertir coordenadas del preview a coordenadas de la imagen REAL
      const realX = position.x * scaleX;
      const realY = position.y * scaleY;
      const realWidth_qr = position.width * scaleX;
      const realHeight_qr = position.height * scaleY;
      
      // Guardar como porcentajes de la imagen REAL (no del preview)
      onPositionChange({
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
        // Porcentajes de la imagen REAL (esto es lo que importa)
        percentX: (realX / realWidth) * 100,
        percentY: (realY / realHeight) * 100,
        percentWidth: (realWidth_qr / realWidth) * 100,
        percentHeight: (realHeight_qr / realHeight) * 100,
        // Guardar también dimensiones reales para validación
        realImageWidth: realWidth,
        realImageHeight: realHeight,
        previewWidth: imageSize.width,
        previewHeight: imageSize.height,
      });
    } else {
      onPositionChange({
        ...position,
        previewWidth: imageSize.width,
        previewHeight: imageSize.height,
      });
    }
  };

  const handleSizeChange = (delta: number) => {
    const newSize = Math.max(50, Math.min(500, position.width + delta));
    const newPos = {
      ...position,
      width: newSize,
      height: newSize,
    };
    setPosition(newPos);
    if (imageRef.current && imageSize.width > 0 && imageSize.height > 0) {
      const img = imageRef.current;
      const realWidth = (img as any).__realWidth || img.naturalWidth || imageSize.width;
      const realHeight = (img as any).__realHeight || img.naturalHeight || imageSize.height;
      const scaleX = realWidth / imageSize.width;
      const scaleY = realHeight / imageSize.height;
      
      const realX = newPos.x * scaleX;
      const realY = newPos.y * scaleY;
      const realWidth_qr = newSize * scaleX;
      const realHeight_qr = newSize * scaleY;
      
      onPositionChange({
        ...newPos,
        percentX: (realX / realWidth) * 100,
        percentY: (realY / realHeight) * 100,
        percentWidth: (realWidth_qr / realWidth) * 100,
        percentHeight: (realHeight_qr / realHeight) * 100,
        realImageWidth: realWidth,
        realImageHeight: realHeight,
        previewWidth: imageSize.width,
        previewHeight: imageSize.height,
      });
    } else {
      onPositionChange({
        ...newPos,
        previewWidth: imageSize.width,
        previewHeight: imageSize.height,
      });
    }
  };

  return (
    <div className="w-full">
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
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/20 cursor-move group"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${position.width}px`,
            height: `${position.height}px`,
          }}
          onMouseDown={(e) => handleMouseDown(e, "drag")}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs text-blue-600 bg-white/80 px-2 py-1 rounded">
              QR Code
            </div>
          </div>
          
          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown(e, "resize");
            }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium w-20">X:</label>
            <input
              type="number"
              value={Math.round(position.x)}
              onChange={(e) => {
                const newPos = { ...position, x: Number(e.target.value) };
                setPosition(newPos);
                if (imageRef.current && imageSize.width > 0 && imageSize.height > 0) {
                  const img = imageRef.current;
                  const realWidth = (img as any).__realWidth || img.naturalWidth || imageSize.width;
                  const realHeight = (img as any).__realHeight || img.naturalHeight || imageSize.height;
                  const scaleX = realWidth / imageSize.width;
                  const scaleY = realHeight / imageSize.height;
                  
                  const realX = newPos.x * scaleX;
                  const realY = newPos.y * scaleY;
                  const realWidth_qr = newPos.width * scaleX;
                  const realHeight_qr = newPos.height * scaleY;
                  
                  onPositionChange({
                    ...newPos,
                    percentX: (realX / realWidth) * 100,
                    percentY: (realY / realHeight) * 100,
                    percentWidth: (realWidth_qr / realWidth) * 100,
                    percentHeight: (realHeight_qr / realHeight) * 100,
                    realImageWidth: realWidth,
                    realImageHeight: realHeight,
                    previewWidth: imageSize.width,
                    previewHeight: imageSize.height,
                  });
                } else {
                  onPositionChange({
                    ...newPos,
                    previewWidth: imageSize.width,
                    previewHeight: imageSize.height,
                  });
                }
              }}
              className="flex-1 px-2 py-1 border rounded text-sm"
              min="0"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium w-20">Y:</label>
            <input
              type="number"
              value={Math.round(position.y)}
              onChange={(e) => {
                const newPos = { ...position, y: Number(e.target.value) };
                setPosition(newPos);
                if (imageRef.current && imageSize.width > 0 && imageSize.height > 0) {
                  const img = imageRef.current;
                  const realWidth = (img as any).__realWidth || img.naturalWidth || imageSize.width;
                  const realHeight = (img as any).__realHeight || img.naturalHeight || imageSize.height;
                  const scaleX = realWidth / imageSize.width;
                  const scaleY = realHeight / imageSize.height;
                  
                  const realX = newPos.x * scaleX;
                  const realY = newPos.y * scaleY;
                  const realWidth_qr = newPos.width * scaleX;
                  const realHeight_qr = newPos.height * scaleY;
                  
                  onPositionChange({
                    ...newPos,
                    percentX: (realX / realWidth) * 100,
                    percentY: (realY / realHeight) * 100,
                    percentWidth: (realWidth_qr / realWidth) * 100,
                    percentHeight: (realHeight_qr / realHeight) * 100,
                    realImageWidth: realWidth,
                    realImageHeight: realHeight,
                    previewWidth: imageSize.width,
                    previewHeight: imageSize.height,
                  });
                } else {
                  onPositionChange({
                    ...newPos,
                    previewWidth: imageSize.width,
                    previewHeight: imageSize.height,
                  });
                }
              }}
              className="flex-1 px-2 py-1 border rounded text-sm"
              min="0"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium w-20">Tamaño:</label>
            <input
              type="number"
              value={Math.round(position.width)}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                const newPos = { ...position, width: newSize, height: newSize };
                setPosition(newPos);
                if (imageRef.current && imageSize.width > 0 && imageSize.height > 0) {
                  const img = imageRef.current;
                  const realWidth = (img as any).__realWidth || img.naturalWidth || imageSize.width;
                  const realHeight = (img as any).__realHeight || img.naturalHeight || imageSize.height;
                  const scaleX = realWidth / imageSize.width;
                  const scaleY = realHeight / imageSize.height;
                  
                  const realX = newPos.x * scaleX;
                  const realY = newPos.y * scaleY;
                  const realWidth_qr = newSize * scaleX;
                  const realHeight_qr = newSize * scaleY;
                  
                  onPositionChange({
                    ...newPos,
                    percentX: (realX / realWidth) * 100,
                    percentY: (realY / realHeight) * 100,
                    percentWidth: (realWidth_qr / realWidth) * 100,
                    percentHeight: (realHeight_qr / realHeight) * 100,
                    realImageWidth: realWidth,
                    realImageHeight: realHeight,
                    previewWidth: imageSize.width,
                    previewHeight: imageSize.height,
                  });
                } else {
                  onPositionChange({
                    ...newPos,
                    previewWidth: imageSize.width,
                    previewHeight: imageSize.height,
                  });
                }
              }}
              className="flex-1 px-2 py-1 border rounded text-sm"
              min="50"
              max="500"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSizeChange(10)}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSizeChange(-10)}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
