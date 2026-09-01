"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

interface SidebarProps {
  role: "freelancer" | "admin";
}

const freelancerLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/invoices", label: "Invoices", icon: "🧾" },
  { href: "/dashboard", label: "Dunning", icon: "📩" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

const adminLinks = [
  { href: "/admin", label: "Overview", icon: "📈" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/transactions", label: "Transactions", icon: "💳" },
  { href: "/admin/dunning-log", label: "Dunning Log", icon: "📩" },
  { href: "/admin/disputes", label: "Disputes", icon: "⚖️" },
];

export default function Sidebar({ role }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = role === "admin" ? adminLinks : freelancerLinks;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/admin" || href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-zinc-950 border-r border-white/10 flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="text-lg font-black uppercase tracking-tighter">
          <span className="text-pink-500">F</span>YPM
        </div>
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-600 mt-1">
          {role === "admin" ? "Platform Admin" : "Freelancer"}
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {links.map((link) => (
          <button
            key={link.href}
            onClick={() => router.push(link.href)}
            className={isActive(link.href) ? "sidebar-link-active" : "sidebar-link"}
          >
            <span className="text-base">{link.icon}</span>
            <span>{link.label}</span>
          </button>
        ))}
      </nav>

      {session?.user && (
        <div className="px-4 py-4 border-t border-white/10">
          <div className="bg-zinc-900 border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold text-sm">
                {((session.user as any).name || "?").charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {(session.user as any).name || "User"}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 truncate">
                  {session.user.email}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-colors"
          >
            ✕ Logout
          </button>
        </div>
      )}
    </aside>
  );
}