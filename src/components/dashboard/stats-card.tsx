import { ReactNode } from "react"

interface Props {
  title: string
  value: string
  icon: ReactNode
}

export function StatsCard({ title, value, icon }: Props) {
  return (
    <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 hover:bg-[#1a2332] transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-zinc-400 text-sm">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
        </div>
        <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  )
}
