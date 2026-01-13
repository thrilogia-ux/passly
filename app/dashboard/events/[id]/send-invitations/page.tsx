"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, Loader2, CheckCircle, XCircle, Filter, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import { InvitationStatus } from "@prisma/client";

export default function SendInvitationsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [guestEvents, setGuestEvents] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "no-invitation" | "pending" | "sent" | "not-sent">("not-sent");

  useEffect(() => {
    if (!eventId) return;
    
    loadData();
  }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar datos del evento con guestEvents e invitaciones
      const eventResponse = await fetch(`/api/events/${eventId}`);
      const eventData = await eventResponse.json();
      
      // Cargar templates
      const templatesResponse = await fetch(`/api/templates?eventId=${eventId}`);
      const templatesData = await templatesResponse.json();
      
      setEvent(eventData);
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
      
      // Cargar guestEvents con invitaciones desde la API de invitaciones
      const invitationsResponse = await fetch(`/api/invitations?eventId=${eventId}`);
      const invitationsData = await invitationsResponse.json();
      
      // Obtener guestEvents del evento
      const guestEventsResponse = await fetch(`/api/events/${eventId}`);
      const guestEventsData = await guestEventsResponse.json();
      
      const allGuestEvents = guestEventsData.guestEvents || [];
      
      // Mapear invitaciones a guestEvents
      const guestEventsWithInvitations = allGuestEvents.map((ge: any) => {
        const invitation = Array.isArray(invitationsData) 
          ? invitationsData.find((inv: any) => inv.guestEventId === ge.id)
          : null;
        return {
          ...ge,
          invitation: invitation || null,
        };
      });
      
      setGuestEvents(guestEventsWithInvitations);
      
      // Seleccionar automáticamente los que no tienen invitación o están pendientes
      const autoSelect = guestEventsWithInvitations
        .filter((ge: any) => !ge.invitation || ge.invitation.status === InvitationStatus.PENDING)
        .map((ge: any) => ge.id);
      setSelectedGuests(new Set(autoSelect));
      
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuestEvents = guestEvents.filter((ge: any) => {
    if (filter === "all") return true;
    if (filter === "no-invitation") return !ge.invitation;
    if (filter === "pending") return ge.invitation?.status === InvitationStatus.PENDING;
    if (filter === "sent") return ge.invitation?.status === InvitationStatus.SENT;
    if (filter === "not-sent") return !ge.invitation || ge.invitation.status === InvitationStatus.PENDING;
    return true;
  });

  const toggleGuestSelection = (guestEventId: string) => {
    const newSelected = new Set(selectedGuests);
    if (newSelected.has(guestEventId)) {
      newSelected.delete(guestEventId);
    } else {
      newSelected.add(guestEventId);
    }
    setSelectedGuests(newSelected);
  };

  const selectAll = () => {
    const allIds = new Set(filteredGuestEvents.map((ge: any) => ge.id));
    setSelectedGuests(allIds);
  };

  const deselectAll = () => {
    setSelectedGuests(new Set());
  };

  const handleBulkSend = async () => {
    if (selectedGuests.size === 0) {
      alert("Por favor selecciona al menos un invitado para enviar");
      return;
    }

    if (!confirm(`¿Enviar invitaciones a ${selectedGuests.size} invitado(s)? Se consumirán ${selectedGuests.size} tokens.`)) {
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const res = await fetch(`/api/events/${eventId}/send-invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplateId || undefined,
          guestEventIds: Array.from(selectedGuests), // Enviar IDs seleccionados
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al enviar invitaciones");
      }

      setResult(data);
      
      // Recargar datos después de enviar
      setTimeout(() => {
        loadData();
      }, 2000);
      
    } catch (error: any) {
      console.error("Error completo:", error);
      setResult({
        success: false,
        error: error.message || "Error al enviar invitaciones. Revisa la consola del servidor para más detalles.",
        details: error.stack || error.toString(),
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00b5ff]" />
      </div>
    );
  }

  const getStatusBadge = (ge: any) => {
    if (!ge.invitation) {
      return <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">Sin Invitación</span>;
    }
    const status = ge.invitation.status as InvitationStatus;
    const badges: Record<InvitationStatus, string> = {
      [InvitationStatus.PENDING]: "bg-yellow-100 text-yellow-800",
      [InvitationStatus.SENT]: "bg-blue-100 text-blue-800",
      [InvitationStatus.CONFIRMED]: "bg-green-100 text-green-800",
      [InvitationStatus.REJECTED]: "bg-red-100 text-red-800",
    };
    const labels: Record<InvitationStatus, string> = {
      [InvitationStatus.PENDING]: "Pendiente",
      [InvitationStatus.SENT]: "Enviada",
      [InvitationStatus.CONFIRMED]: "Confirmada",
      [InvitationStatus.REJECTED]: "Rechazada",
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${badges[status] || badges[InvitationStatus.PENDING]}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/events/${eventId}`} className="text-sm text-gray-600 hover:text-gray-900">
          ← Volver al Evento
        </Link>
        <h1 className="mt-2 text-2xl md:text-3xl font-bold">Enviar Invitaciones</h1>
        <p className="mt-2 text-sm md:text-base text-gray-600">{event?.name}</p>
      </div>

      {/* Resumen */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Invitados</p>
              <p className="text-2xl font-bold text-[#00b5ff]">{guestEvents.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Sin Invitación</p>
              <p className="text-2xl font-bold text-gray-600">
                {guestEvents.filter(ge => !ge.invitation).length}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {guestEvents.filter(ge => ge.invitation?.status === InvitationStatus.PENDING).length}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Enviadas</p>
              <p className="text-2xl font-bold text-green-600">
                {guestEvents.filter(ge => ge.invitation?.status === InvitationStatus.SENT).length}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Seleccionados</p>
              <p className="text-2xl font-bold text-purple-600">{selectedGuests.size}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
          <CardDescription>Selecciona un template para las invitaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Template de Invitación</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Template por defecto (auto-seleccionado)</option>
              {templates.map((template: any) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Filtros y Selección */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seleccionar Invitados</CardTitle>
              <CardDescription>
                Selecciona manualmente los invitados a los que quieres enviar invitaciones
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Seleccionar Todos
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deseleccionar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="mb-4 flex gap-2 flex-wrap">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              Todos ({guestEvents.length})
            </Button>
            <Button
              variant={filter === "not-sent" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("not-sent")}
            >
              No Enviadas ({guestEvents.filter(ge => !ge.invitation || ge.invitation.status === InvitationStatus.PENDING).length})
            </Button>
            <Button
              variant={filter === "no-invitation" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("no-invitation")}
            >
              Sin Invitación ({guestEvents.filter(ge => !ge.invitation).length})
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
            >
              Pendientes ({guestEvents.filter(ge => ge.invitation?.status === InvitationStatus.PENDING).length})
            </Button>
            <Button
              variant={filter === "sent" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("sent")}
            >
              Ya Enviadas ({guestEvents.filter(ge => ge.invitation?.status === InvitationStatus.SENT).length})
            </Button>
          </div>

          {/* Lista de Invitados */}
          {filteredGuestEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay invitados que coincidan con el filtro seleccionado</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredGuestEvents.map((ge: any) => {
                const isSelected = selectedGuests.has(ge.id);
                const canSend = !ge.invitation || ge.invitation.status === InvitationStatus.PENDING;
                
                return (
                  <div
                    key={ge.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                      isSelected ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                    } ${!canSend ? "opacity-60" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => canSend && toggleGuestSelection(ge.id)}
                      disabled={!canSend}
                      className="flex-shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-[#00b5ff]" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[#303030]">{ge.guest.name}</p>
                        {getStatusBadge(ge)}
                      </div>
                      <p className="text-sm text-gray-600">{ge.guest.email}</p>
                      {ge.guest.phone && (
                        <p className="text-xs text-gray-500">{ge.guest.phone}</p>
                      )}
                      {ge.invitation?.sentAt && (
                        <p className="text-xs text-gray-500">
                          Enviada: {new Date(ge.invitation.sentAt).toLocaleString("es-AR")}
                        </p>
                      )}
                    </div>
                    {!canSend && (
                      <span className="text-xs text-gray-500">Ya enviada</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultado */}
      {result && (
        <Card className={`mb-6 ${result.success !== false ? "border-green-500" : "border-red-500"}`}>
          <CardContent className="pt-6">
            {result.success !== false ? (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-semibold text-green-800">¡Invitaciones enviadas!</p>
                  <p className="text-sm text-gray-600">
                    Enviadas: {result.sent || 0}, Fallidas: {result.failed || 0}
                  </p>
                  {result.errors && result.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">Ver errores</summary>
                      <ul className="text-xs text-red-600 mt-1 space-y-1">
                        {result.errors.slice(0, 5).map((err: any, i: number) => (
                          <li key={i}>{err.guestName || err.guestId}: {err.error || "Error desconocido"}</li>
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
                  <p className="font-semibold text-red-800">Error al enviar invitaciones</p>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{result.error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <div className="flex gap-4">
        <Button
          onClick={handleBulkSend}
          disabled={sending || selectedGuests.size === 0}
          className="flex-1"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar {selectedGuests.size} Invitación(es) - Costo: {selectedGuests.size} tokens
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={sending}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
