"use client"

import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { Loader2, FileText } from "lucide-react"

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

interface PdfViewerProps {
  fileUrl: string
  className?: string
}

export default function PdfViewer({ fileUrl, className = "" }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          </div>
        }
        error={
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <FileText className="h-12 w-12 mb-2" />
            <p className="text-sm">Failed to load PDF</p>
          </div>
        }
      >
        <Page pageNumber={pageNumber} width={500} />
      </Document>
      {numPages && numPages > 1 && (
        <div className="flex items-center gap-4 mt-4 text-sm text-zinc-400">
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="disabled:opacity-30 hover:text-white transition"
          >
            Previous
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="disabled:opacity-30 hover:text-white transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
