"use server"

import { createClient } from "@/lib/supabase/server"
import { generateToken } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import type { Signer, SignerRole, SignerStatus } from "@/types"

export async function getSigners(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("signers")
    .select("*")
    .eq("document_id", documentId)
    .order("signing_order", { ascending: true })

  if (error) throw error
  return data as Signer[]
}

export async function inviteSigner(
  documentId: string,
  email: string,
  name: string,
  role: SignerRole,
  signingOrder: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const token = generateToken()

  const { error } = await supabase.from("signers").insert({
    document_id: documentId,
    email,
    name,
    role,
    signing_order: signingOrder,
    token,
    status: "pending",
  })

  if (error) throw error

  await supabase.from("audit_logs").insert({
    document_id: documentId,
    user_id: user.id,
    action: "signer_invited",
    details: { email, name, role },
  })

  revalidatePath(`/dashboard/documents/${documentId}`)
}

export async function removeSigner(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  await supabase.from("signature_fields").update({ signer_id: null }).eq("signer_id", id)
  await supabase.from("signatures").delete().eq("signer_id", id)

  const { error } = await supabase.from("signers").delete().eq("id", id)
  if (error) throw error

  revalidatePath("/dashboard/documents")
}

export async function updateSignerStatus(id: string, status: SignerStatus) {
  const supabase = await createClient()
  const updates: Record<string, unknown> = { status }

  if (status === "viewed") updates.viewed_at = new Date().toISOString()
  if (status === "signed") updates.signed_at = new Date().toISOString()

  const { error } = await supabase.from("signers").update(updates).eq("id", id)
  if (error) throw error
}

export async function resendInvitation(id: string) {
  const supabase = await createClient()
  const token = generateToken()
  const { error } = await supabase
    .from("signers")
    .update({ token, status: "pending" })
    .eq("id", id)

  if (error) throw error
}
