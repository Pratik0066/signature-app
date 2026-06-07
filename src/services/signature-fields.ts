"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { FieldType, SignatureField } from "@/types"

export async function getSignatureFields(documentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("signature_fields")
    .select("*")
    .eq("document_id", documentId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return data as SignatureField[]
}

export async function createSignatureField(
  documentId: string,
  fieldType: FieldType,
  label: string,
  page: number,
  x: number,
  y: number,
  width = 200,
  height = 60
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("signature_fields")
    .insert({
      document_id: documentId,
      field_type: fieldType,
      label,
      page,
      x,
      y,
      width,
      height,
      required: true,
    })
    .select()
    .single()

  if (error) throw error

  await supabase.from("audit_logs").insert({
    document_id: documentId,
    user_id: user.id,
    action: "field_added",
    details: { field_type: fieldType, label, page },
  })

  revalidatePath(`/dashboard/documents/${documentId}`)
  return data as SignatureField
}

export async function updateSignatureField(
  id: string,
  updates: Partial<Pick<SignatureField, "x" | "y" | "width" | "height" | "signer_id" | "required">>
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("signature_fields")
    .update(updates)
    .eq("id", id)

  if (error) throw error
  revalidatePath("/dashboard/documents")
}

export async function deleteSignatureField(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("signature_fields")
    .delete()
    .eq("id", id)

  if (error) throw error
  revalidatePath("/dashboard/documents")
}
