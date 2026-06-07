"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, PlusCircle, Users, Settings } from "lucide-react"

const items = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/dashboard/documents", icon: FileText, label: "Docs" },
  { href: "/dashboard/documents/upload", icon: PlusCircle, label: "Upload" },
  { href: "/dashboard/signers", icon: Users, label: "Signers" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0B1020] border-t border-white/10 flex items-center justify-around z-50">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-4 py-2 transition ${
              isActive ? "text-violet-500" : "text-zinc-500"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
