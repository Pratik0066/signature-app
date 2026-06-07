"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, Key, Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

type Tab = "profile" | "notifications" | "security" | "billing" | "api"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [fullName, setFullName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "api", label: "API Keys", icon: Key },
  ]

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName) return
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } })
    if (error) toast.error(error.message)
    else toast.success("Profile updated")
    setLoading(false)
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) toast.error(error.message)
    else {
      toast.success("Password updated")
      setCurrentPassword("")
      setNewPassword("")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your account settings</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-violet-500/10 text-violet-400"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="bg-[#111827] rounded-2xl border border-white/10 p-6">
        {activeTab === "profile" && (
          <form onSubmit={updateProfile} className="max-w-md space-y-5">
            <h2 className="text-xl font-semibold">Profile Information</h2>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#0B1020] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-violet-500/50 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 px-6 py-2.5 rounded-xl font-medium transition flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Save Changes
            </button>
          </form>
        )}

        {activeTab === "notifications" && (
          <div className="max-w-md space-y-5">
            <h2 className="text-xl font-semibold">Notification Preferences</h2>
            {["Document signed", "Signer viewed document", "New signer added", "Document completed"].map((item) => (
              <label key={item} className="flex items-center justify-between py-2">
                <span className="text-sm">{item}</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-[#0B1020] text-violet-600" />
              </label>
            ))}
          </div>
        )}

        {activeTab === "security" && (
          <form onSubmit={updatePassword} className="max-w-md space-y-5">
            <h2 className="text-xl font-semibold">Change Password</h2>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#0B1020] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-zinc-500 outline-none focus:border-violet-500/50 transition"
                />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#0B1020] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-zinc-500 outline-none focus:border-violet-500/50 transition"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 px-6 py-2.5 rounded-xl font-medium transition flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Update Password
            </button>
          </form>
        )}

        {activeTab === "billing" && (
          <div className="max-w-md space-y-5">
            <h2 className="text-xl font-semibold">Billing & Plan</h2>
            <div className="p-4 rounded-xl bg-white/5">
              <p className="text-sm text-zinc-400">Current Plan</p>
              <p className="text-lg font-semibold mt-1">Free</p>
              <p className="text-sm text-zinc-500 mt-1">Upgrade for unlimited documents and advanced features</p>
            </div>
            <button className="bg-violet-600 hover:bg-violet-700 px-6 py-2.5 rounded-xl font-medium transition">
              Upgrade Plan
            </button>
          </div>
        )}

        {activeTab === "api" && (
          <div className="max-w-md space-y-5">
            <h2 className="text-xl font-semibold">API Keys</h2>
            <p className="text-sm text-zinc-400">Manage your API keys for programmatic access.</p>
            <button className="bg-violet-600 hover:bg-violet-700 px-6 py-2.5 rounded-xl font-medium transition">
              Generate API Key
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
