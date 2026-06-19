"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"
import type { Document } from "@/types"
import {
  FileText, Upload, Search, Trash2, MoreHorizontal,
  ChevronDown, ArrowUpDown, Loader2
} from "lucide-react"
import { toast } from "sonner"

const statusColor: Record<string, string> = {
  draft: "bg-zinc-500/10 text-zinc-400",
  pending: "bg-yellow-500/10 text-yellow-500",
  signed: "bg-green-500/10 text-green-500",
  rejected: "bg-red-500/10 text-red-500",
  expired: "bg-zinc-500/10 text-zinc-500",
}

type SortField = "name" | "created_at" | "status"
type SortDir = "asc" | "desc"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  useEffect(() => {
    async function fetchDocuments() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!error) setDocuments(data || [])
      setLoading(false)
    }
    fetchDocuments()
  }, [])

  const filtered = useMemo(() => {
    let result = [...documents]

    if (search) {
      result = result.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter)
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortField === "name") cmp = a.name.localeCompare(b.name)
      else if (sortField === "status") cmp = a.status.localeCompare(b.status)
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [documents, search, statusFilter, sortField, sortDir])

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return

    const { data: doc } = await supabase
      .from("documents")
      .select("file_path")
      .eq("id", id)
      .single()

    if (doc?.file_path) {
      await supabase.storage.from("documents").remove([doc.file_path])
    }

    await supabase.from("signature_fields").delete().eq("document_id", id)
    await supabase.from("signers").delete().eq("document_id", id)
    await supabase.from("signatures").delete().eq("document_id", id)
    await supabase.from("audit_logs").delete().eq("document_id", id)

    const { error } = await supabase.from("documents").delete().eq("id", id)
    if (error) {
      toast.error("Failed to delete document")
      return
    }
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    toast.success("Document deleted")
  }, [])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-zinc-600" />
    return <ChevronDown size={14} className={`transition ${sortDir === "asc" ? "rotate-180" : ""}`} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-zinc-400 mt-1">Manage your documents</p>
        </div>
        <Link
          href="/dashboard/documents/upload"
          className="bg-violet-600 hover:bg-violet-700 px-5 py-2.5 rounded-xl font-medium transition flex items-center gap-2"
        >
          <Upload size={18} />
          Upload
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111827] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-violet-500/50 transition placeholder-zinc-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-500/50 transition"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="signed">Signed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th
                  className="p-4 text-left text-sm font-medium text-zinc-400 cursor-pointer hover:text-white transition"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Name <SortIcon field="name" />
                  </div>
                </th>
                <th
                  className="p-4 text-left text-sm font-medium text-zinc-400 cursor-pointer hover:text-white transition"
                  onClick={() => toggleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status <SortIcon field="status" />
                  </div>
                </th>
                <th
                  className="p-4 text-left text-sm font-medium text-zinc-400 cursor-pointer hover:text-white transition hidden md:table-cell"
                  onClick={() => toggleSort("created_at")}
                >
                  <div className="flex items-center gap-1">
                    Created <SortIcon field="created_at" />
                  </div>
                </th>
                <th className="p-4 text-right text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-violet-500" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-500 mb-2">No documents found</p>
                    <Link
                      href="/dashboard/documents/upload"
                      className="text-violet-500 hover:text-violet-400 text-sm"
                    >
                      Upload your first document
                    </Link>
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr key={doc.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="p-4">
                      <Link href={`/dashboard/documents/${doc.id}`} className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <FileText size={16} className="text-violet-500" />
                        </div>
                        <span className="font-medium">{doc.name}</span>
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor[doc.status]}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-zinc-500 hidden md:table-cell">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(doc.id, doc.name)}
                        className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition inline-flex items-center justify-center"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
