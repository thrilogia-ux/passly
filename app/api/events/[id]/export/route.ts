import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

// Tipos de reportes disponibles
type ReportType = 
  | "complete"           // Reporte completo
  | "confirmed"          // Solo confirmados
  | "dietary"            // Restricciones alimentarias
  | "checkin-list"       // Lista para check-in
  | "attendance"         // Asistencia real (post-evento)
  | "summary";           // Resumen estadístico

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  
  try {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const reportType = (searchParams.get("type") || "complete") as ReportType;
    const format = searchParams.get("format") || "xlsx"; // xlsx o csv

    // Obtener evento con todos los datos relacionados
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: {
        guestEvents: {
          include: {
            guest: true,
            invitation: true,
            qrCode: {
              include: {
                checkIns: {
                  orderBy: { checkedInAt: "asc" },
                  take: 1, // Solo el primer check-in
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Verificar permisos
    if (session.user.role !== "SUPER_ADMIN" && session.user.organizationId !== event.organizationId) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    // Generar datos según el tipo de reporte
    let data: any[] = [];
    let filename = "";

    switch (reportType) {
      case "complete":
        data = generateCompleteReport(event);
        filename = `reporte-completo-${event.name}`;
        break;
      
      case "confirmed":
        data = generateConfirmedReport(event);
        filename = `confirmados-${event.name}`;
        break;
      
      case "dietary":
        data = generateDietaryReport(event);
        filename = `restricciones-alimentarias-${event.name}`;
        break;
      
      case "checkin-list":
        data = generateCheckinListReport(event);
        filename = `lista-checkin-${event.name}`;
        break;
      
      case "attendance":
        data = generateAttendanceReport(event);
        filename = `asistencia-${event.name}`;
        break;
      
      case "summary":
        return NextResponse.json(generateSummaryReport(event));
      
      default:
        return NextResponse.json({ error: "Tipo de reporte inválido" }, { status: 400 });
    }

    // Sanitizar nombre de archivo
    filename = filename.replace(/[^a-zA-Z0-9-_áéíóúñÁÉÍÓÚÑ ]/g, "").replace(/\s+/g, "-");
    
    // Generar archivo
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Ajustar ancho de columnas
    const colWidths = data.length > 0 
      ? Object.keys(data[0]).map(key => ({
          wch: Math.max(key.length, ...data.map(row => String(row[key] || "").length))
        }))
      : [];
    worksheet["!cols"] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

    if (format === "csv") {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      });
    } else {
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
        },
      });
    }

  } catch (error: any) {
    console.error("❌ Error generando reporte:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Funciones de generación de reportes

function generateCompleteReport(event: any): any[] {
  return event.guestEvents.map((ge: any) => {
    const guest = ge.guest;
    const invitation = ge.invitation;
    const checkIn = ge.qrCode?.checkIns?.[0];
    
    return {
      "Nombre": guest.name,
      "Email": guest.email,
      "Teléfono": guest.phone || "-",
      "Tipo": translateGuestType(guest.type),
      "Tags": guest.tags || "-",
      "Estado Invitación": translateInvitationStatus(invitation?.status),
      "Respuesta RSVP": translateRsvpResponse(invitation?.rsvpResponse),
      "Restricciones Alimentarias": invitation?.dietaryRestrictions || "-",
      "Necesidades Accesibilidad": invitation?.accessibilityNeeds || "-",
      "Acompañantes": invitation?.additionalGuests || 0,
      "Notas del Invitado": invitation?.notes || "-",
      "Fecha Envío": formatDate(invitation?.sentAt),
      "Fecha Confirmación": formatDate(invitation?.confirmedAt),
      "Asistió": checkIn ? "SÍ" : "NO",
      "Fecha Check-in": formatDateTime(checkIn?.checkedInAt),
      "Zona": checkIn?.zone || "-",
    };
  });
}

function generateConfirmedReport(event: any): any[] {
  return event.guestEvents
    .filter((ge: any) => ge.invitation?.rsvpResponse === "YES" || ge.invitation?.status === "CONFIRMED")
    .map((ge: any) => {
      const guest = ge.guest;
      const invitation = ge.invitation;
      
      return {
        "Nombre": guest.name,
        "Email": guest.email,
        "Teléfono": guest.phone || "-",
        "Tipo": translateGuestType(guest.type),
        "Acompañantes": invitation?.additionalGuests || 0,
        "Restricciones Alimentarias": invitation?.dietaryRestrictions || "-",
        "Notas": invitation?.notes || "-",
        "Fecha Confirmación": formatDate(invitation?.confirmedAt),
      };
    });
}

function generateDietaryReport(event: any): any[] {
  return event.guestEvents
    .filter((ge: any) => ge.invitation?.dietaryRestrictions)
    .map((ge: any) => {
      const guest = ge.guest;
      const invitation = ge.invitation;
      
      return {
        "Nombre": guest.name,
        "Restricciones Alimentarias": invitation.dietaryRestrictions,
        "Necesidades Accesibilidad": invitation?.accessibilityNeeds || "-",
        "Acompañantes": invitation?.additionalGuests || 0,
        "Notas": invitation?.notes || "-",
        "Teléfono": guest.phone || "-",
      };
    });
}

function generateCheckinListReport(event: any): any[] {
  // Ordenar alfabéticamente por nombre
  const sorted = [...event.guestEvents].sort((a: any, b: any) => 
    a.guest.name.localeCompare(b.guest.name)
  );
  
  return sorted
    .filter((ge: any) => 
      ge.invitation?.rsvpResponse === "YES" || 
      ge.invitation?.status === "CONFIRMED" ||
      ge.invitation?.status === "SENT"
    )
    .map((ge: any, index: number) => {
      const guest = ge.guest;
      const invitation = ge.invitation;
      
      return {
        "#": index + 1,
        "Nombre": guest.name,
        "Tipo": translateGuestType(guest.type),
        "Acompañantes": invitation?.additionalGuests || 0,
        "Check-in": "☐", // Checkbox vacío para imprimir
        "Notas": invitation?.notes || "-",
      };
    });
}

function generateAttendanceReport(event: any): any[] {
  return event.guestEvents.map((ge: any) => {
    const guest = ge.guest;
    const invitation = ge.invitation;
    const checkIn = ge.qrCode?.checkIns?.[0];
    
    const confirmed = invitation?.rsvpResponse === "YES" || invitation?.status === "CONFIRMED";
    const attended = !!checkIn;
    
    let attendanceStatus = "-";
    if (confirmed && attended) {
      attendanceStatus = "✓ Asistió";
    } else if (confirmed && !attended) {
      attendanceStatus = "✗ No se presentó";
    } else if (!confirmed && attended) {
      attendanceStatus = "⚠ Sin confirmar pero asistió";
    } else {
      attendanceStatus = "- No confirmó";
    }
    
    return {
      "Nombre": guest.name,
      "Email": guest.email,
      "Confirmó": confirmed ? "SÍ" : "NO",
      "Asistió": attended ? "SÍ" : "NO",
      "Estado": attendanceStatus,
      "Hora Check-in": formatDateTime(checkIn?.checkedInAt),
      "Zona": checkIn?.zone || "-",
    };
  });
}

function generateSummaryReport(event: any): any {
  const total = event.guestEvents.length;
  
  const invitationsSent = event.guestEvents.filter((ge: any) => 
    ge.invitation?.status === "SENT" || 
    ge.invitation?.status === "CONFIRMED" || 
    ge.invitation?.status === "REJECTED"
  ).length;
  
  const confirmed = event.guestEvents.filter((ge: any) => 
    ge.invitation?.rsvpResponse === "YES" || ge.invitation?.status === "CONFIRMED"
  ).length;
  
  const rejected = event.guestEvents.filter((ge: any) => 
    ge.invitation?.rsvpResponse === "NO" || ge.invitation?.status === "REJECTED"
  ).length;
  
  const pending = event.guestEvents.filter((ge: any) => 
    !ge.invitation || ge.invitation?.status === "PENDING" || ge.invitation?.status === "SENT"
  ).length - event.guestEvents.filter((ge: any) => 
    ge.invitation?.rsvpResponse === "YES" || ge.invitation?.rsvpResponse === "NO"
  ).length;
  
  const withDietary = event.guestEvents.filter((ge: any) => 
    ge.invitation?.dietaryRestrictions
  ).length;
  
  const totalGuests = event.guestEvents.reduce((sum: number, ge: any) => 
    sum + (ge.invitation?.additionalGuests || 0), 0
  ) + confirmed;
  
  const attended = event.guestEvents.filter((ge: any) => 
    ge.qrCode?.checkIns?.length > 0
  ).length;
  
  return {
    evento: {
      nombre: event.name,
      fecha: formatDateTime(event.date),
      ubicacion: event.location || "-",
    },
    invitados: {
      total: total,
      invitacionesEnviadas: invitationsSent,
      confirmados: confirmed,
      rechazados: rejected,
      pendientes: Math.max(0, pending),
      conRestriccionesAlimentarias: withDietary,
      totalPersonas: totalGuests, // Incluye acompañantes
    },
    asistencia: {
      checkIns: attended,
      tasaAsistencia: confirmed > 0 ? Math.round((attended / confirmed) * 100) + "%" : "0%",
    },
  };
}

// Funciones de utilidad

function translateGuestType(type: string): string {
  const types: Record<string, string> = {
    VIP: "VIP",
    PRESS: "Prensa",
    INFLUENCER: "Influencer",
    STAFF: "Staff",
    PROVIDER: "Proveedor",
  };
  return types[type] || type || "-";
}

function translateInvitationStatus(status: string | undefined): string {
  if (!status) return "Sin invitación";
  const statuses: Record<string, string> = {
    PENDING: "Pendiente",
    SENT: "Enviada",
    CONFIRMED: "Confirmada",
    REJECTED: "Rechazada",
  };
  return statuses[status] || status;
}

function translateRsvpResponse(response: string | undefined): string {
  if (!response) return "-";
  const responses: Record<string, string> = {
    YES: "Sí, asistiré",
    NO: "No asistiré",
    MAYBE: "Quizás",
  };
  return responses[response] || response;
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateTime(date: Date | string | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
