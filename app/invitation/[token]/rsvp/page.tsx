"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function RSVPPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const quickResponse = searchParams.get("response"); // YES, NO
  
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    response: quickResponse || "",
    dietaryRestrictions: "",
    accessibilityNeeds: "",
    notes: "",
  });

  useEffect(() => {
    if (!token) return;
    
    // Cargar datos de la invitación
    fetch(`/api/public/invitation/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setInvitation(null);
        } else {
          setInvitation(data);
          if (data.rsvpResponse) {
            setFormData({
              response: data.rsvpResponse,
              dietaryRestrictions: data.dietaryRestrictions || "",
              accessibilityNeeds: data.accessibilityNeeds || "",
              notes: data.notes || "",
            });
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.response) {
      alert("Por favor selecciona si asistirás o no");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/invitation/${token}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al confirmar asistencia");
      }

      setSuccess(true);
    } catch (error: any) {
      alert(error.message || "Error al confirmar asistencia. Por favor intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff5040] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Invitación no encontrada</h2>
            <p className="text-gray-600">
              La invitación no existe o el enlace es inválido.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">¡Confirmación recibida!</h2>
            <p className="text-gray-600 mb-4">
              {formData.response === "YES" 
                ? "Esperamos verte en el evento."
                : "Lamentamos que no puedas asistir."}
            </p>
            {formData.response === "YES" && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  Tu código QR está en el email. Guárdalo para el check-in en el evento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventDate = invitation.guestEvent?.event?.date 
    ? new Date(invitation.guestEvent.event.date).toLocaleDateString("es-AR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Confirmar Asistencia</CardTitle>
            <CardDescription>
              {invitation.guestEvent?.event?.name}
            </CardDescription>
            {eventDate && (
              <p className="text-sm text-gray-600 mt-2">
                Fecha: {eventDate}
              </p>
            )}
            {invitation.guestEvent?.event?.location && (
              <p className="text-sm text-gray-600">
                Ubicación:{" "}
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invitation.guestEvent.event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {invitation.guestEvent.event.location}
                </a>
                <span className="text-xs text-gray-500 ml-1">(Ver en Google Maps)</span>
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Respuesta rápida */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  ¿Asistirás al evento? *
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, response: "YES" })}
                    className={`p-6 border-2 rounded-lg text-center transition-all ${
                      formData.response === "YES"
                        ? "border-green-500 bg-green-50 shadow-md"
                        : "border-gray-300 hover:border-green-300 hover:bg-green-50/50"
                    }`}
                  >
                    <CheckCircle className={`w-10 h-10 mx-auto mb-2 ${
                      formData.response === "YES" ? "text-green-500" : "text-gray-400"
                    }`} />
                    <span className="font-semibold text-lg">Sí, asistiré</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, response: "NO" })}
                    className={`p-6 border-2 rounded-lg text-center transition-all ${
                      formData.response === "NO"
                        ? "border-red-500 bg-red-50 shadow-md"
                        : "border-gray-300 hover:border-red-300 hover:bg-red-50/50"
                    }`}
                  >
                    <XCircle className={`w-10 h-10 mx-auto mb-2 ${
                      formData.response === "NO" ? "text-red-500" : "text-gray-400"
                    }`} />
                    <span className="font-semibold text-lg">No puedo asistir</span>
                  </button>
                </div>
              </div>

              {/* Solo mostrar campos adicionales si confirma asistencia */}
              {formData.response === "YES" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dietaryRestrictions">
                      Restricciones alimentarias
                    </Label>
                    <select
                      id="dietaryRestrictions"
                      value={formData.dietaryRestrictions}
                      onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Ninguna</option>
                      <option value="vegetarian">Vegetariano</option>
                      <option value="vegan">Vegano</option>
                      <option value="gluten-free">Sin gluten</option>
                      <option value="lactose-free">Sin lactosa</option>
                      <option value="halal">Halal</option>
                      <option value="kosher">Kosher</option>
                      <option value="other">Otra (especificar en notas)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accessibilityNeeds">
                      Necesidades de accesibilidad
                    </Label>
                    <select
                      id="accessibilityNeeds"
                      value={formData.accessibilityNeeds}
                      onChange={(e) => setFormData({ ...formData, accessibilityNeeds: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Ninguna</option>
                      <option value="wheelchair">Silla de ruedas</option>
                      <option value="mobility-assistance">Asistencia para movilidad</option>
                      <option value="hearing-assistance">Asistencia auditiva</option>
                      <option value="visual-assistance">Asistencia visual</option>
                      <option value="other">Otra (especificar en notas)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      Notas adicionales
                    </Label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      placeholder="Información adicional que quieras compartir..."
                    />
                  </div>
                </>
              )}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Confirmando..." : "Confirmar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
