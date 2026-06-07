"use client"

import { useState, useCallback } from "react"

export function useSignature() {
  const [signatureImage, setSignatureImage] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const saveDrawSignature = useCallback((dataUrl: string) => {
    setSignatureImage(dataUrl)
    localStorage.setItem("signflow_signature", dataUrl)
  }, [])

  const saveTypeSignature = useCallback((text: string) => {
    const canvas = document.createElement("canvas")
    canvas.width = 400
    canvas.height = 120
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "transparent"
    ctx.fillRect(0, 0, 400, 120)
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "48px 'Brush Script MT', cursive"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text, 200, 60)

    const dataUrl = canvas.toDataURL("image/png")
    setSignatureImage(dataUrl)
    localStorage.setItem("signflow_signature", dataUrl)
  }, [])

  const saveUploadSignature = useCallback((dataUrl: string) => {
    setSignatureImage(dataUrl)
    localStorage.setItem("signflow_signature", dataUrl)
  }, [])

  const clearSignature = useCallback(() => {
    setSignatureImage(null)
    localStorage.removeItem("signflow_signature")
  }, [])

  const loadSavedSignature = useCallback(() => {
    const saved = localStorage.getItem("signflow_signature")
    if (saved) setSignatureImage(saved)
    return saved
  }, [])

  return {
    signatureImage,
    isDrawing,
    setIsDrawing,
    saveDrawSignature,
    saveTypeSignature,
    saveUploadSignature,
    clearSignature,
    loadSavedSignature,
  }
}
