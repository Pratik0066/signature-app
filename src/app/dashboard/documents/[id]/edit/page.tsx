"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import type { SignatureField, Signer, FieldType } from "@/types"
import {
  Pen, Type, Signature, Calendar, CheckSquare, Users,
  Save, ArrowLeft, Loader2, Trash2, GripVertical
} from "lucide-react"
import { toast } from "sonner"

const fieldIcons: Record<FieldType, typeof Pen> = {
  signature: Signature,
  initials: Pen,
  text: Type,
  date: Calendar,
  checkbox: CheckSquare,
}

const fieldColors: Record<FieldType, string> = {
  signature: "border-violet-500 bg-violet-500/10",
  initials: "border-blue-500 bg-blue-500/10",
  text: "border-green-500 bg-green-500/10",
  date: "border-yellow-500 bg-yellow-500/10",
  checkbox: "border-pink-500 bg-pink-500/10",
}

export default function EditDocumentPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [fields, setFields] = useState<SignatureField[]>([])
  const [signers, setSigners] = useState<Signer[]>([])
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [selectedTool, setSelectedTool] = useState<FieldType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data: flds } = await supabase
        .from("signature_fields").select("*").eq("document_id", id)
      const { data: sigs } = await supabase
        .from("signers").select("*").eq("document_id", id).order("signing_order")

      if (flds) setFields(flds as SignatureField[])
      if (sigs) setSigners(sigs as Signer[])
      setLoading(false)
    }
    load()
  }, [id])

  const addField = useCallback((type: FieldType) => {
    const labelMap: Record<FieldType, string> = {
      signature: "Signature",
      initials: "Initials",
      text: "Text",
      date: "Date",
      checkbox: "Checkbox",
    }

    const newField: SignatureField = {
      id: `temp-${Date.now()}`,
      document_id: id,
      signer_id: signers[0]?.id || null,
      field_type: type,
      label: `${labelMap[type]} ${fields.filter(f => f.field_type === type).length + 1}`,
      page: 1,
      x: 100,
      y: 100 + fields.length * 80,
      width: 200,
      height: 60,
      required: true,
      created_at: new Date().toISOString(),
    }

    setFields((prev) => [...prev, newField])
    setSelectedTool(null)

    toast.success(`${labelMap[type]} field added`)
  }, [id, fields, signers])

  const removeField = useCallback((fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId))
    if (selectedField === fieldId) setSelectedField(null)
  }, [selectedField])

  const handleDrop = useCallback((e: React.DragEvent, fieldId: string) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, x, y } : f))
    )
  }, [])

  async function handleSave() {
    setSaving(true)

    const { data: existing } = await supabase
      .from("signature_fields").select("id").eq("document_id", id)

    const existingIds = new Set(existing?.map((f) => f.id) || [])

    for (const field of fields) {
      if (field.id.startsWith("temp-")) {
        const { id: _, ...rest } = field
        await supabase.from("signature_fields").insert({
          document_id: id,
          signer_id: rest.signer_id,
          field_type: rest.field_type,
          label: rest.label,
          page: rest.page,
          x: rest.x,
          y: rest.y,
          width: rest.width,
          height: rest.height,
          required: rest.required,
        })
      } else if (existingIds.has(field.id)) {
        await supabase
          .from("signature_fields")
          .update({ x: field.x, y: field.y, width: field.width, height: field.height, signer_id: field.signer_id })
          .eq("id", field.id)
      }
    }

    for (const existingId of existingIds) {
      if (!fields.some((f) => f.id === existingId)) {
        await supabase.from("signature_fields").delete().eq("id", existingId)
      }
    }

    if (signers.length > 0 && fields.length > 0) {
      await supabase.from("documents").update({ status: "pending" }).eq("id", id)
    }

    setSaving(false)
    toast.success("Document saved!")
    router.push(`/dashboard/documents/${id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0B1020]">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="h-9 w-9 rounded-xl bg-[#111827] border border-white/10 flex items-center justify-center hover:bg-white/5 transition">
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-semibold">Place Signature Fields</h1>
        </div>
        <div className="flex items-center gap-2">
          {signers.length === 0 && (
            <p className="text-sm text-yellow-500 mr-2">Add signers first</p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 px-5 py-2 rounded-xl font-medium transition flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save & Send"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-[#0B1020] border-r border-white/10 p-4 space-y-4 overflow-y-auto">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Tools</p>
            <div className="space-y-1">
              {(["signature", "initials", "text", "date", "checkbox"] as FieldType[]).map((type) => {
                const Icon = fieldIcons[type]
                return (
                  <button
                    key={type}
                    onClick={() => addField(type)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition text-sm text-zinc-400 hover:text-white"
                  >
                    <Icon size={16} />
                    <span className="capitalize">{type}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {signers.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Signers</p>
              <div className="space-y-1">
                {signers.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400">
                    <div className="h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs">
                      {s.name[0]}
                    </div>
                    <span className="truncate">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fields.length > 0 && (
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Fields</p>
              <div className="space-y-1">
                {fields.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedField(f.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition ${
                      selectedField === f.id ? "bg-violet-500/10 text-violet-400" : "text-zinc-400 hover:bg-white/5"
                    }`}
                  >
                    <GripVertical size={12} />
                    <span className="capitalize">{f.field_type}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeField(f.id) }}
                      className="ml-auto text-zinc-600 hover:text-red-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 bg-[#050816] p-6 overflow-auto">
          <div
            ref={canvasRef}
            className="relative mx-auto bg-white rounded-2xl shadow-2xl"
            style={{ width: 595, minHeight: 842 }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-zinc-300 text-sm">
              PDF Preview Area
            </div>

            {fields.map((field) => {
              const colors = fieldColors[field.field_type]
              return (
                <div
                  key={field.id}
                  className={`absolute field-placeholder ${colors}`}
                  style={{
                    left: `${field.x}%`,
                    top: `${field.y}%`,
                    width: field.width,
                    height: field.height,
                  }}
                  onClick={() => setSelectedField(field.id)}
                  draggable
                  onDragEnd={(e) => handleDrop(e, field.id)}
                >
                  <div className="flex items-center justify-between h-full px-3">
                    <span className="text-xs capitalize opacity-70">{field.field_type}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeField(field.id) }}
                      className="h-5 w-5 rounded bg-red-500/20 flex items-center justify-center hover:bg-red-500/40 transition"
                    >
                      <Trash2 size={10} className="text-red-500" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
