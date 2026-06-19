"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Search, Bell } from "lucide-react"

export function Navbar() {
  const [userName, setUserName] = useState("User")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name)
      } else if (user?.email) {
        setUserName(user.email.split("@")[0])
      }
      if (user?.email) setUserEmail(user.email)
    })
  }, [])

  return (
    <header className="sticky top-0 z-40 h-20 bg-[#050816]/80 backdrop-blur-xl border-b border-white/10">
      <div className="h-full flex items-center justify-between px-6">
        <div className="relative w-[350px] hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            placeholder="Search documents..."
            className="w-full bg-[#111827] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-violet-500/50 transition placeholder-zinc-500"
          />
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <button className="relative h-10 w-10 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center hover:bg-white/5 transition">
            <Bell size={18} className="text-zinc-400" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#050816]" />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-medium">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-zinc-500">{userEmail || "Free Plan"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
