"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Upload, File, X, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function UploadPage() {
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)

  const validateFile = (f: File) => {
    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are allowed")
      return false
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB")
      return false
    }
    return true
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files[0]
    if (f && validateFile(f)) setFile(f)
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && validateFile(f)) setFile(f)
  }

  async function handleUpload() {
    if (!file) return

    setUploading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Please login again")
      return
    }

    const filePath = `${user.id}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message)
      setUploading(false)
      return
    }

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

    if (dbError) {
      toast.error("Database error: " + dbError.message)
      setUploading(false)
      return
    }

    setDone(true)
    toast.success("Document uploaded successfully!")
    setUploading(false)

    setTimeout(() => router.push("/dashboard/documents"), 1500)
  }

  if (done) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Upload Document</h1>
        <div className="bg-[#111827] rounded-2xl border border-white/10 p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Upload Complete!</h2>
          <p className="text-zinc-400 mb-6">{file?.name} has been uploaded successfully.</p>
          <button
            onClick={() => router.push("/dashboard/documents")}
            className="bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-xl font-medium transition"
          >
            View Documents
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Document</h1>
      <p className="text-zinc-400">Upload a PDF document to get started with signatures</p>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition ${
          dragActive
            ? "border-violet-500 bg-violet-500/5"
            : file
            ? "border-green-500/50 bg-green-500/5"
            : "border-white/10 hover:border-white/20 bg-[#111827]"
        }`}
      >
        {!file ? (
          <div>
            <div className="h-16 w-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-6">
              <Upload className="h-8 w-8 text-violet-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Drop your PDF here</h3>
            <p className="text-zinc-500 mb-6">or click to browse files (max 10MB)</p>
            <label className="inline-block bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-xl font-medium cursor-pointer transition">
              Choose File
              <input type="file" accept=".pdf" onChange={handleFileInput} className="hidden" />
            </label>
          </div>
        ) : (
          <div>
            <div className="h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <File className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{file.name}</h3>
            <p className="text-zinc-500 mb-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setFile(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition"
              >
                <X size={16} />
                Remove
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 px-6 py-2.5 rounded-xl font-medium transition"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? "Uploading..." : "Upload Document"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#111827] rounded-2xl border border-white/10 p-6">
        <h3 className="font-semibold mb-4">Requirements</h3>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            PDF format only
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Maximum file size: 10MB
          </li>
          <li className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Maximum 100 pages per document
          </li>
        </ul>
      </div>
    </div>
  )
}
