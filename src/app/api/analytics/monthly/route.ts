import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: documents } = await supabase
      .from("documents")
      .select("created_at")
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

    const data = Array.from(monthlyMap.entries()).map(([month, stats]) => ({
      month,
      ...stats,
    }))

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
