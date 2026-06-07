"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
}

export function Hero() {
  return (
    <section className="relative py-24 lg:py-36 overflow-hidden">
      <div className="animated-gradient-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.1),transparent_70%)]" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            variants={itemVariants}
            className="inline-block px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-sm"
          >
            Enterprise Document Signing
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="mt-8 text-5xl md:text-7xl font-bold leading-tight"
          >
            <motion.span
              className="inline-block"
              animate={{
                scale: [1, 1.02, 1],
                opacity: [1, 0.9, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Sign Documents
            </motion.span>
            <motion.span
              className="block text-[80px] md:text-[96px] mt-2 bg-linear-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
              style={{ backgroundSize: "200% 200%" }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              Faster Than Ever
            </motion.span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-8 text-xl text-zinc-400 max-w-2xl mx-auto"
          >
            Upload PDFs, request signatures,
            track document status, and generate
            legally traceable signed files.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/register"
              className="px-8 py-4 bg-violet-600 rounded-xl font-medium hover:bg-violet-700 transition hover:scale-105 active:scale-95"
            >
              Start Free Trial
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 border border-white/10 rounded-xl hover:bg-white/5 transition"
            >
              Live Demo
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="mt-20"
        >
          <div className="rounded-3xl overflow-hidden border border-white/10 bg-[#12121A] p-4 shadow-2xl animate-float">
            <Image
              src="/images/dashboard-preview.png"
              alt="Dashboard"
              width={1400}
              height={900}
              className="rounded-2xl"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
