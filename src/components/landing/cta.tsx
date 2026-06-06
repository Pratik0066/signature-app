import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-12 text-center">
          <h2 className="text-5xl font-bold">
            Ready To Go Paperless?
          </h2>

          <p className="mt-4 text-white/80">
            Start signing documents today.
          </p>

          <Link
            href="/register"
            className="inline-block mt-8 px-8 py-4 bg-white text-black rounded-xl font-semibold"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </section>
  );
}