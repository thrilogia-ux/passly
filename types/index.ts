// User Roles
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  CLIENT = "CLIENT",
  ORGANIZER = "ORGANIZER",
  STAFF = "STAFF",
}

// Event Status
export enum EventStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

// Guest Type
export enum GuestType {
  PRESS = "PRESS",
  INFLUENCER = "INFLUENCER",
  VIP = "VIP",
  STAFF = "STAFF",
  PROVIDER = "PROVIDER",
}

// Invitation Status
export enum InvitationStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED",
}

// QR Status
export enum QRStatus {
  VALID = "VALID",
  USED = "USED",
  INVALIDATED = "INVALIDATED",
}