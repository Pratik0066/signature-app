"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"
import type { Document, Signer, SignatureField } from "@/types"
import { Document as PdfDoc, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"
import {
  FileText, ArrowLeft, Pen, Users, Trash2, Download,
  Mail, Clock, CheckCircle, XCircle, Loader2, Copy
} from "lucide-react"
import { toast } from "sonner"

const statusColor: Record<string, string> = {
  draft: "bg-zinc-500/10 text-zinc-400",
  pending: "bg-yellow-500/10 text-yellow-500",
  signed: "bg-green-500/10 text-green-500",
  rejected: "bg-red-500/10 text-red-500",
  expired: "bg-zinc-500/10 text-zinc-500",
}

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [signers, setSigners] = useState<Signer[]>([])
  const [fields, setFields] = useState<SignatureField[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedField, setSelectedField] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: doc } = await supabase
        .from("documents").select("*").eq("id", id).single()

      const { data: sigs } = await supabase
        .from("signers").select("*").eq("document_id", id).order("signing_order")

      const { data: flds } = await supabase
        .from("signature_fields").select("*").eq("document_id", id)

      if (doc) setDocument(doc as Document)
      if (sigs) setSigners(sigs as Signer[])
      if (flds) setFields(flds as SignatureField[])
      setLoading(false)
    }
    load()
  }, [id])

  async function handleDelete() {
    if (!document) return
    if (!confirm("Delete this document?")) return

    await supabase.storage.from("documents").remove([document.file_path])
    await supabase.from("signature_fields").delete().eq("document_id", id)
    await supabase.from("signers").delete().eq("document_id", id)
    await supabase.from("signatures").delete().eq("document_id", id)
    await supabase.from("documents").delete().eq("id", id)

    toast.success("Document deleted")
    router.push("/dashboard/documents")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="text-center py-24">
        <FileText className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Document not found</h2>
        <Link href="/dashboard/documents" className="text-violet-500 hover:text-violet-400">Back to documents</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/documents" className="h-9 w-9 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center hover:bg-white/5 transition">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{document.name}</h1>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor[document.status]}`}>
              {document.status}
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">Created {formatDate(document.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          {document.status === "draft" && (
            <Link
              href={`/dashboard/documents/${id}/edit`}
              className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-xl font-medium transition flex items-center gap-2"
            >
              <Pen size={16} />
              Edit & Send
            </Link>
          )}
          <button onClick={handleDelete} className="h-10 w-10 rounded-xl border border-white/10 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] rounded-2xl border border-white/10 p-6">
            <h2 className="font-semibold mb-4">Document Preview</h2>
            <div className="relative mx-auto bg-white rounded-xl overflow-hidden" style={{ width: 500, minHeight: 700 }}>
              <div className="absolute inset-0">
                <PdfDoc
                  file={document.file_url}
                  loading={
                    <div className="flex items-center justify-center h-64 text-zinc-400 text-sm">
                      Loading PDF...
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
                      Failed to load PDF
                    </div>
                  }
                >
                  <Page pageNumber={1} width={500} />
                </PdfDoc>
              </div>
              {fields.map((field) => (
                <div
                  key={field.id}
                  className={`absolute border-2 rounded flex items-center px-2 cursor-pointer transition-all ${
                    selectedField === field.id
                      ? "border-violet-400 bg-violet-500/20 ring-2 ring-violet-400 z-10"
                      : "border-violet-500/50 bg-violet-500/10 hover:border-violet-400/70"
                  }`}
                  style={{
                    left: `${field.x}%`,
                    top: `${field.y}%`,
                    width: field.width,
                    height: field.height,
                  }}
                  onClick={() => setSelectedField(selectedField === field.id ? null : field.id)}
                >
                  <span className={`text-xs capitalize font-medium ${selectedField === field.id ? "text-violet-300" : "text-violet-600"}`}>
                    {field.field_type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111827] rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Signers ({signers.length})</h2>
              {document.status === "draft" && (
                <Link href={`/dashboard/documents/${id}/edit`} className="text-sm text-violet-500 hover:text-violet-400">
                  Manage
                </Link>
              )}
            </div>
            {signers.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No signers added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {signers.map((signer) => (
                  <div key={signer.id} className="p-3 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{signer.name}</p>
                        <p className="text-xs text-zinc-500">{signer.email}</p>
                      </div>
                      <span className={`text-xs capitalize ${
                        signer.status === "signed" ? "text-green-500" :
                        signer.status === "viewed" ? "text-blue-500" :
                        signer.status === "rejected" ? "text-red-500" :
                        "text-yellow-500"
                      }`}>
                        {signer.status}
                      </span>
                    </div>
                    {signer.status === "pending" && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/sign/${signer.token}`)
                          toast.success("Signing link copied!")
                        }}
                        className="mt-2 flex items-center gap-1 text-xs text-violet-500 hover:text-violet-400 transition"
                      >
                        <Copy size={12} />
                        Copy signing link
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#111827] rounded-2xl border border-white/10 p-6">
            <h2 className="font-semibold mb-4">Fields ({fields.length})</h2>
            {fields.length === 0 ? (
              <p className="text-sm text-zinc-500">No signature fields added</p>
            ) : (
              <div className="space-y-2">
                {fields.map((f) => (
                  <div
                    key={f.id}
                    className={`flex items-center gap-2 text-sm rounded-lg px-2 py-1.5 cursor-pointer transition ${
                      selectedField === f.id
                        ? "bg-violet-500/10 text-violet-300"
                        : "text-zinc-400 hover:bg-white/5"
                    }`}
                    onClick={() => setSelectedField(selectedField === f.id ? null : f.id)}
                  >
                    <div className={`h-2 w-2 rounded-full ${selectedField === f.id ? "bg-violet-400" : "bg-violet-500"}`} />
                    <span className="capitalize">{f.field_type}</span>
                    <span className="text-zinc-600">- Page {f.page}</span>
                  </div>
                ))}
              </div>
            )}
            {selectedField && (() => {
              const f = fields.find(f => f.id === selectedField)
              if (!f) return null
              return (
                <div className="mt-4 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 space-y-1">
                  <p className="text-sm font-medium capitalize text-violet-300">{f.field_type}</p>
                  <p className="text-xs text-zinc-500">{f.label}</p>
                  <p className="text-xs text-zinc-500">Position: {Math.round(f.x)}%, {Math.round(f.y)}%</p>
                  <p className="text-xs text-zinc-500">Size: {Math.round(f.width)}x{Math.round(f.height)}px</p>
                  {f.signer_id && <p className="text-xs text-zinc-500">Assigned to signer</p>}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
