import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative py-24 lg:py-36">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 blur-3xl" />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <span className="px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400">
            Enterprise Document Signing
          </span>

          <h1 className="mt-8 text-5xl md:text-7xl font-bold leading-tight">
            Sign Documents
            <span className="block text-violet-500">
              Faster Than Ever
            </span>
          </h1>

          <p className="mt-8 text-xl text-zinc-400 max-w-2xl mx-auto">
            Upload PDFs, request signatures,
            track document status, and generate
            legally traceable signed files.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-violet-600 rounded-xl font-medium hover:bg-violet-700 transition"
            >
              Start Free Trial
            </Link>

            <Link
              href="/dashboard"
              className="px-8 py-4 border border-white/10 rounded-xl"
            >
              Live Demo
            </Link>
          </div>
        </div>

        <div className="mt-20">
          <div className="rounded-3xl overflow-hidden border border-white/10 bg-[#12121A] p-4 shadow-2xl">
            <Image
              src="/images/dashboard-preview.png"
              alt="Dashboard"
              width={1400}
              height={900}
              className="rounded-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}