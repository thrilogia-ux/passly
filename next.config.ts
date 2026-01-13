import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3002",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only",
    RESEND_API_KEY: process.env.RESEND_API_KEY || "",
    EMAIL_FROM: process.env.EMAIL_FROM || "PASSLY <onboarding@resend.dev>",
    SMTP_HOST: process.env.SMTP_HOST || "",
    SMTP_PORT: process.env.SMTP_PORT || "",
    SMTP_USER: process.env.SMTP_USER || "",
    SMTP_PASSWORD: process.env.SMTP_PASSWORD || "",
  },
};

export default nextConfig;
