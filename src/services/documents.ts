"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Document, DocumentStatus } from "@/types"

export async function getDocuments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Document[]
}

export async function getDocument(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error) throw error
  return data as Document
}

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const file = formData.get("file") as File
  if (!file) throw new Error("No file provided")
  if (file.type !== "application/pdf") throw new Error("Only PDF files are allowed")
  if (file.size > 10 * 1024 * 1024) throw new Error("File size must be under 10MB")

  const filePath = `${user.id}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from("documents")
    .getPublicUrl(filePath)

  const { error: dbError } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      name: file.name.replace(".pdf", ""),
      file_url: publicUrl,
      file_path: filePath,
      status: "draft",
    })

  if (dbError) throw dbError

  await supabase.from("audit_logs").insert({
    document_id: null,
    user_id: user.id,
    action: "document_uploaded",
    details: { name: file.name },
  })

  revalidatePath("/dashboard/documents")
}

export async function deleteDocument(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const doc = await getDocument(id)

  await supabase.storage.from("documents").remove([doc.file_path])

  await supabase.from("signature_fields").delete().eq("document_id", id)
  await supabase.from("signers").delete().eq("document_id", id)
  await supabase.from("audit_logs").delete().eq("document_id", id)
  await supabase.from("signatures").delete().eq("document_id", id)

  const { error } = await supabase.from("documents").delete().eq("id", id)
  if (error) throw error

  revalidatePath("/dashboard/documents")
}

export async function updateDocumentStatus(id: string, status: DocumentStatus) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("documents")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
  revalidatePath("/dashboard/documents")
}

export async function renameDocument(id: string, name: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("documents")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
  revalidatePath("/dashboard/documents")
}
