import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

// Force Node.js runtime for file operations
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Crear datos de ejemplo
    const exampleData = [
      {
        email: "juan.perez@example.com",
        name: "Juan Pérez",
        phone: "+5491123456789",
        type: "VIP",
      },
      {
        email: "maria.garcia@example.com",
        name: "María García",
        phone: "+5491198765432",
        type: "VIP",
      },
      {
        email: "carlos.rodriguez@example.com",
        name: "Carlos Rodríguez",
        phone: "",
        type: "PRESS",
      },
    ];

    // Crear workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exampleData);
    
    // Ajustar ancho de columnas
    worksheet["!cols"] = [
      { wch: 30 }, // email
      { wch: 25 }, // name
      { wch: 18 }, // phone
      { wch: 10 }, // type
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Invitados");

    // Generar buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Retornar como descarga
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=plantilla-invitados.xlsx",
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { error: "Error generating template" },
      { status: 500 }
    );
  }
}
