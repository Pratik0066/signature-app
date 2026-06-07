"use client"

import { motion } from "framer-motion"
import { ShieldCheck, FileText, Users, Clock } from "lucide-react"

const features = [
  { title: "Secure Storage", description: "Enterprise-grade document security.", icon: ShieldCheck },
  { title: "PDF Signing", description: "Drag & drop signature fields.", icon: FileText },
  { title: "Multi Signers", description: "Invite unlimited signers.", icon: Users },
  { title: "Audit Trails", description: "Track every action in real-time.", icon: Clock },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}

export function Features() {
  return (
    <section id="features" className="py-24 container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold">Everything You Need</h2>
        <p className="mt-4 text-zinc-400">Powerful tools for digital agreements.</p>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="p-6 bg-[#111827] rounded-2xl border border-white/10 hover:border-violet-500/30 transition hover:-translate-y-1 duration-300"
            >
              <Icon className="text-violet-500 mb-4" size={24} />
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="text-zinc-400 mt-2">{feature.description}</p>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
