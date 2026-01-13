import axios from "axios";

export interface WebhookConfig {
  url: string;
  secret?: string;
  headers?: Record<string, string>;
}

export async function sendWebhook(
  config: WebhookConfig,
  event: string,
  data: any
) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Passly-Event": event,
      ...(config.headers || {}),
    };

    if (config.secret) {
      // Simple HMAC signature can be added here
      headers["X-Passly-Signature"] = config.secret;
    }

    const response = await axios.post(config.url, data, { headers });

    return { success: true, status: response.status };
  } catch (error: any) {
    console.error("Error sending webhook:", error);
    return {
      success: false,
      error: error.message,
      status: error.response?.status,
    };
  }
}

export const WEBHOOK_EVENTS = {
  EVENT_CREATED: "event.created",
  EVENT_UPDATED: "event.updated",
  GUEST_ADDED: "guest.added",
  GUEST_UPDATED: "guest.updated",
  INVITATION_SENT: "invitation.sent",
  INVITATION_CONFIRMED: "invitation.confirmed",
  CHECK_IN: "check_in.completed",
} as const;