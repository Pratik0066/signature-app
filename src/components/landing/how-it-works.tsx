export function HowItWorks() {
  const steps = [
    "Upload your PDF",
    "Add signature fields",
    "Invite signers",
    "Download signed document",
  ];

  return (
    <section
      id="workflow"
      className="py-24 bg-[#12121A]"
    >
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center">
          How It Works
        </h2>

        <div className="mt-16 grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step}
              className="text-center"
            >
              <div className="h-16 w-16 rounded-full bg-violet-600 flex items-center justify-center mx-auto text-xl font-bold">
                {index + 1}
              </div>

              <p className="mt-6 text-lg">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}