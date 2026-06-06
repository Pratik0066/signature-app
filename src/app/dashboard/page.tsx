import {
  FileText,
  Clock,
  PenTool,
  XCircle,
} from "lucide-react";

import { StatsCard } from "@/components/dashboard/stats-card";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { RecentDocuments } from "@/components/dashboard/recent-documents";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <p className="text-zinc-400 mt-2">
          Welcome back to SignFlow
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Documents"
          value="1248"
          icon={
            <FileText className="text-violet-500" />
          }
        />

        <StatsCard
          title="Signed Documents"
          value="876"
          icon={
            <PenTool className="text-green-500" />
          }
        />

        <StatsCard
          title="Pending Documents"
          value="276"
          icon={
            <Clock className="text-yellow-500" />
          }
        />

        <StatsCard
          title="Rejected Documents"
          value="96"
          icon={
            <XCircle className="text-red-500" />
          }
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsChart />
        </div>

        <RecentDocuments />
      </div>
    </div>
  );
}