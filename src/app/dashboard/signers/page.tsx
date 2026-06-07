"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"
import { Users, Mail, ExternalLink, Loader2, RefreshCw } from "lucide-react"

type SignerWithDoc = {
  id: string
  email: string
  name: string
  role: string
  status: string
  signing_order: number
  viewed_at: string | null
  signed_at: string | null
  created_at: string
  documents: { name: string }
}

export default function SignersPage() {
  const [signers, setSigners] = useState<SignerWithDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSigners() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("signers")
        .select("*, documents!inner(name)")
        .order("created_at", { ascending: false })

      if (data) setSigners(data as unknown as SignerWithDoc[])
      setLoading(false)
    }
    fetchSigners()
  }, [])

  const statusColor: Record<string, string> = {
    pending: "text-yellow-500",
    viewed: "text-blue-500",
    signed: "text-green-500",
    rejected: "text-red-500",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Signers</h1>
        <p className="text-zinc-400 mt-1">Track all signers across your documents</p>
      </div>

      <div className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left text-sm font-medium text-zinc-400">Signer</th>
                <th className="p-4 text-left text-sm font-medium text-zinc-400 hidden md:table-cell">Document</th>
                <th className="p-4 text-left text-sm font-medium text-zinc-400">Role</th>
                <th className="p-4 text-left text-sm font-medium text-zinc-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-zinc-400 hidden md:table-cell">Signed At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-violet-500" />
                  </td>
                </tr>
              ) : signers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-500 mb-2">No signers yet</p>
                    <Link href="/dashboard/documents" className="text-violet-500 hover:text-violet-400 text-sm">
                      Go to documents to invite signers
                    </Link>
                  </td>
                </tr>
              ) : (
                signers.map((signer) => (
                  <tr key={signer.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-violet-500/20 flex items-center justify-center text-sm font-medium">
                          {signer.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{signer.name}</p>
                          <p className="text-sm text-zinc-500">{signer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-zinc-400 hidden md:table-cell">{signer.documents.name}</td>
                    <td className="p-4 text-sm capitalize">{signer.role}</td>
                    <td className="p-4">
                      <span className={`text-sm font-medium capitalize ${statusColor[signer.status] || "text-zinc-400"}`}>
                        {signer.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-zinc-500 hidden md:table-cell">
                      {signer.signed_at ? formatDate(signer.signed_at) : "-"}
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
