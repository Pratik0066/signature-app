"use client";

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", signed: 10 },
  { month: "Feb", signed: 25 },
  { month: "Mar", signed: 45 },
  { month: "Apr", signed: 70 },
  { month: "May", signed: 110 },
];

export function AnalyticsChart() {
  return (
    <div className="bg-[#12121A] rounded-2xl p-5 border border-white/10">
      <h3 className="font-semibold mb-5">
        Signature Growth
      </h3>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="month" />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="signed"
              stroke="#7C3AED"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}