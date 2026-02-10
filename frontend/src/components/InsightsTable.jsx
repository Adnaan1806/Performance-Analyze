"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const InsightsTable = ({ res }) => {
  const rows = [
    { label: "Productivity", pre: res.Pre_Avg, post: res.Post_Avg },
    { label: "Stability", pre: res.Stability_Before, post: res.Stability_After },
    { label: "Consistency", pre: res.Const_Before, post: res.Const_After },
  ];

  const getTrend = (pre, post) => {
    if (post > pre) return { class: "text-green-600 font-semibold", icon: "↑", text: "Improved" };
    if (post < pre) return { class: "text-red-600 font-semibold", icon: "↓", text: "Declined" };
    return { class: "text-gray-600", icon: "→", text: "No Change" };
  };

  const improvements = rows.map(r => r.post - r.pre);
  const best = improvements.indexOf(Math.max(...improvements));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Performance Insight Summary</CardTitle>
      </CardHeader>

      <CardContent>
        <table className="w-full border-collapse text-sm rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-left font-semibold">
              <th className="p-3">Metric</th>
              <th className="p-3">Before</th>
              <th className="p-3">After</th>
              <th className="p-3">Trend</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, idx) => {
              const trend = getTrend(r.pre, r.post);

              return (
                <tr key={idx} className={`${idx === best ? "bg-green-50" : "bg-white"} border-b`}>
                  <td className="p-3 font-medium">{r.label}</td>
                  <td className="p-3">{r.pre.toFixed(3)}</td>
                  <td className="p-3">{r.post.toFixed(3)}</td>
                  <td className={`p-3 ${trend.class}`}>{trend.icon} {trend.text}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Summary Insight */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          📌 <strong>Insight:</strong> The strongest improvement is in{" "}
          <span className="font-semibold">{rows[best].label}</span>.
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsTable;
