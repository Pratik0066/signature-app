"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { PenTool, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (rememberMe) {
      await supabase.auth.setSession({
        access_token: (await supabase.auth.getSession()).data.session?.access_token || "",
        refresh_token: (await supabase.auth.getSession()).data.session?.refresh_token || "",
      })
    }

    toast.success("Welcome back!")
    window.location.href = "/dashboard"
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-[#050816] flex">
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-violet-600/20 to-indigo-600/20 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <PenTool className="h-10 w-10 text-violet-500" />
            <span className="font-bold text-3xl">SignFlow</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Secure Digital
            <span className="text-gradient block">Signature Platform</span>
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Upload PDFs, request signatures, track document status, and generate legally traceable signed files — all in one place.
          </p>
          <div className="mt-12 space-y-4">
            {["Enterprise-grade security", "Real-time audit trails", "Multi-signer support"].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-violet-500" />
                <span className="text-zinc-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-3xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">Welcome Back</h2>
              <p className="text-zinc-400 mt-2">Sign in to your account</p>
            </div>

            <form onSubmit={login} className="space-y-5">
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

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-zinc-500 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-[#111827] text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-zinc-400">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-violet-500 hover:text-violet-400">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#111827] px-4 text-zinc-500">or continue with</span>
              </div>
            </div>

            <button
              onClick={signInWithGoogle}
              className="w-full border border-white/10 hover:bg-white/5 py-3 rounded-xl font-medium transition flex items-center justify-center gap-3"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            <p className="text-center mt-6 text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-violet-500 hover:text-violet-400 font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
