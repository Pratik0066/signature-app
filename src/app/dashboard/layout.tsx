import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 lg:ml-72">
          <Navbar />

          <div className="p-6 pb-24">
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}