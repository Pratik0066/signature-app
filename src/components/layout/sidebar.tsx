"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Users,
  ShieldCheck,
  BarChart3,
  Settings,
  PenTool,
} from "lucide-react"

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Signers", href: "/dashboard/signers", icon: Users },
  { label: "Audit Logs", href: "/dashboard/audit", icon: ShieldCheck },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-[#0B1020] border-r border-white/10 flex-col z-50">
      <div className="h-20 flex items-center px-8 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center">
            <PenTool className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl">SignFlow</span>
        </Link>
      </div>

      <nav className="p-4 flex-1">
        <div className="space-y-1">
          <p className="px-4 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">Menu</p>
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive
                    ? "bg-violet-500/10 text-violet-400"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-linear-to-br from-violet-500 to-purple-600" />
          <div>
            <p className="text-sm font-medium">Free Plan</p>
            <p className="text-xs text-zinc-500">Upgrade for more</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
