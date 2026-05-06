"use client";

import Link from "next/link";
import { removeStoredToken, ADMIN_TOKEN_KEY } from "@/lib/client-auth";

type AdminTab = "posters" | "users" | "audit";

const navItems: Array<{ key: AdminTab; label: string; icon: string; href: string; description: string }> = [
  { key: "posters", label: "Poster", icon: "P", href: "/admin/posters", description: "Templates" },
  { key: "users", label: "Users", icon: "U", href: "/admin/users", description: "Accounts" },
  { key: "audit", label: "Created Poster", icon: "CP", href: "/admin/audit", description: "Activity" },
];

export function AdminShell({
  activeTab,
  title,
  children,
}: {
  activeTab: AdminTab;
  title: string;
  children: React.ReactNode;
}) {
  function logout() {
    removeStoredToken(ADMIN_TOKEN_KEY);
    window.location.href = "/admin";
  }

  return (
    <main className="app-shell">
      <section className="flex min-h-screen">
        <aside className="hidden w-72 flex-col bg-[#0f1e53] px-4 py-6 text-slate-100 shadow-2xl lg:flex">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Main</p>
          <nav className="mt-5 space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isActive ? "bg-white/12 text-white" : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/25 text-[11px] font-semibold tracking-wide">
                    {item.icon}
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold">{item.label}</span>
                    <span className="block text-xs text-slate-400">{item.description}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="w-full px-4 py-6 sm:px-6 lg:px-9">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-600">Operations Console</p>
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            </div>
            <button
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={logout}
            >
              Logout
            </button>
          </div>

          <div className="mb-6 flex gap-2 rounded-xl bg-white/70 p-1.5 shadow-sm ring-1 ring-slate-200 lg:hidden">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  activeTab === item.key ? "bg-orange-500 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {children}
        </section>
      </section>
    </main>
  );
}
