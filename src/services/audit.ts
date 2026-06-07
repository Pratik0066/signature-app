"use server"

import { createClient } from "@/lib/supabase/server"
import type { AuditLog } from "@/types"

export async function getAuditLogs(documentId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (documentId) {
    query = query.eq("document_id", documentId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as AuditLog[]
}

export async function getDashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: documents } = await supabase
    .from("documents")
    .select("status")
    .eq("user_id", user.id)

  const total = documents?.length || 0
  const signed = documents?.filter((d) => d.status === "signed").length || 0
  const pending = documents?.filter((d) => d.status === "pending").length || 0
  const rejected = documents?.filter((d) => d.status === "rejected").length || 0

  const { count: totalSignatures } = await supabase
    .from("signatures")
    .select("*", { count: "exact", head: true })

  return { total, signed, pending, rejected, totalSignatures: totalSignatures || 0 }
}

export async function getMonthlyAnalytics() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: documents } = await supabase
    .from("documents")
    .select("created_at, status")
    .eq("user_id", user.id)
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: true })

  const { data: signatures } = await supabase
    .from("signatures")
    .select("created_at")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: true })

  const monthlyMap = new Map<string, { uploads: number; signatures: number }>()

  for (const doc of documents || []) {
    const month = new Date(doc.created_at).toLocaleString("en-US", { month: "short", year: "2-digit" })
    const entry = monthlyMap.get(month) || { uploads: 0, signatures: 0 }
    entry.uploads++
    monthlyMap.set(month, entry)
  }

  for (const sig of signatures || []) {
    const month = new Date(sig.created_at).toLocaleString("en-US", { month: "short", year: "2-digit" })
    const entry = monthlyMap.get(month) || { uploads: 0, signatures: 0 }
    entry.signatures++
    monthlyMap.set(month, entry)
  }

  return Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    ...data,
  }))
}
