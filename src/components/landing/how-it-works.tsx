"use client"

import { motion } from "framer-motion"

const steps = [
  { num: 1, title: "Upload your PDF", desc: "Drag and drop your document" },
  { num: 2, title: "Add signature fields", desc: "Place fields anywhere on the page" },
  { num: 3, title: "Invite signers", desc: "Send signing links via email" },
  { num: 4, title: "Download signed", desc: "Get the legally binding PDF" },
]

export function HowItWorks() {
  return (
    <section id="workflow" className="py-24 bg-[#111827]">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center"
        >
          How It Works
        </motion.h2>

        <div className="mt-16 grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="text-center"
            >
              <div className="h-16 w-16 rounded-full bg-violet-600 flex items-center justify-center mx-auto text-xl font-bold">
                {step.num}
              </div>
              <p className="mt-6 text-lg font-medium">{step.title}</p>
              <p className="mt-2 text-sm text-zinc-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
