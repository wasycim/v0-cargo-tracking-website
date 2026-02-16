"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { ChartDataItem } from "@/components/ana-sayfa"

export default function AdetChart({ data }: { data: ChartDataItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="tarih" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
        <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: 12,
            color: "hsl(var(--foreground))",
          }}
          formatter={(val: number) => [val, "Adet"]}
        />
        <Line
          type="monotone"
          dataKey="adet"
          name="Adet"
          stroke="hsl(200, 70%, 60%)"
          strokeWidth={2}
          dot={{ r: 3, fill: "hsl(200, 70%, 60%)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
