"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const RadarMetrics = ({ result }) => {
  // 📌 Format data for chart
  const data = [
    {
      metric: "Productivity",
      before: result.Pre_Avg,
      after: result.Post_Avg,
    },
    {
      metric: "Consistency",
      before: result.Const_Before,
      after: result.Const_After,
    },
    {
      metric: "Stability",
      before: result.Stability_Before,
      after: result.Stability_After,
    },
  ];

  return (
    <Card className="h-full p-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Performance Comparison (Before vs After)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              />
              <Legend />
              {/* 🟥 Before Review */}
              <Bar
                dataKey="before"
                name="Before Review"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
              {/* 🟩 After Review */}
              <Bar
                dataKey="after"
                name="After Review"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RadarMetrics;
