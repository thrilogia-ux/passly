import { google } from "googleapis";

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}

export async function createCalendarEvent(
  config: GoogleCalendarConfig,
  eventData: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    location?: string;
    attendees?: Array<{ email: string }>;
  }
) {
  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );

  if (config.refreshToken) {
    oauth2Client.setCredentials({ refresh_token: config.refreshToken });
  }

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: eventData.summary,
        description: eventData.description,
        start: eventData.start,
        end: eventData.end,
        location: eventData.location,
        attendees: eventData.attendees,
      },
    });

    return { success: true, eventId: response.data.id, event: response.data };
  } catch (error: any) {
    console.error("Error creating calendar event:", error);
    return { success: false, error: error.message };
  }
}

export function getGoogleAuthUrl(config: GoogleCalendarConfig): string {
  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );

  const scopes = ["https://www.googleapis.com/auth/calendar"];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
}