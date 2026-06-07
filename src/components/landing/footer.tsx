"use client"

import { motion } from "framer-motion"

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="border-t border-white/10 py-8"
    >
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-zinc-500">&copy; 2026 SignFlow. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="text-zinc-500 hover:text-zinc-300 transition">Privacy</a>
          <a href="#" className="text-zinc-500 hover:text-zinc-300 transition">Terms</a>
          <a href="#" className="text-zinc-500 hover:text-zinc-300 transition">Support</a>
        </div>
      </div>
    </motion.footer>
  )
}
