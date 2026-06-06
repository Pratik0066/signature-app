export function Testimonials() {
  return (
    <section className="py-24 container mx-auto px-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold">
          Trusted By Teams
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-16">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-[#12121A] border border-white/10 rounded-2xl p-6"
          >
            <p className="text-zinc-300">
              “This platform reduced our document
              processing time by 80%.”
            </p>

            <div className="mt-6">
              <h4 className="font-semibold">
                Sarah Johnson
              </h4>

              <p className="text-zinc-500">
                Legal Manager
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}