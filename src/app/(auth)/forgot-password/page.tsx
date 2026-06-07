"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { PenTool, Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?redirect_to=/reset-password`,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    toast.success("Reset link sent! Check your email.")
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6">
        <div className="glass-card rounded-3xl p-12 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
          <p className="text-zinc-400 mb-8">
            We sent a password reset link to <strong className="text-white">{email}</strong>
          </p>
          <Link
            href="/login"
            className="inline-block w-full bg-violet-600 hover:bg-violet-700 py-3 rounded-xl font-medium transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-2">
            <PenTool className="h-8 w-8 text-violet-500" />
            <span className="font-bold text-xl">SignFlow</span>
          </div>

          <div className="text-center mb-8 mt-6">
            <h2 className="text-3xl font-bold">Reset Password</h2>
            <p className="text-zinc-400 mt-2">Enter your email to receive a reset link</p>
          </div>

          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 mt-6 text-sm text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
