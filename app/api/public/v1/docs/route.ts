import { NextRequest, NextResponse } from "next/server";

/**
 * Public API Documentation
 */
export async function GET(request: NextRequest) {
  const docs = {
    version: "1.0.0",
    baseUrl: `${request.nextUrl.origin}/api/public/v1`,
    authentication: {
      type: "API Key",
      header: "X-API-Key",
      description: "Include your API key in the X-API-Key header",
    },
    endpoints: {
      events: {
        GET: {
          path: "/events",
          description: "List events",
          queryParams: {
            organizationId: "string (optional)",
            status: "string (optional): DRAFT, ACTIVE, COMPLETED",
          },
          response: {
            events: "Array of event objects",
          },
        },
      },
      guests: {
        GET: {
          path: "/guests",
          description: "List guests",
          queryParams: {
            eventId: "string (optional)",
            limit: "number (optional, default: 100)",
          },
          response: {
            guests: "Array of guest objects",
          },
        },
        POST: {
          path: "/guests",
          description: "Create a guest",
          body: {
            email: "string (required)",
            name: "string (required)",
            phone: "string (optional)",
            type: "string (optional): VIP, PRESS, INFLUENCER, STAFF, PROVIDER",
            eventId: "string (optional)",
          },
          response: {
            guest: "Guest object",
          },
        },
      },
      checkIn: {
        POST: {
          path: "/check-in",
          description: "Perform a check-in",
          body: {
            token: "string (required): QR code token",
            zone: "string (optional): general, backstage, prensa, vip",
          },
          response: {
            success: "boolean",
            checkIn: "Check-in object",
            guest: "Guest object",
            event: "Event object",
            reentry: "boolean",
          },
        },
      },
    },
    examples: {
      listEvents: {
        curl: `curl -X GET "${request.nextUrl.origin}/api/public/v1/events" \\\n  -H "X-API-Key: YOUR_API_KEY"`,
      },
      createGuest: {
        curl: `curl -X POST "${request.nextUrl.origin}/api/public/v1/guests" \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"email":"guest@example.com","name":"John Doe","eventId":"event_id"}'`,
      },
      checkIn: {
        curl: `curl -X POST "${request.nextUrl.origin}/api/public/v1/check-in" \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"token":"qr_token_here","zone":"general"}'`,
      },
    },
  };

  return NextResponse.json(docs);
}