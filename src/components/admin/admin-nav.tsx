"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, School, LogOut, Menu } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Tələbələr", icon: Users },
  { href: "/admin/institutions", label: "Təhsil müəssisələri", icon: School },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 font-semibold text-primary-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700 text-white text-sm">TQ</div>
          <span className="hidden sm:inline">Tələbə Qeydiyyat Sistemi</span>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const Icon = l.icon;
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-primary-50 text-primary-800" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
          <button onClick={handleLogout} className="ml-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50">
            <LogOut className="h-4 w-4" />
            Çıxış
          </button>
        </nav>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)}>
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-gray-100 px-4 py-2 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              {l.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-50">
            Çıxış
          </button>
        </nav>
      )}
    </header>
  );
}
