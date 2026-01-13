"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, Download, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";

export default function ImportGuestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get("eventId");
  
  const [eventId, setEventId] = useState(eventIdParam || "");
  const [events, setEvents] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Cargar eventos
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data);
        }
      })
      .catch(err => console.error("Error loading events:", err));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview([]);
    setResult(null);
    
    // Leer y previsualizar
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileData = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(fileData, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        
        // Mapear columnas (flexible: acepta diferentes nombres)
        const mapped = json.map((row: any) => {
          const email = row.email || row.Email || row.EMAIL || row.correo || row.Correo || "";
          const name = row.name || row.Name || row.NAME || row.nombre || row.Nombre || "";
          const phone = row.phone || row.Phone || row.PHONE || row.telefono || row.Telefono || "";
          const type = row.type || row.Type || row.TYPE || row.tipo || row.Tipo || "VIP";
          
          return { email, name, phone, type, original: row };
        }).filter(row => row.email && row.name); // Solo filas válidas
        
        setPreview(mapped.slice(0, 10)); // Primeros 10 para preview
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Error al leer el archivo. Asegúrate de que sea un Excel válido.");
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      alert("Por favor selecciona un archivo");
      return;
    }

    if (!eventId) {
      alert("Por favor selecciona un evento");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileData = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(fileData, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet);

          // Mapear columnas
          const guests = json.map((row: any) => ({
            email: row.email || row.Email || row.EMAIL || row.correo || row.Correo || "",
            name: row.name || row.Name || row.NAME || row.nombre || row.Nombre || "",
            phone: row.phone || row.Phone || row.PHONE || row.telefono || row.Telefono || "",
            type: row.type || row.Type || row.TYPE || row.tipo || row.Tipo || "VIP",
          })).filter(g => g.email && g.name); // Solo válidos

          if (guests.length === 0) {
            throw new Error("No se encontraron invitados válidos en el archivo. Asegúrate de que tenga columnas 'email' y 'name'");
          }

          const res = await fetch("/api/guests/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guests, eventId }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Error al importar invitados");
          }

          setResult(data);
          
          // Redirigir después de 2 segundos
          setTimeout(() => {
            router.push(`/dashboard/events/${eventId}/guests`);
          }, 2000);
        } catch (error: any) {
          setResult({
            success: false,
            error: error.message || "Error al importar invitados",
          });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Error al procesar el archivo",
      });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={eventId ? `/dashboard/guests?eventId=${eventId}` : "/dashboard/guests"} className="text-sm text-gray-600 hover:text-gray-900">
          ← Volver a Invitados
        </Link>
        <h1 className="mt-2 text-2xl md:text-3xl font-bold">Importar Invitados desde Excel</h1>
        <p className="mt-2 text-sm md:text-base text-gray-600">
          Carga una nómina de invitados desde un archivo Excel o CSV
        </p>
      </div>

      <Card className="mb-6 border-2 border-[#00b5ff]/20">
        <CardHeader>
          <CardTitle>Paso 1: Seleccionar Evento</CardTitle>
          <CardDescription>
            Selecciona el evento al que se asignarán los invitados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            required
          >
            <option value="">-- Selecciona un evento --</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name} - {new Date(event.date).toLocaleDateString("es-AR")}
              </option>
            ))}
          </select>
          {!eventId && (
            <p className="text-xs text-red-600 mt-2">
              * Debes seleccionar un evento para continuar
            </p>
          )}
          {eventId && (
            <p className="text-xs text-green-600 mt-2">
              ✓ Evento seleccionado. Los invitados se asignarán automáticamente a este evento.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Paso 2: Subir Archivo</CardTitle>
          <CardDescription>
            El archivo debe tener columnas: <strong>email</strong>, <strong>name</strong>, <strong>phone</strong> (opcional), <strong>type</strong> (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={!eventId}
            />
            <label htmlFor="file-upload">
              <Button type="button" variant="outline" disabled={!eventId}>
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar Archivo Excel/CSV
              </Button>
            </label>
            {file && (
              <p className="mt-2 text-sm text-gray-600 font-medium">{file.name}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Formatos soportados: .xlsx, .xls, .csv
            </p>
          </div>

          {preview.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Vista Previa (primeros 10 registros)</h3>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Nombre</th>
                      <th className="p-2 text-left">Teléfono</th>
                      <th className="p-2 text-left">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="p-2">{row.email}</td>
                        <td className="p-2">{row.name}</td>
                        <td className="p-2">{row.phone || "-"}</td>
                        <td className="p-2">{row.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Se procesarán todos los registros válidos del archivo
              </p>
            </div>
          )}

          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={handleImport}
              disabled={!file || !eventId || loading}
              className="flex-1 min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Invitados
                </>
              )}
            </Button>
            <a href="/api/guests/import/template" download="plantilla-invitados.xlsx">
              <Button variant="outline" type="button">
                <Download className="w-4 h-4 mr-2" />
                Descargar Plantilla
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className={`${result.success !== false ? "border-green-500" : "border-red-500"}`}>
          <CardContent className="pt-6">
            {result.success !== false ? (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div className="flex-1">
                  <p className="font-semibold text-green-800">¡Importación exitosa!</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Creados: {result.created || 0}, Actualizados: {result.updated || 0}
                    {result.errors && result.errors.length > 0 && (
                      <span className="text-red-600">, Errores: {result.errors.length}</span>
                    )}
                  </p>
                  {result.errors && result.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">Ver errores detallados</summary>
                      <ul className="text-xs text-red-600 mt-1 space-y-1 list-disc list-inside">
                        {result.errors.slice(0, 10).map((err: any, i: number) => (
                          <li key={i}>{err.email}: {err.error}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-semibold text-red-800">Error</p>
                  <p className="text-sm text-gray-600">{result.error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
