"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import type { SignatureField, Signer, SignerRole, FieldType } from "@/types"
import type { Document as DocType } from "@/types"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"
import { inviteSigner } from "@/services/signers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog"
import {
  Pen, Type, Signature, Calendar, CheckSquare, Upload, Users,
  Save, ArrowLeft, Loader2, Trash2, GripVertical, UserPlus
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
  const [document, setDocument] = useState<DocType | null>(null)
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [selectedTool, setSelectedTool] = useState<FieldType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteName, setInviteName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<SignerRole>("signer")
  const [inviting, setInviting] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggingField, setDraggingField] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizingField, setResizingField] = useState<{ id: string; dir: string } | null>(null)
  const [fieldContent, setFieldContent] = useState<Record<string, string>>({})
  const [signFieldId, setSignFieldId] = useState<string | null>(null)
  const [signMode, setSignMode] = useState<"draw" | "type" | "upload" | null>(null)
  const [typedSignature, setTypedSignature] = useState("")
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    async function load() {
      const { data: doc } = await supabase
        .from("documents").select("*").eq("id", id).single()
      const { data: flds } = await supabase
        .from("signature_fields").select("*").eq("document_id", id)
      const { data: sigs } = await supabase
        .from("signers").select("*").eq("document_id", id).order("signing_order")

      if (doc) setDocument(doc as DocType)
      if (flds) setFields(flds as SignatureField[])
      if (sigs) setSigners(sigs as Signer[])
      setLoading(false)
    }
    load()
  }, [id])

  const addField = useCallback((type: FieldType, x?: number, y?: number) => {
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
      x: x ?? 10,
      y: y ?? 10 + fields.length * 12,
      width: type === "initials" ? 120 : 200,
      height: type === "initials" ? 50 : 60,
      required: true,
      created_at: new Date().toISOString(),
    }

    setFields((prev) => [...prev, newField])
    toast.success(`${labelMap[type]} field added`)
  }, [id, fields, signers])

  useEffect(() => {
    if (!signFieldId) return
    const timer = setTimeout(() => {
      if (!signatureCanvasRef.current) return
      const canvas = signatureCanvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      canvas.width = 400
      canvas.height = 150
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
    }, 50)
    return () => clearTimeout(timer)
  }, [signFieldId])

  const handleInviteSigner = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error("Name and email are required")
      return
    }
    setInviting(true)
    try {
      const signingOrder = signers.length + 1
      await inviteSigner(id, inviteEmail.trim(), inviteName.trim(), inviteRole, signingOrder)
      const { data: sigs } = await supabase
        .from("signers").select("*").eq("document_id", id).order("signing_order")
      if (sigs) setSigners(sigs as Signer[])
      toast.success("Signer invited!")
      setInviteOpen(false)
      setInviteName("")
      setInviteEmail("")
      setInviteRole("signer")
    } catch {
      toast.error("Failed to invite signer")
    }
    setInviting(false)
  }

  const removeField = useCallback((fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId))
    if (selectedField === fieldId) setSelectedField(null)
  }, [selectedField])

  const handleFieldMouseDown = useCallback((e: React.MouseEvent, fieldId: string) => {
    if ((e.target as HTMLElement).closest('button, input, .resize-handle')) return
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const field = fields.find(f => f.id === fieldId)
    if (!field) return
    const offsetX = ((e.clientX - rect.left) / rect.width) * 100 - field.x
    const offsetY = ((e.clientY - rect.top) / rect.height) * 100 - field.y
    setDraggingField(fieldId)
    setDragOffset({ x: offsetX, y: offsetY })
  }, [fields])

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, fieldId: string, dir: string) => {
    e.stopPropagation()
    e.preventDefault()
    setResizingField({ id: fieldId, dir })
  }, [])

  const handleFieldContentChange = useCallback((fieldId: string, value: string) => {
    setFields((prev) =>
      prev.map((f) => f.id === fieldId ? { ...f, label: value } : f)
    )
  }, [])

  useEffect(() => {
    if (!draggingField || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()

    const handleMouseMove = (e: MouseEvent) => {
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x))
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y))
      setFields((prev) =>
        prev.map((f) => f.id === draggingField ? { ...f, x, y } : f)
      )
    }

    const handleMouseUp = () => setDraggingField(null)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingField, dragOffset])

  useEffect(() => {
    if (!resizingField || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()

    const handleMouseMove = (e: MouseEvent) => {
      const field = fields.find(f => f.id === resizingField.id)
      if (!field) return

      let newX = field.x
      let newY = field.y
      let newW = field.width
      let newH = field.height

      const mx = ((e.clientX - rect.left) / rect.width) * 100
      const my = ((e.clientY - rect.top) / rect.height) * 100
      const dir = resizingField.dir

      if (dir.includes('e')) {
        newW = Math.max(60, (mx - field.x) / 100 * rect.width)
      }
      if (dir.includes('w')) {
        const right = field.x + (field.width / rect.width) * 100
        newX = Math.min(mx, right - 0.5)
        newW = Math.max(60, (right - newX) / 100 * rect.width)
      }
      if (dir.includes('s')) {
        newH = Math.max(40, (my - field.y) / 100 * rect.height)
      }
      if (dir.includes('n')) {
        const bottom = field.y + (field.height / rect.height) * 100
        newY = Math.min(my, bottom - 0.5)
        newH = Math.max(40, (bottom - newY) / 100 * rect.height)
      }

      setFields((prev) =>
        prev.map((f) => f.id === resizingField.id ? { ...f, x: newX, y: newY, width: newW, height: newH } : f)
      )
    }

    const handleMouseUp = () => setResizingField(null)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizingField, fields])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!selectedTool) return
    if ((e.target as HTMLElement).closest('.field-placeholder')) return
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    addField(selectedTool, x, y)
    setSelectedTool(null)
  }, [selectedTool, addField])

  const drawStart = useCallback((e: React.MouseEvent) => {
    setIsDrawing(true)
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }, [])

  const drawMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing) return
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }, [isDrawing])

  const drawEnd = useCallback(() => {
    setIsDrawing(false)
    if (!signatureCanvasRef.current) return
    setSignatureDataUrl(signatureCanvasRef.current.toDataURL("image/png"))
  }, [])

  const resetCanvas = useCallback(() => {
    if (!signatureCanvasRef.current) return
    const canvas = signatureCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureDataUrl(null)
    setIsDrawing(false)
  }, [])

  const saveTypeSignature = useCallback(() => {
    if (!typedSignature) return
    const isInitials = fields.find(f => f.id === signFieldId)?.field_type === "initials"
    const canvas = window.document.createElement("canvas")
    canvas.width = 400
    canvas.height = 120
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#000000"
    ctx.font = isInitials ? "bold 56px Arial, sans-serif" : "48px 'Brush Script MT', cursive"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(isInitials ? typedSignature.toUpperCase() : typedSignature, 200, 60)
    setSignatureDataUrl(canvas.toDataURL("image/png"))
    setSignMode(null)
  }, [typedSignature, signFieldId, fields])

  const handleUploadSignature = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setSignatureDataUrl(event.target.result as string)
        setSignMode(null)
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const confirmSignature = useCallback(() => {
    if (!signFieldId || !signatureDataUrl) return
    setFieldContent((prev) => ({ ...prev, [signFieldId]: signatureDataUrl }))
    setSignFieldId(null)
    setSignMode(null)
    setSignatureDataUrl(null)
    setTypedSignature("")
    toast.success("Signature saved")
  }, [signFieldId, signatureDataUrl])

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
                const isActive = selectedTool === type
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedTool(isActive ? null : type)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm ${
                      isActive
                        ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/50"
                        : "hover:bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="capitalize">{type}</span>
                    {isActive && <span className="ml-auto text-[10px] text-violet-400">Click PDF</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Signers</p>
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <button className="text-xs text-violet-500 hover:text-violet-400 flex items-center gap-1">
                    <UserPlus size={12} />
                    Invite
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-[#111827] border border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">Invite Signer</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Name</label>
                      <Input
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Email</label>
                      <Input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as SignerRole)}
                        className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
                      >
                        <option value="signer">Signer</option>
                        <option value="approver">Approver</option>
                        <option value="cc">CC</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleInviteSigner} disabled={inviting}>
                        {inviting ? "Inviting..." : "Invite"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {signers.length === 0 ? (
              <p className="text-xs text-zinc-600">No signers added yet</p>
            ) : (
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
            )}
          </div>

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
            className="relative mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ width: 595, minHeight: 842 }}
            onClick={handleCanvasClick}
          >
            {document?.file_url && (
              <div className="absolute inset-0">
                <Document
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
                  <Page pageNumber={1} width={595} />
                </Document>
              </div>
            )}

            {fields.map((field) => {
              const colors = fieldColors[field.field_type]
              const isSelected = selectedField === field.id
              const isTextType = field.field_type === "text" || field.field_type === "date"
              const hasContent = !!fieldContent[field.id]
              const Icon = fieldIcons[field.field_type]
              return (
                <div
                  key={field.id}
                  className={`absolute field-placeholder rounded-lg border-2 ${colors} ${
                    isSelected ? "z-10 ring-2 ring-violet-400" : ""
                  } ${draggingField === field.id ? "opacity-80" : ""} ${selectedTool ? "cursor-crosshair" : ""}`}
                  style={{
                    left: `${field.x}%`,
                    top: `${field.y}%`,
                    width: field.width,
                    height: field.height,
                    userSelect: "none",
                  }}
                  onClick={(e) => { e.stopPropagation(); setSelectedField(field.id) }}
                  onMouseDown={(e) => handleFieldMouseDown(e, field.id)}
                >
                  {isTextType ? (
                    <input
                      type={field.field_type === "date" ? "date" : "text"}
                      value={field.label}
                      onChange={(e) => handleFieldContentChange(field.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-full h-full bg-transparent px-3 text-sm text-zinc-800 outline-none"
                      placeholder={`Enter ${field.field_type}...`}
                    />
                  ) : field.field_type === "checkbox" ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="h-5 w-5 rounded border-2 border-pink-400 flex items-center justify-center">
                        <CheckSquare size={14} className="text-pink-500" />
                      </div>
                    </div>
                  ) : hasContent ? (
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <img
                        src={fieldContent[field.id]}
                        alt={field.field_type}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between h-full px-3">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="opacity-50 text-black" />
                        <span className="text-xs capitalize opacity-70 text-black">{field.field_type}</span>
                      </div>
                      {isSelected ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSignFieldId(field.id); setSignMode("draw"); setSignatureDataUrl(null); setTypedSignature("") }}
                          className="h-6 px-2 rounded bg-violet-500/20 text-[10px] text-violet-600 font-medium hover:bg-violet-500/30 transition"
                        >
                          {field.field_type === "initials" ? "Add Initials" : "Sign"}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeField(field.id) }}
                          className="h-5 w-5 rounded bg-red-500/20 flex items-center justify-center hover:bg-red-500/40 transition"
                        >
                          <Trash2 size={10} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  )}
                  {isSelected && (
                    <>
                      <div className="resize-handle absolute -top-1 -left-1 h-3 w-3 bg-violet-500 rounded-sm cursor-nw-resize" onMouseDown={(e) => handleResizeMouseDown(e, field.id, "nw")} />
                      <div className="resize-handle absolute -top-1 -right-1 h-3 w-3 bg-violet-500 rounded-sm cursor-ne-resize" onMouseDown={(e) => handleResizeMouseDown(e, field.id, "ne")} />
                      <div className="resize-handle absolute -bottom-1 -left-1 h-3 w-3 bg-violet-500 rounded-sm cursor-sw-resize" onMouseDown={(e) => handleResizeMouseDown(e, field.id, "sw")} />
                      <div className="resize-handle absolute -bottom-1 -right-1 h-3 w-3 bg-violet-500 rounded-sm cursor-se-resize" onMouseDown={(e) => handleResizeMouseDown(e, field.id, "se")} />
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {selectedTool && (
            <p className="text-center text-xs text-violet-400 mt-3">
              Click on the PDF to place a <span className="font-medium capitalize">{selectedTool}</span> field
            </p>
          )}
        </div>
      </div>

      <Dialog open={!!signFieldId} onOpenChange={(open) => { if (!open) { setSignFieldId(null); setSignMode(null); setSignatureDataUrl(null); setTypedSignature("") } }}>
        <DialogContent className="max-w-lg bg-[#111827] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Capture {fields.find(f => f.id === signFieldId)?.field_type === "initials" ? "Initials" : "Signature"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              {(["draw", "type", "upload"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSignMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    signMode === mode
                      ? "bg-violet-500/20 text-violet-300"
                      : "bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  {mode === "draw" && <Pen size={14} />}
                  {mode === "type" && <Type size={14} />}
                  {mode === "upload" && <Upload size={14} />}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {signMode === "draw" && (
              <div className="space-y-2">
                <canvas
                  ref={signatureCanvasRef}
                  onMouseDown={drawStart}
                  onMouseMove={drawMove}
                  onMouseUp={drawEnd}
                  onMouseLeave={drawEnd}
                  className="w-full h-[150px] bg-white rounded-xl border border-zinc-300"
                  style={{ cursor: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='24' viewBox='0 0 24 24' fill='none' stroke='%237C3AED' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'/%3E%3C/svg%3E\") 4 20, crosshair" }}
                />
                <button
                  onClick={resetCanvas}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition"
                >
                  Reset
                </button>
              </div>
            )}

            {signMode === "type" && (
              <div className="space-y-3">
                <input
                  placeholder={`Type your ${fields.find(f => f.id === signFieldId)?.field_type === "initials" ? "initials" : "signature"}`}
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  className="w-full bg-[#0B1020] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-violet-500/50 transition"
                />
                <Button onClick={saveTypeSignature} disabled={!typedSignature} className="w-full">
                  Apply
                </Button>
              </div>
            )}

            {signMode === "upload" && (
              <div className="bg-[#0B1020] rounded-xl border border-white/10 p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadSignature}
                  className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-violet-500/20 file:text-violet-300 file:text-sm file:font-medium hover:file:bg-violet-500/30"
                />
              </div>
            )}

            {signatureDataUrl && (
              <div className="rounded-xl border border-white/10 p-4 bg-[#0B1020]">
                <img src={signatureDataUrl} alt="Preview" className="max-h-20 mx-auto" />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setSignFieldId(null); setSignMode(null); setSignatureDataUrl(null); setTypedSignature("") }}>
                Cancel
              </Button>
              <Button onClick={confirmSignature} disabled={!signatureDataUrl}>
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
