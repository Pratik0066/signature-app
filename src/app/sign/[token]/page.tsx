"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import type { Signer, SignatureField } from "@/types"
interface DocData {
  id: string
  user_id: string
  name: string
  file_url: string
  file_path: string
  status: string
  created_at: string
  updated_at: string
}
import { PenTool, Loader2, CheckCircle, Pen, Type, Upload } from "lucide-react"
import { toast } from "sonner"

type SignMode = "draw" | "type" | "upload" | null

export default function PublicSigningPage({ params }: { params: { token: string } }) {
  const { token } = params
  const [signer, setSigner] = useState<Signer | null>(null)
  const [docData, setDocData] = useState<DocData | null>(null)
  const [fields, setFields] = useState<SignatureField[]>([])
  const [loading, setLoading] = useState(true)
  const [signingField, setSigningField] = useState<string | null>(null)
  const [signMode, setSignMode] = useState<SignMode>(null)
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [typedSignature, setTypedSignature] = useState("")

  useEffect(() => {
    async function loadSigningPage() {
      const { data: signerData } = await supabase
        .from("signers")
        .select("*")
        .eq("token", token)
        .single()

      if (!signerData) {
        setLoading(false)
        return
      }

      setSigner(signerData as Signer)

      const { data: docData } = await supabase
        .from("documents")
        .select("*")
        .eq("id", signerData.document_id)
        .single()

      if (docData) setDocData(docData as DocData)

      const { data: fieldData } = await supabase
        .from("signature_fields")
        .select("*")
        .eq("document_id", signerData.document_id)
        .eq("signer_id", signerData.id)

      if (fieldData) setFields(fieldData as SignatureField[])

      if (signerData.status === "pending") {
        await supabase
          .from("signers")
          .update({ status: "viewed", viewed_at: new Date().toISOString() })
          .eq("id", signerData.id)

        await supabase.from("audit_logs").insert({
          document_id: signerData.document_id,
          signer_id: signerData.id,
          action: "document_viewed",
          details: { email: signerData.email },
        })
      }

      setLoading(false)
    }
    loadSigningPage()
  }, [token])

  function startDrawing() {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 400
    canvas.height = 150
    ctx.strokeStyle = "#7C3AED"
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }

  function drawStart(e: React.MouseEvent) {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  function drawMove(e: React.MouseEvent) {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  function drawEnd() {
    setIsDrawing(false)
    if (!canvasRef.current) return
    setSignatureDataUrl(canvasRef.current.toDataURL("image/png"))
  }

  function saveTypeSignature() {
    if (!typedSignature) return
    const canvas = window.document.createElement("canvas")
    canvas.width = 400
    canvas.height = 120
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#7C3AED"
    ctx.font = "48px 'Brush Script MT', cursive"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(typedSignature, 200, 60)
    setSignatureDataUrl(canvas.toDataURL("image/png"))
    setSignMode(null)
  }

  function handleUploadSignature(e: React.ChangeEvent<HTMLInputElement>) {
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
  }

  async function submitSignature() {
    if (!signer || !signatureDataUrl || !signingField) return

    setSubmitting(true)

    const field = fields.find((f) => f.id === signingField)
    if (!field) return

    const filePath = `signatures/${signer.id}/${Date.now()}.png`

    const blob = await (await fetch(signatureDataUrl)).blob()
    const { error: uploadError } = await supabase.storage
      .from("signatures")
      .upload(filePath, blob)

    if (uploadError) {
      toast.error("Failed to upload signature")
      setSubmitting(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from("signatures")
      .getPublicUrl(filePath)

    await supabase.from("signatures").insert({
      signer_id: signer.id,
      document_id: signer.document_id,
      field_id: signingField,
      image_url: publicUrl,
      type: signMode,
    })

    await supabase.from("audit_logs").insert({
      document_id: signer.document_id,
      signer_id: signer.id,
      action: "signature_added",
      details: { field_type: field.field_type },
    })

    setSignatureDataUrl(null)
    setSigningField(null)
    setSignMode(null)

    const remainingFields = fields.filter((f) => f.id !== signingField)
    if (remainingFields.length === 0) {
      await supabase
        .from("signers")
        .update({ status: "signed", signed_at: new Date().toISOString() })
        .eq("id", signer.id)

      await supabase.from("audit_logs").insert({
        document_id: signer.document_id,
        signer_id: signer.id,
        action: "document_signed",
        details: { email: signer.email },
      })

      setDone(true)
      toast.success("Document signed successfully!")
    } else {
      setFields(remainingFields)
      toast.success("Signature saved!")
    }

    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (!signer || !docData) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6">
        <div className="glass-card rounded-3xl p-12 max-w-md w-full text-center">
          <PenTool className="h-16 w-16 text-zinc-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Invalid Link</h2>
          <p className="text-zinc-400">This signing link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6">
        <div className="glass-card rounded-3xl p-12 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Document Signed!</h2>
          <p className="text-zinc-400">Thank you for signing. You can close this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050816]">
      <header className="border-b border-white/10 h-16 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center">
            <PenTool className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg">SignFlow</span>
        </div>
        <p className="ml-auto text-sm text-zinc-400">
          Signing as <strong className="text-white">{signer.email}</strong>
        </p>
      </header>

      <div className="max-w-4xl mx-auto p-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="aspect-[3/4] flex items-center justify-center text-zinc-400 p-8">
              <div className="text-center">
                <p className="text-lg font-medium text-zinc-600 mb-2">{docData.name}</p>
                <p className="text-sm">PDF preview would render here</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111827] rounded-2xl border border-white/10 p-6">
            <h3 className="font-semibold mb-4">Required Fields</h3>
            {fields.map((field) => (
              <div key={field.id}>
                {signingField === field.id && signMode ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {(["draw", "type", "upload"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setSignMode(mode)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                            signMode === mode
                              ? "bg-violet-500/10 text-violet-400"
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
                      <div>
                        <canvas
                          ref={canvasRef}
                          onMouseDown={drawStart}
                          onMouseMove={drawMove}
                          onMouseUp={drawEnd}
                          onMouseLeave={drawEnd}
                          className="w-full h-[150px] bg-[#0B1020] rounded-xl border border-white/10 cursor-crosshair"
                          onLoad={startDrawing}
                        />
                      </div>
                    )}

                    {signMode === "type" && (
                      <div className="space-y-3">
                        <input
                          placeholder="Type your signature"
                          value={typedSignature}
                          onChange={(e) => setTypedSignature(e.target.value)}
                          className="w-full bg-[#0B1020] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-violet-500/50 transition"
                        />
                        <button
                          onClick={saveTypeSignature}
                          disabled={!typedSignature}
                          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 py-2 rounded-xl text-sm font-medium transition"
                        >
                          Apply
                        </button>
                      </div>
                    )}

                    {signMode === "upload" && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadSignature}
                        className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-violet-500/10 file:text-violet-400 file:text-sm file:font-medium hover:file:bg-violet-500/20"
                      />
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => { setSigningField(field.id); setSignMode("draw") }}
                    className="w-full p-4 rounded-xl border border-dashed border-violet-500/30 hover:border-violet-500/60 bg-violet-500/5 hover:bg-violet-500/10 transition text-center"
                  >
                    <PenTool size={20} className="mx-auto text-violet-500 mb-2" />
                    <p className="text-sm font-medium capitalize">{field.field_type}</p>
                    <p className="text-xs text-zinc-500 mt-1">{field.label}</p>
                  </button>
                )}
              </div>
            ))}
          </div>

          {signatureDataUrl && signingField && (
            <button
              onClick={submitSignature}
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              {submitting ? "Submitting..." : "Confirm & Sign"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
