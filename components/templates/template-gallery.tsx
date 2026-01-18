"use client";

import { TEMPLATE_PRESETS, TemplatePreset } from "@/lib/templates/presets";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

interface TemplateGalleryProps {
  onSelectTemplate: (preset: TemplatePreset) => void;
  selectedTemplateId?: string;
}

export function TemplateGallery({ onSelectTemplate, selectedTemplateId }: TemplateGalleryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Elige una plantilla prediseñada</h3>
        <p className="text-sm text-gray-600">
          Selecciona una de nuestras plantillas profesionales y personalízala según tus necesidades
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATE_PRESETS.map((preset) => {
          const isSelected = selectedTemplateId === preset.id;
          
          return (
            <Card
              key={preset.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected
                  ? "ring-2 ring-amber-500 border-amber-500"
                  : "hover:border-gray-300"
              }`}
              onClick={() => onSelectTemplate(preset)}
            >
              <CardContent className="p-0">
                {/* Preview color */}
                <div
                  className="h-32 rounded-t-lg relative"
                  style={{ backgroundColor: preset.previewColor }}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1.5">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  {/* Overlay para mejor visibilidad del texto */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 rounded-t-lg" />
                </div>
                
                {/* Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-base mb-1">{preset.name}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">{preset.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}