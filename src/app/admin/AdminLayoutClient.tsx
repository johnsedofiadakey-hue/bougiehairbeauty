"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Scissors, Package, Settings, Users, Calendar, ArrowLeft, Image as ImageIcon, Beaker, Command, LogOut, Menu, X } from "lucide-react";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { signOut } from "next-auth/react";

export default function AdminLayoutClient({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: any;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Appointments", href: "/admin/appointments", icon: Calendar },
    { name: "Portfolio", href: "/admin/portfolio", icon: ImageIcon },
    { name: "Formulations", href: "/admin/formulations", icon: Beaker },
    { name: "Services", href: "/admin/services", icon: Scissors },
    { name: "Inventory", href: "/admin/inventory", icon: Package },
    { name: "Clients", href: "/admin/clients", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const studioName = settings?.companyName || "Bougie Hair & Beauty";

  return (
    <div className="flex min-h-screen bg-bougie-cream drop-shadow-sm">
      <AdminCommandPalette />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — off-canvas drawer on mobile, static on desktop */}
      <aside
        className={`w-64 bg-bougie-espresso text-white flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-8 text-2xl font-serif text-bougie-cream border-b border-white/10 flex flex-col gap-2 relative">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-1 text-white/50 hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
          {settings?.logoUrl && (
            <img src={settings.logoUrl} alt={studioName} className="w-14 h-14 object-cover rounded-full border border-white/20" />
          )}
          <span>{studioName}</span>
          <span className="text-[10px] uppercase tracking-widest opacity-50 font-sans">Admin Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/10 ${pathname === item.href ? 'bg-white/10 text-bougie-cream' : ''}`}
            >
              <item.icon className="w-5 h-5 opacity-70" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-bougie-champagne flex items-center justify-center text-[10px] font-bold text-zinc-900">LB</div>
            <div className="text-sm flex-1">
              <p className="font-medium text-white/90">Studio Owner</p>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-red-500/10 text-white/60 hover:text-red-400 group"
          >
            <LogOut className="w-5 h-5 opacity-70 group-hover:opacity-100" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="bg-white h-16 border-b flex items-center justify-between px-4 md:px-8 gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-bougie-cream drop-shadow-sm rounded-lg text-bougie-espresso/60 md:hidden flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="p-2 hover:bg-bougie-cream drop-shadow-sm rounded-lg text-bougie-espresso/50 group transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5 group-hover:text-bougie-espresso" />
            </Link>
            <div className="flex items-center gap-3 min-w-0">
              <h2 className="text-lg md:text-xl font-medium truncate">{studioName}</h2>
              <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 bg-bougie-cream drop-shadow-sm rounded-md text-[10px] text-bougie-espresso/50 border border-bougie-espresso/15">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <AdminNotifications />
            <button
              onClick={() => router.push('/admin/appointments?new=true')}
              className="px-3 md:px-4 py-2 bg-bougie-espresso text-white rounded-lg text-xs md:text-sm hover:scale-105 transition-transform shadow-lg shadow-brand-primary/20 font-bold whitespace-nowrap"
            >
              + New
            </button>
          </div>
        </header>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
