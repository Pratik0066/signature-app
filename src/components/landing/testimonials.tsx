"use client"

import { motion } from "framer-motion"

const testimonials = [
  { quote: "This platform reduced our document processing time by 80%.", name: "Sarah Johnson", role: "Legal Manager" },
  { quote: "Incredibly intuitive interface. Our team adopted it immediately.", name: "Mark Chen", role: "Operations Director" },
  { quote: "The audit trail feature is a game-changer for compliance.", name: "Emily Rodriguez", role: "Compliance Officer" },
]

export function Testimonials() {
  return (
    <section className="py-24 container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold">Trusted By Teams</h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, index) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="bg-[#111827] border border-white/10 rounded-2xl p-6 hover:border-violet-500/20 transition"
          >
            <p className="text-zinc-300 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-6 border-t border-white/5 pt-4">
              <h4 className="font-semibold">{t.name}</h4>
              <p className="text-sm text-zinc-500">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
