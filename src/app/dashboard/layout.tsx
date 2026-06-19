import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ExternalLink } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-72 min-h-screen">
          <Navbar />
          <div className="p-6 pb-24 max-w-7xl mx-auto">
            {children}
          </div>
          <footer className="border-t border-white/5 py-4 px-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-zinc-600">
              <p>&copy; {new Date().getFullYear()} SignFlow</p>
              <a
                href="https://github.com/Pratik0066/signature-app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-zinc-400 transition"
              >
                <ExternalLink size={14} />
                GitHub
              </a>
            </div>
          </footer>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
