"use client"

import Link from "next/link"
import { PenTool } from "lucide-react"
import { motion } from "framer-motion"

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-[#0A0A0F]/80"
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <PenTool className="text-violet-500 h-7 w-7" />
          <span className="font-bold text-xl">SignFlow</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-zinc-400 hover:text-white transition">Features</a>
          <a href="#workflow" className="text-zinc-400 hover:text-white transition">Workflow</a>
          <a href="#pricing" className="text-zinc-400 hover:text-white transition">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-zinc-300 hover:text-white transition">Login</Link>
          <Link
            href="/register"
            className="bg-violet-600 hover:bg-violet-700 px-5 py-2 rounded-xl transition hover:scale-105 active:scale-95"
          >
            Start Free
          </Link>
        </div>
      </div>
    </motion.header>
  )
}
