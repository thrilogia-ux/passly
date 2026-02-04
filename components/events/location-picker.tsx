"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

export function LocationPicker({
  value,
  onChange,
  placeholder = "Buscar dirección o lugar...",
  id = "location",
  className,
}: LocationPickerProps) {
  const [mapAddress, setMapAddress] = useState<string | null>(value || null);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchAddress = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({
            q: query,
            format: "json",
            limit: "5",
            addressdetails: "1",
            "accept-language": "es",
          }),
        {
          headers: {
            "User-Agent": "PasslyApp/1.0 (Event Location Picker)",
          },
        }
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching address:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const [geocodedCoords, setGeocodedCoords] = useState<{ lat: number; lon: number } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setMapAddress(newValue || null);
    setCoords(null);
    setGeocodedCoords(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(newValue), 400);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleInputFocus = () => {
    if (value && value.length >= 3) searchAddress(value);
  };

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync map preview when value changes externally (e.g. edit form load)
  useEffect(() => {
    if (value && value !== mapAddress) {
      setMapAddress(value);
    }
  }, [value]);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  const handleSelectWithCoords = (result: NominatimResult) => {
    onChange(result.display_name);
    setMapAddress(result.display_name);
    setCoords({ lat: parseFloat(result.lat), lon: parseFloat(result.lon) });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Geocode para mostrar mapa cuando el usuario escribe sin seleccionar sugerencia
  useEffect(() => {
    if (!mapAddress || mapAddress.length < 3) {
      setGeocodedCoords(null);
      return;
    }
    if (coords) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
              q: mapAddress,
              format: "json",
              limit: "1",
            }),
          { headers: { "User-Agent": "PasslyApp/1.0" } }
        );
        const data: NominatimResult[] = await res.json();
        if (data[0]) {
          setGeocodedCoords({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
          });
        } else {
          setGeocodedCoords(null);
        }
      } catch {
        setGeocodedCoords(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [mapAddress, coords]);

  const displayCoords = coords || geocodedCoords;
  const finalEmbedUrl = displayCoords
    ? (() => {
        const d = 0.01;
        const bbox = [
          displayCoords.lon - d,
          displayCoords.lat - d,
          displayCoords.lon + d,
          displayCoords.lat + d,
        ].join("%2C");
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${displayCoords.lat}%2C${displayCoords.lon}`;
      })()
    : null;


  return (
    <div ref={containerRef} className="space-y-3">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          id={id}
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`pl-10 pr-10 ${className || ""}`}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin pointer-events-none" />
        )}
        {showSuggestions && suggestions.length > 0 && (
          <ul
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto"
            role="listbox"
          >
            {suggestions.map((result, i) => (
              <li
                key={`${result.lat}-${result.lon}-${i}`}
                role="option"
                className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0 text-sm"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectWithCoords(result);
                }}
              >
                <span className="text-gray-800">{result.display_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {mapAddress && finalEmbedUrl && (
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-gray-50 px-3 py-2 text-xs text-gray-600 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Vista previa (OpenStreetMap)</span>
          </div>
          <iframe
            title="Mapa de ubicación"
            src={finalEmbedUrl}
            className="w-full h-48 border-0"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
