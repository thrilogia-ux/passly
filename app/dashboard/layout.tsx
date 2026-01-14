import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";
import { 
  Calendar, 
  Users, 
  Mail, 
  QrCode, 
  Sparkles,
  FileText
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  let tokenBalance = 0;
  
  try {
    session = await auth();
    if (!session?.user) {
      redirect("/login");
    }
  } catch (error) {
    console.error("Error in layout auth:", error);
    redirect("/login");
  }

  // Get organization token balance (optional, don't fail if it errors)
  if (session?.user?.organizationId) {
    try {
      const organization = await db.organization.findUnique({
        where: { id: session.user.organizationId },
        select: { tokenBalance: true },
      });
      tokenBalance = organization?.tokenBalance || 0;
    } catch (dbError) {
      console.error("Error fetching organization:", dbError);
      tokenBalance = 0;
    }
  }

  // Menú principal: solo CRUD
  const navItems = [
    { href: "/dashboard/events", label: "Eventos", icon: Calendar },
    { href: "/dashboard/guests", label: "Invitados", icon: Users },
    { href: "/dashboard/invitations", label: "Invitaciones", icon: Mail },
    { href: "/dashboard/templates", label: "Templates", icon: FileText },
    { href: "/dashboard/check-in", label: "Check-in", icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30">
      {/* Header mejorado - Estilo Apple */}
      <nav className="border-b border-gray-100/50 bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center space-x-10">
              <Link href="/dashboard" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-semibold bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent tracking-tight">
                  PASSLY
                </span>
              </Link>
              <nav className="hidden md:flex space-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl text-sm font-medium text-gray-600 hover:bg-amber-50/80 hover:text-amber-700 transition-all duration-300 group/item"
                    >
                      <Icon className="w-4.5 h-4.5 group-hover/item:scale-110 transition-transform" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {session?.user && (
                <UserMenu
                  userName={session.user.name || ""}
                  userEmail={session.user.email || ""}
                  userRole={session.user.role || ""}
                  tokenBalance={tokenBalance}
                />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content con mejor espaciado */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
