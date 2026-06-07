"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import {
  BarChart3, FileText, PenTool, TrendingUp, Clock, Loader2,
  LineChart, BarChart, PieChart
} from "lucide-react"
import {
  LineChart as ReLineChart, Line, BarChart as ReBarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart as RePieChart, Pie, Cell
} from "recharts"

const COLORS = ["#7C3AED", "#22C55E", "#F59E0B", "#EF4444", "#3B82F6"]

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ total: 0, signed: 0, pending: 0, rejected: 0 })
  const [monthlyData, setMonthlyData] = useState<{ month: string; uploads: number; signatures: number }[]>([])
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: documents } = await supabase
        .from("documents").select("status, created_at").eq("user_id", user.id)

      const { data: signatures } = await supabase
        .from("signatures").select("created_at")

      if (documents) {
        setStats({
          total: documents.length,
          signed: documents.filter(d => d.status === "signed").length,
          pending: documents.filter(d => d.status === "pending").length,
          rejected: documents.filter(d => d.status === "rejected").length,
        })

        const statusCount: Record<string, number> = {}
        documents.forEach(d => { statusCount[d.status] = (statusCount[d.status] || 0) + 1 })
        setStatusData(Object.entries(statusCount).map(([name, value]) => ({ name, value })))

        const monthlyMap = new Map<string, { uploads: number; signatures: number }>()
        documents.forEach(d => {
          const month = new Date(d.created_at).toLocaleString("en-US", { month: "short", year: "2-digit" })
          const entry = monthlyMap.get(month) || { uploads: 0, signatures: 0 }
          entry.uploads++
          monthlyMap.set(month, entry)
        })
        signatures?.forEach(s => {
          const month = new Date(s.created_at).toLocaleString("en-US", { month: "short", year: "2-digit" })
          const entry = monthlyMap.get(month) || { uploads: 0, signatures: 0 }
          entry.signatures++
          monthlyMap.set(month, entry)
        })
        setMonthlyData(Array.from(monthlyMap.entries()).map(([month, data]) => ({ month, ...data })))
      }
      setLoading(false)
    }
    fetchAnalytics()
  }, [])

  const cards = [
    { title: "Total Documents", value: stats.total, icon: FileText, color: "text-violet-500 bg-violet-500/10" },
    { title: "Total Signatures", value: stats.signed, icon: PenTool, color: "text-green-500 bg-green-500/10" },
    { title: "Completion Rate", value: stats.total ? `${Math.round((stats.signed / stats.total) * 100)}%` : "0%", icon: TrendingUp, color: "text-blue-500 bg-blue-500/10" },
    { title: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-500 bg-yellow-500/10" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-zinc-400 mt-1">Track your document signing performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="bg-[#111827] rounded-2xl border border-white/10 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">{card.title}</p>
                  <h3 className="text-3xl font-bold mt-2">{card.value}</h3>
                </div>
                <div className={`h-12 w-12 rounded-xl ${card.color} flex items-center justify-center`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#111827] rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-6">
            <LineChart size={18} className="text-violet-500" />
            <h3 className="font-semibold">Monthly Activity</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={monthlyData.length ? monthlyData : [{ month: "No data", uploads: 0, signatures: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff" }} />
                <Line type="monotone" dataKey="uploads" stroke="#7C3AED" strokeWidth={2} name="Uploads" />
                <Line type="monotone" dataKey="signatures" stroke="#22C55E" strokeWidth={2} name="Signatures" />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111827] rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart size={18} className="text-violet-500" />
            <h3 className="font-semibold">Status Distribution</h3>
          </div>
          <div className="h-[300px] flex items-center justify-center">
            {statusData.length === 0 ? (
              <p className="text-zinc-500">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" label>
                    {statusData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff" }} />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {statusData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-sm capitalize text-zinc-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111827] rounded-2xl border border-white/10 p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <BarChart size={18} className="text-violet-500" />
            <h3 className="font-semibold">Monthly Uploads</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={monthlyData.length ? monthlyData : [{ month: "No data", uploads: 0, signatures: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff" }} />
                <Bar dataKey="uploads" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Uploads" />
                <Bar dataKey="signatures" fill="#22C55E" radius={[4, 4, 0, 0]} name="Signatures" />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
