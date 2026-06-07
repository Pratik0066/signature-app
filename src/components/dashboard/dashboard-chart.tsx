"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

export function DashboardChart() {
  const [data, setData] = useState<{ month: string; uploads: number; signatures: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/analytics/monthly")
      const result = await res.json()
      if (result.data) setData(result.data)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="bg-[#111827] rounded-2xl p-6 border border-white/10 h-[350px] animate-pulse flex items-center justify-center">
        <div className="h-4 w-32 bg-white/5 rounded" />
      </div>
    )
  }

  return (
    <div className="bg-[#111827] rounded-2xl p-6 border border-white/10">
      <h3 className="font-semibold mb-6">Documents & Signatures Over Time</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.length ? data : [{ month: "No data", uploads: 0, signatures: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
            <YAxis stroke="#94A3B8" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "#111827",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                color: "#fff",
              }}
            />
            <Line type="monotone" dataKey="uploads" stroke="#7C3AED" strokeWidth={2} dot={{ fill: "#7C3AED" }} name="Uploads" />
            <Line type="monotone" dataKey="signatures" stroke="#22C55E" strokeWidth={2} dot={{ fill: "#22C55E" }} name="Signatures" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
