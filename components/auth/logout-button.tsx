"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ redirectTo: "/login" })}
      className="text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      Salir
    </button>
  );
}