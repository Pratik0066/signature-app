"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export function CTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-linear-to-r from-violet-600 to-indigo-600 p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold">Ready To Go Paperless?</h2>
            <p className="mt-4 text-white/80 text-lg">Start signing documents today.</p>
            <Link
              href="/register"
              className="inline-block mt-8 px-8 py-4 bg-white text-black rounded-xl font-semibold hover:scale-105 active:scale-95 transition"
            >
              Start Free Trial
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
