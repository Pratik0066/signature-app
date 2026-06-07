"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"
import type { Document } from "@/types"
import { FileText } from "lucide-react"
import Link from "next/link"

export function RecentDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecent() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      setDocuments(data || [])
      setLoading(false)
    }
    fetchRecent()
  }, [])

  const statusColor: Record<string, string> = {
    draft: "text-zinc-500",
    pending: "text-yellow-500",
    signed: "text-green-500",
    rejected: "text-red-500",
    expired: "text-zinc-500",
  }

  return (
    <div className="bg-[#111827] rounded-2xl border border-white/10 p-6">
      <h3 className="font-semibold mb-6">Recent Documents</h3>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500">No documents yet</p>
          <Link href="/dashboard/documents/upload" className="text-violet-500 text-sm hover:text-violet-400 mt-2 inline-block">
            Upload your first document
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/dashboard/documents/${doc.id}`}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition group"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-zinc-500 group-hover:text-violet-500 transition" />
                <span className="text-sm font-medium">{doc.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-zinc-500">{formatDate(doc.created_at)}</span>
                <span className={`text-xs font-medium capitalize ${statusColor[doc.status]}`}>{doc.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
