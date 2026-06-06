"use client";

import { Search, Bell } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 h-20 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/10">
      <div className="h-full flex items-center justify-between px-6">
        <div className="relative w-[350px] hidden md:block">
          <Search
            className="absolute left-3 top-3 text-zinc-500"
            size={18}
          />

          <input
            placeholder="Search documents..."
            className="
              w-full
              bg-[#12121A]
              border
              border-white/10
              rounded-xl
              pl-10
              pr-4
              py-2.5
              outline-none
            "
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative">
            <Bell size={22} />

            <span
              className="
                absolute
                -top-1
                -right-1
                h-2
                w-2
                rounded-full
                bg-red-500
              "
            />
          </button>

          <div className="flex items-center gap-3">
            <div
              className="
                h-10
                w-10
                rounded-full
                bg-violet-500
              "
            />

            <div className="hidden md:block">
              <p className="font-medium">
                Pratik
              </p>

              <p className="text-xs text-zinc-400">
                Premium Plan
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}