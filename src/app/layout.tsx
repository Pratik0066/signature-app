import "./globals.css"
import { Toaster } from "sonner"

export const metadata = {
  title: "SignFlow - Secure Digital Signature Platform",
  description: "Upload PDFs, request signatures, track document status, and generate legally traceable signed files.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#FFFFFF",
            },
          }}
        />
      </body>
    </html>
  )
}
