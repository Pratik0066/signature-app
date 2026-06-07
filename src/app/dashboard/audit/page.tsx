"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { formatDateTime } from "@/lib/utils"
import type { AuditLog } from "@/types"
import { ShieldCheck, Loader2, Clock, FileText, UserPlus, PenSquare, Eye, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

const actionConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  document_uploaded: { icon: FileText, color: "text-blue-500 bg-blue-500/10", label: "Document Uploaded" },
  field_added: { icon: PenSquare, color: "text-violet-500 bg-violet-500/10", label: "Field Added" },
  signer_invited: { icon: UserPlus, color: "text-yellow-500 bg-yellow-500/10", label: "Signer Invited" },
  document_viewed: { icon: Eye, color: "text-cyan-500 bg-cyan-500/10", label: "Document Viewed" },
  signature_added: { icon: PenSquare, color: "text-violet-500 bg-violet-500/10", label: "Signature Added" },
  document_signed: { icon: CheckCircle, color: "text-green-500 bg-green-500/10", label: "Document Signed" },
  document_completed: { icon: CheckCircle, color: "text-green-500 bg-green-500/10", label: "Document Completed" },
  signer_removed: { icon: XCircle, color: "text-red-500 bg-red-500/10", label: "Signer Removed" },
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      if (data) setLogs(data as AuditLog[])
      setLoading(false)
    }
    fetchLogs()
  }, [])

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
        <h1 className="text-3xl font-bold">Audit Trail</h1>
        <p className="text-zinc-400 mt-1">Track every action taken on your documents</p>
      </div>

      <div className="bg-[#111827] rounded-2xl border border-white/10 p-6">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheck className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500">No audit logs yet</p>
          </div>
        ) : (
          <div className="space-y-0">
            {logs.map((log, idx) => {
              const config = actionConfig[log.action] || { icon: Clock, color: "text-zinc-500 bg-zinc-500/10", label: log.action }
              const Icon = config.icon

              return (
                <div key={log.id} className="flex gap-4 pb-6 relative">
                  {idx < logs.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-0 w-px bg-white/5" />
                  )}
                  <div className={`h-10 w-10 rounded-xl ${config.color} flex items-center justify-center shrink-0`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{config.label}</p>
                      <span className="text-xs text-zinc-500">{formatDateTime(log.created_at)}</span>
                    </div>
                    {log.details && (
                      <p className="text-sm text-zinc-500 mt-1">
                        {JSON.stringify(log.details).replace(/[{}"]/g, " ").trim()}
                      </p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-zinc-600">
                      {log.ip_address && <span>IP: {log.ip_address}</span>}
                      {log.browser && <span>{log.browser}</span>}
                      {log.device && <span>{log.device}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
