import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Public API for enterprise clients
 * Requires API key authentication
 */
function validateApiKey(request: NextRequest): { valid: boolean; organizationId?: string } {
  const apiKey = request.headers.get("X-API-Key");
  
  if (!apiKey) {
    return { valid: false };
  }

  // In production, validate against database
  // For now, we'll use environment variable
  const validApiKey = process.env.API_KEY;
  
  if (apiKey !== validApiKey) {
    return { valid: false };
  }

  // Extract organization from API key (in production, query database)
  return { valid: true, organizationId: undefined }; // Placeholder
}

export async function GET(request: NextRequest) {
  try {
    const authResult = validateApiKey(request);
    
    if (!authResult.valid) {
      return NextResponse.json(
        { error: "Invalid or missing API key" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId") || authResult.organizationId;
    const status = searchParams.get("status");

    const where: any = {};
    if (organizationId) {
      where.organizationId = organizationId;
    }
    if (status) {
      where.status = status;
    }

    const events = await db.event.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        date: true,
        location: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        date: "desc",
      },
      take: 100,
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}