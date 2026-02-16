import { useEffect, useState } from "react";
import axios from "axios";
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp } from "lucide-react";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

const ML_API = "http://localhost:8000";

const COLORS = ["#22c55e", "#facc15", "#ef4444"];

export default function EmployeeInsights() {
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await API.get("/employee/my-logs");
      const approved = res.data.logs.filter((l) => l.status === "approved");
      const sorted = approved.sort(
        (a, b) => new Date(a.logDate) - new Date(b.logDate),
      );
      setLogs(sorted);
      await scoreLogs(sorted);
    } catch (err) {
      console.error("Failed to load logs", err);
    } finally {
      setLoading(false);
    }
  };

  const scoreLogs = async (logsList) => {
    const results = [];

    for (let log of logsList) {
      const combinedText = `${log.tasks}. ${log.learnings}. ${log.challenges}.`;

      try {
        const res = await axios.post(`${ML_API}/score-log`, {
          log_text: combinedText,
        });

        results.push({
          date: new Date(log.logDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          fullDate: new Date(log.logDate).toLocaleDateString(),
          score: res.data.score,
          label:
            res.data.label === 1
              ? "Good"
              : res.data.label === 0
                ? "Neutral"
                : "Bad",
          rawLabel: res.data.label,
        });
      } catch (err) {
        console.error("Scoring failed", err);
      }
    }

    setChartData(results);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg">
          <p className="font-thin text-gray-600">{data.fullDate}</p>
          {/* <p className="text-sm mt-1">
            Score: <span className="font-bold text-blue-600">{data.score.toFixed(2)}</span>
          </p>
          <p className="text-sm">
            Status:{" "}
            <span
              className={`font-semibold ${
                data.label === "Good"
                  ? "text-green-600"
                  : data.label === "Neutral"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {data.label}
            </span>
          </p> */}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const color =
      payload.label === "Good"
        ? "#22c55e"
        : payload.label === "Neutral"
          ? "#facc15"
          : "#ef4444";

    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={color}
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 mx-auto">
      {/* HEADER */}
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <TrendingUp className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Daily Productivity
          </h2>
          <p className="text-sm text-gray-600">
            View your daily Productivity Insights
          </p>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-xl">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={<CustomDot />}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
