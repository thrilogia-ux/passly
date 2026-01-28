"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileSpreadsheet, 
  FileText, 
  Users, 
  CheckCircle, 
  XCircle, 
  UtensilsCrossed, 
  ClipboardList,
  BarChart3,
  Download,
  Loader2,
  Calendar,
  MapPin
} from "lucide-react";
import Link from "next/link";

interface EventSummary {
  evento: {
    nombre: string;
    fecha: string;
    ubicacion: string;
  };
  invitados: {
    total: number;
    invitacionesEnviadas: number;
    confirmados: number;
    rechazados: number;
    pendientes: number;
    conRestriccionesAlimentarias: number;
    totalPersonas: number;
  };
  asistencia: {
    checkIns: number;
    tasaAsistencia: string;
  };
}

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [summary, setSummary] = useState<EventSummary | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(eventId || "");

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadSummary(selectedEventId);
    } else {
      setSummary(null);
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
        
        // Si hay un eventId en la URL, seleccionarlo
        if (eventId) {
          setSelectedEventId(eventId);
        }
      }
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/export?type=summary`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (error) {
      console.error("Error loading summary:", error);
    }
  };

  const handleDownload = async (reportType: string, format: string = "xlsx") => {
    if (!selectedEventId) {
      alert("Por favor seleccioná un evento");
      return;
    }

    setDownloading(reportType);
    try {
      const res = await fetch(`/api/events/${selectedEventId}/export?type=${reportType}&format=${format}`);
      
      if (!res.ok) {
        throw new Error("Error al generar el reporte");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Obtener el nombre del archivo del header
      const contentDisposition = res.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      a.download = filenameMatch ? filenameMatch[1] : `reporte.${format}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      alert(error.message || "Error al descargar el reporte");
    } finally {
      setDownloading(null);
    }
  };

  const reportTypes = [
    {
      id: "complete",
      name: "Reporte Completo",
      description: "Todos los invitados con toda la información disponible",
      icon: FileSpreadsheet,
      color: "bg-blue-500",
    },
    {
      id: "confirmed",
      name: "Solo Confirmados",
      description: "Invitados que confirmaron asistencia",
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      id: "dietary",
      name: "Restricciones Alimentarias",
      description: "Para enviar al catering",
      icon: UtensilsCrossed,
      color: "bg-orange-500",
    },
    {
      id: "checkin-list",
      name: "Lista de Check-in",
      description: "Lista ordenada para controlar en la entrada",
      icon: ClipboardList,
      color: "bg-purple-500",
    },
    {
      id: "attendance",
      name: "Asistencia Real",
      description: "Quiénes hicieron check-in vs quiénes no",
      icon: Users,
      color: "bg-teal-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff5040]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Reportes</h1>
        <p className="mt-2 text-gray-600">Descargá reportes detallados de tus eventos</p>
      </div>

      {/* Selector de Evento */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seleccionar Evento</CardTitle>
          <CardDescription>Elegí el evento del cual querés generar reportes</CardDescription>
        </CardHeader>
        <CardContent>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="flex h-10 w-full max-w-md rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">-- Seleccionar evento --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} - {new Date(event.date).toLocaleDateString("es-AR")}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Resumen del Evento */}
      {summary && (
        <Card className="mb-6 border-[#ff5040]">
          <CardHeader className="bg-gradient-to-r from-[#ffe4dd] to-white">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#ff5040]" />
              Resumen: {summary.evento.nombre}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {summary.evento.fecha}
              </span>
              {summary.evento.ubicacion !== "-" && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {summary.evento.ubicacion}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-[#303030]">{summary.invitados.total}</p>
                <p className="text-sm text-gray-600">Total Invitados</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-600">{summary.invitados.confirmados}</p>
                <p className="text-sm text-gray-600">Confirmados</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-red-600">{summary.invitados.rechazados}</p>
                <p className="text-sm text-gray-600">Rechazados</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-yellow-600">{summary.invitados.pendientes}</p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-600">{summary.invitados.invitacionesEnviadas}</p>
                <p className="text-sm text-gray-600">Invitaciones Enviadas</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-orange-600">{summary.invitados.conRestriccionesAlimentarias}</p>
                <p className="text-sm text-gray-600">Con Restricciones</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-purple-600">{summary.asistencia.checkIns}</p>
                <p className="text-sm text-gray-600">Check-ins</p>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-teal-600">{summary.asistencia.tasaAsistencia}</p>
                <p className="text-sm text-gray-600">Tasa Asistencia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tipos de Reportes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isDownloading = downloading === report.id;
          
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${report.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownload(report.id, "xlsx")}
                    disabled={!selectedEventId || isDownloading}
                    className="flex-1"
                    size="sm"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-1" />
                        Excel
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDownload(report.id, "csv")}
                    disabled={!selectedEventId || isDownloading}
                    variant="outline"
                    size="sm"
                  >
                    CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mensaje si no hay evento seleccionado */}
      {!selectedEventId && (
        <div className="mt-8 text-center text-gray-500">
          <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Seleccioná un evento para ver el resumen y descargar reportes</p>
        </div>
      )}

      {/* Acciones adicionales */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Otras opciones</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Link href="/dashboard/reports/compare">
              <Button variant="outline">Comparar Eventos</Button>
            </Link>
            {selectedEventId && (
              <Link href={`/dashboard/events/${selectedEventId}`}>
                <Button variant="outline">Ver Evento</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
