"use client";

import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ProductivityChart = ({ pre, post }) => {
  // Sample data - replace with your actual data
  const data = [
    { phase: "Before Review", productivity: pre },
    { phase: "After Review", productivity: post },
  ];

  const trend = (((post - pre) / pre) * 100).toFixed(1);
  const isPositive = trend >= 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Productivity Trend</CardTitle>
        <CardDescription>Last 6 months performance</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="phase"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#666", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#666", fontSize: 12 }}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "#666", fontSize: 12 }}
                itemStyle={{ color: "#2563eb" }}
              />
              <Line
                type="monotone"
                dataKey="productivity"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <div className="px-6 pb-4 pt-0">
        <div
          className={`flex items-center ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">
            {isPositive ? "+" : ""}
            {trend}% {isPositive ? "increase" : "decrease"} from last period
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ProductivityChart;
