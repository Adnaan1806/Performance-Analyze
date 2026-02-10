import { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

const API = axios.create({ baseURL: "http://localhost:4000/api" });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

const ManagerBISAnalysis = ({ onAnalysisComplete }) => {
  const [employee, setEmployee] = useState("");
  const [employees, setEmployees] = useState([]);
  const [preLogs, setPreLogs] = useState([]);
  const [postLogs, setPostLogs] = useState([]);

  // Date range states
  const [preStart, setPreStart] = useState("");
  const [preEnd, setPreEnd] = useState("");
  const [postStart, setPostStart] = useState("");
  const [postEnd, setPostEnd] = useState("");

  // Add state for expansion
  const [showPreLogs, setShowPreLogs] = useState(false);
  const [showPostLogs, setShowPostLogs] = useState(false);

  // Loading states
  const [loadingPre, setLoadingPre] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [analyzingBIS, setAnalyzingBIS] = useState(false);

  // fetch all employees on load
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await API.get("/manager/employees");
        setEmployees(res.data.employees);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const loadPreLogs = async () => {
    if (!employee || !preStart || !preEnd) {
      alert("Please select an employee and both date ranges");
      return;
    }
    setLoadingPre(true);
    try {
      const res = await API.get(
        `/manager/logs/filter?employeeId=${employee}&start=${preStart}&end=${preEnd}`
      );
      setPreLogs(res.data.logs);
      setShowPreLogs(true);
    } catch (error) {
      console.error("Error loading pre-logs:", error);
      alert("Failed to load pre-review logs");
    } finally {
      setLoadingPre(false);
    }
  };

  const loadPostLogs = async () => {
    if (!employee || !postStart || !postEnd) {
      alert("Please select an employee and both date ranges");
      return;
    }
    setLoadingPost(true);
    try {
      const res = await API.get(
        `/manager/logs/filter?employeeId=${employee}&start=${postStart}&end=${postEnd}`
      );
      setPostLogs(res.data.logs);
      setShowPostLogs(true);
    } catch (error) {
      console.error("Error loading post-logs:", error);
      alert("Failed to load post-review logs");
    } finally {
      setLoadingPost(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSelectedEmployeeName = () => {
    const selected = employees.find((emp) => emp._id === employee);
    return selected ? selected.name : "Select an employee";
  };

  const canRunAnalysis = preLogs.length > 0 && postLogs.length > 0;

  // Combine tasks, learnings, challenges into one log string
  const formatLogsForBIS = (logs) => {
    return logs.map(
      (log) => `${log.tasks}. ${log.learnings}. ${log.challenges}.`
    );
  };

  const runBISAnalysis = async () => {
    if (!canRunAnalysis) return;

    setAnalyzingBIS(true);

    // format logs before sending
    const formattedPre = formatLogsForBIS(preLogs);
    const formattedPost = formatLogsForBIS(postLogs);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pre_logs: formattedPre,
          post_logs: formattedPost,
        }),
      });

      const data = await response.json();

      // Call the callback function to switch tabs and pass data
      if (onAnalysisComplete) {
        onAnalysisComplete({
          bisResult: data.result,
          employeeName: getSelectedEmployeeName(),
          employeeId: employee,
          dateRanges: {
            preStart,
            preEnd,
            postStart,
            postEnd,
          },
        });
      }
    } catch (error) {
      console.error("❌ BIS request failed", error);
      alert("Failed to run BIS analysis. Please try again.");
    } finally {
      setAnalyzingBIS(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                BIS Performance Analysis
              </h1>
              <p className="text-gray-600 mt-1">
                Compare employee performance before and after review periods
              </p>
            </div>
          </div>

          {/* Employee Selection */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Select Employee
            </label>
            <div className="relative">
              <select
                value={employee}
                onChange={(e) => {
                  setEmployee(e.target.value);
                  setPreLogs([]);
                  setPostLogs([]);
                }}
                className="w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer text-gray-900 font-medium"
              >
                <option value="">Choose an employee to analyze...</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {employee && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Analyzing:</strong> {getSelectedEmployeeName()}
              </p>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* PRE-REVIEW SECTION */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Pre-Review Period
                </h2>
              </div>
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                BEFORE
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Select the date range before the performance review
            </p>

            {/* Date Range Selection */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={preStart}
                    onChange={(e) => setPreStart(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={preEnd}
                    onChange={(e) => setPreEnd(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={loadPreLogs}
              disabled={!employee || !preStart || !preEnd || loadingPre}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {loadingPre ? "Loading..." : "Load Pre-Review Logs"}
            </button>

            {/* Logs Summary Card */}
            {preLogs.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowPreLogs(!showPreLogs)}
                  className="w-full bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 px-4 py-3 rounded-lg transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">
                      {preLogs.length} logs loaded
                    </span>
                  </div>
                  {showPreLogs ? (
                    <ChevronUp className="w-5 h-5 text-purple-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-purple-600" />
                  )}
                </button>

                {/* Expandable Logs */}
                {showPreLogs && (
                  <div className="mt-3 border-2 border-purple-100 rounded-lg bg-white max-h-96 overflow-y-auto">
                    {preLogs.map((log, idx) => (
                      <div
                        key={log._id}
                        className={`p-4 ${
                          idx !== preLogs.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <strong className="text-sm text-gray-900">
                            {formatDate(log.logDate)}
                          </strong>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700">{log.tasks}</p>
                          </div>
                          <div className="flex gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700">{log.learnings}</p>
                          </div>
                          <div className="flex gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700">{log.challenges}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* POST-REVIEW SECTION */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Post-Review Period
                </h2>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                AFTER
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Select the date range after the performance review
            </p>

            {/* Date Range Selection */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={postStart}
                    onChange={(e) => setPostStart(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={postEnd}
                    onChange={(e) => setPostEnd(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={loadPostLogs}
              disabled={!employee || !postStart || !postEnd || loadingPost}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {loadingPost ? "Loading..." : "Load Post-Review Logs"}
            </button>

            {/* Logs Summary Card */}
            {postLogs.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowPostLogs(!showPostLogs)}
                  className="w-full bg-green-50 hover:bg-green-100 border-2 border-green-200 px-4 py-3 rounded-lg transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">
                      {postLogs.length} logs loaded
                    </span>
                  </div>
                  {showPostLogs ? (
                    <ChevronUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-green-600" />
                  )}
                </button>

                {/* Expandable Logs */}
                {showPostLogs && (
                  <div className="mt-3 border-2 border-green-100 rounded-lg bg-white max-h-96 overflow-y-auto">
                    {postLogs.map((log, idx) => (
                      <div
                        key={log._id}
                        className={`p-4 ${
                          idx !== postLogs.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <strong className="text-sm text-gray-900">
                            {formatDate(log.logDate)}
                          </strong>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700">{log.tasks}</p>
                          </div>
                          <div className="flex gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700">{log.learnings}</p>
                          </div>
                          <div className="flex gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700">{log.challenges}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Run Analysis Button */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          {!canRunAnalysis && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className="text-sm text-amber-800">
                  <strong>Action Required:</strong> Load both pre-review and
                  post-review logs to run the analysis
                </p>
              </div>
            </div>
          )}

          <button
            disabled={!canRunAnalysis || analyzingBIS}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            onClick={runBISAnalysis}
          >
            {analyzingBIS ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Analyzing Performance...
              </>
            ) : (
              <>
                <TrendingUp className="w-6 h-6" />
                Run BIS Performance Analysis
              </>
            )}
          </button>

          {canRunAnalysis && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-600 font-semibold">
                  PRE-REVIEW
                </p>
                <p className="text-2xl font-bold text-purple-700">
                  {preLogs.length}
                </p>
                <p className="text-xs text-purple-600">logs loaded</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-600 font-semibold">
                  POST-REVIEW
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {postLogs.length}
                </p>
                <p className="text-xs text-green-600">logs loaded</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerBISAnalysis;