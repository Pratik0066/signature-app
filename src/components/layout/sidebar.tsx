"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Users,
  ShieldCheck,
  BarChart3,
  Settings,
  PenTool,
} from "lucide-react";

const items = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
  },
  {
    label: "Signers",
    href: "/dashboard/signers",
    icon: Users,
  },
  {
    label: "Audit Logs",
    href: "/dashboard/audit",
    icon: ShieldCheck,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-[#12121A] border-r border-white/10 flex-col">
      <div className="h-20 flex items-center px-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <PenTool className="h-8 w-8 text-violet-500" />
          <span className="font-bold text-xl">
            SignFlow
          </span>
        </div>
      </div>

      <nav className="p-4 flex-1">
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  hover:bg-violet-500/10
                  hover:text-violet-400
                  transition
                "
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}