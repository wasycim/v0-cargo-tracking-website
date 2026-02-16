"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { ChartDataItem } from "@/components/ana-sayfa"

export default function TutarChart({ data }: { data: ChartDataItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="tarih" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
        <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: 12,
            color: "hsl(var(--foreground))",
          }}
          formatter={(val: number) => [`${val.toLocaleString("tr-TR")} TL`, "Tutar"]}
        />
        <Area
          type="monotone"
          dataKey="tutar"
          name="Tutar"
          stroke="hsl(200, 70%, 50%)"
          fill="hsl(200, 70%, 50%)"
          fillOpacity={0.15}
          strokeWidth={2}
          dot={{ r: 3, fill: "hsl(200, 70%, 50%)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
