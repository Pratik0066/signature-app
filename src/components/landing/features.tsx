import {
  ShieldCheck,
  FileText,
  Users,
  Clock,
} from "lucide-react";

const features = [
  {
    title: "Secure Storage",
    description:
      "Enterprise-grade document security.",
    icon: ShieldCheck,
  },
  {
    title: "PDF Signing",
    description:
      "Drag & drop signature fields.",
    icon: FileText,
  },
  {
    title: "Multi Signers",
    description:
      "Invite unlimited signers.",
    icon: Users,
  },
  {
    title: "Audit Trails",
    description:
      "Track every action in real-time.",
    icon: Clock,
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="py-24 container mx-auto px-6"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold">
          Everything You Need
        </h2>

        <p className="mt-4 text-zinc-400">
          Powerful tools for digital agreements.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="p-6 bg-[#12121A] rounded-2xl border border-white/10"
            >
              <Icon className="text-violet-500 mb-4" />

              <h3 className="font-semibold text-lg">
                {feature.title}
              </h3>

              <p className="text-zinc-400 mt-2">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}