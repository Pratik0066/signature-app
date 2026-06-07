import { FileText, Clock, PenTool, XCircle } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { DashboardChart } from "@/components/dashboard/dashboard-chart"
import { RecentDocuments } from "@/components/dashboard/recent-documents"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: documents } = await supabase
    .from("documents")
    .select("status")
    .eq("user_id", user?.id)

  const total = documents?.length || 0
  const signed = documents?.filter((d) => d.status === "signed").length || 0
  const pending = documents?.filter((d) => d.status === "pending").length || 0
  const rejected = documents?.filter((d) => d.status === "rejected").length || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-zinc-400 mt-2">Welcome back to SignFlow</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Documents" value={total.toString()} icon={<FileText className="text-violet-500" />} />
        <StatsCard title="Signed Documents" value={signed.toString()} icon={<PenTool className="text-green-500" />} />
        <StatsCard title="Pending Signatures" value={pending.toString()} icon={<Clock className="text-yellow-500" />} />
        <StatsCard title="Rejected" value={rejected.toString()} icon={<XCircle className="text-red-500" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardChart />
        </div>
        <RecentDocuments />
      </div>
    </div>
  )
}
