"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

const BISGaugeCard = ({ score }) => {
  const display = Math.max(-1, Math.min(score, 1)); // clamp
  const data = [
    {
      name: "BIS",
      value: Math.abs(display),
      fill: display >= 0 ? "#00C49F" : "#FF8042",
    },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Behaviour Impact Score
        </CardTitle>
        <CardDescription>Based on pre logs & post logs</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col justify-center items-center">
        <div style={{ width: "220px", height: "220px", position: "relative" }}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="100%"
            barSize={20}
            startAngle={180}
            endAngle={0}
            data={data}
          >
            <PolarAngleAxis type="number" domain={[0, 1]} tick={false} />
            <RadialBar dataKey="value" clockWise background />
          </RadialBarChart>

          {/* Score in center */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "26px",
              fontWeight: "700",
              color: display >= 0 ? "#00C49F" : "#FF8042",
            }}
          >
            {score.toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BISGaugeCard;
