import { ReactNode } from "react";

interface Props {
  title: string;
  value: string;
  icon: ReactNode;
}

export function StatsCard({
  title,
  value,
  icon,
}: Props) {
  return (
    <div
      className="
        bg-[#12121A]
        border
        border-white/10
        rounded-2xl
        p-5
      "
    >
      <div className="flex justify-between">
        <div>
          <p className="text-zinc-400 text-sm">
            {title}
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {value}
          </h3>
        </div>

        {icon}
      </div>
    </div>
  );
}