"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Settings, 
  Coins, 
  BarChart3, 
  LogOut, 
  ChevronDown 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserMenuProps {
  userName: string;
  userEmail: string;
  userRole: string;
  tokenBalance: number;
}

export function UserMenu({ userName, userEmail, userRole, tokenBalance }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl hover:bg-amber-50/80 transition-all duration-300 group"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <span className="text-white text-sm font-semibold">
            {userName?.charAt(0).toUpperCase() || userEmail?.charAt(0).toUpperCase() || "U"}
          </span>
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-gray-700 leading-tight">
            {userName || userEmail?.split("@")[0]}
          </p>
          <p className="text-xs text-gray-500 font-light">{userRole}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-all duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100/50 py-3 z-50 overflow-hidden">
          {/* User info header */}
          <div className="px-5 py-4 bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-b border-gray-100/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-base font-semibold">
                  {userName?.charAt(0).toUpperCase() || userEmail?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{userName || userEmail}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                <p className="text-xs text-amber-600 font-medium mt-1">{userRole}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <Link
              href="/dashboard/tokens"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-5 py-3 text-sm text-gray-700 hover:bg-amber-50/50 transition-all duration-200 group/item"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-xl flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform">
                <Coins className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex-1">
                <span className="font-medium">Tokens</span>
                <p className="text-xs text-gray-500">{tokenBalance} disponibles</p>
              </div>
            </Link>
            
            <Link
              href="/dashboard/reports"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-5 py-3 text-sm text-gray-700 hover:bg-blue-50/50 transition-all duration-200 group/item"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform">
                <BarChart3 className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex-1">
                <span className="font-medium">Reportes</span>
                <p className="text-xs text-gray-500">Estadísticas y métricas</p>
              </div>
            </Link>
            
            <Link
              href="/dashboard/settings/integrations"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 group/item"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform">
                <Settings className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex-1">
                <span className="font-medium">Configuración</span>
                <p className="text-xs text-gray-500">Integraciones y ajustes</p>
              </div>
            </Link>
            
            <Link
              href="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-5 py-3 text-sm text-gray-700 hover:bg-purple-50/50 transition-all duration-200 group/item"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform">
                <User className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex-1">
                <span className="font-medium">Editar Perfil</span>
                <p className="text-xs text-gray-500">Información personal</p>
              </div>
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100/50 pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50/50 transition-all duration-200 group/item"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-red-400 to-rose-400 rounded-xl flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform">
                <LogOut className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-medium">Salir</span>
                <p className="text-xs text-red-500/70">Cerrar sesión</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
