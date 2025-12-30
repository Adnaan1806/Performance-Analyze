import { useEffect, useState } from "react";
import axios from "axios";
import {
  Clock,
  Search,
  Calendar,
  Pencil,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  User,
  FileText,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

const DailyLogHistory = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const [editingLog, setEditingLog] = useState(null);
  const [tasks, setTasks] = useState("");
  const [learnings, setLearnings] = useState("");
  const [challenges, setChallenges] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [alert, setAlert] = useState({
    show: false,
    type: "",
    message: "",
    title: "",
  });

  const API = axios.create({ baseURL: "http://localhost:4000/api" });
  API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

  const getLogs = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/employee/my-logs");
      const sorted = res.data.logs.sort(
        (a, b) => new Date(b.logDate) - new Date(a.logDate)
      );
      setLogs(sorted);
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        title: "Error",
        message: "Failed to load logs",
      });
      setTimeout(
        () => setAlert({ show: false, type: "", message: "", title: "" }),
        5000
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getLogs();
  }, []);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const isToday = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const openEdit = (log) => {
    setEditingLog(log);
    setTasks(log.tasks);
    setLearnings(log.learnings);
    setChallenges(log.challenges);
  };

  const saveEdit = async () => {
    setIsSaving(true);
    try {
      await API.put(`/employee/daily-log/${editingLog._id}`, {
        tasks,
        learnings,
        challenges,
        status: "pending",
      });

      setAlert({
        show: true,
        type: "success",
        title: "Updated!",
        message: "Your log was updated and moved back to pending review.",
      });
      setTimeout(
        () => setAlert({ show: false, type: "", message: "", title: "" }),
        5000
      );
      setEditingLog(null);
      getLogs();
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        title: "Error",
        message: "Could not update log.",
      });
      setTimeout(
        () => setAlert({ show: false, type: "", message: "", title: "" }),
        5000
      );
    }
    setIsSaving(false);
  };

  const filteredLogs = logs.filter((log) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      log.tasks.toLowerCase().includes(s) ||
      log.learnings.toLowerCase().includes(s) ||
      log.challenges.toLowerCase().includes(s) ||
      formatDate(log.logDate).toLowerCase().includes(s);

    const matchesStatus = filterStatus === "all" || log.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case "approved":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          border: "border-green-200",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Approved",
        };
      case "rejected":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-200",
          icon: <XCircle className="w-4 h-4" />,
          label: "Rejected",
        };
      default:
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-200",
          icon: <AlertCircle className="w-4 h-4" />,
          label: "Pending",
        };
    }
  };

  const stats = {
    total: logs.length,
    approved: logs.filter((l) => l.status === "approved").length,
    pending: logs.filter((l) => l.status === "pending").length,
    rejected: logs.filter((l) => l.status === "rejected").length,
  };

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading your performance history...</p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Performance History
            </h2>
            <p className="text-sm text-gray-600">
              View and manage your daily performance logs
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-semibold text-blue-700 uppercase">
                Total
              </p>
            </div>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-xs font-semibold text-green-700 uppercase">
                Approved
              </p>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {stats.approved}
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-xs font-semibold text-yellow-700 uppercase">
                Pending
              </p>
            </div>
            <p className="text-2xl font-bold text-yellow-900">
              {stats.pending}
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <p className="text-xs font-semibold text-red-700 uppercase">
                Rejected
              </p>
            </div>
            <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder="Search entries by work, learning, challenges, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === "all"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("approved")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === "approved"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === "pending"
                  ? "bg-yellow-600 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus("rejected")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === "rejected"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {logs.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No logs yet
          </h3>
          <p className="text-gray-500">
            Get started by submitting your first daily log.
          </p>
        </div>
      )}

      {logs.length > 0 && filteredLogs.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Logs */}
      <div className="space-y-4">
        {filteredLogs.map((log) => {
          const status = getStatusConfig(log.status);
          return (
            <div
              key={log._id}
              className={`bg-white border-2 ${status.border} rounded-xl overflow-hidden hover:shadow-lg transition-shadow`}
            >
              {/* Header Row */}
              <div
                className={`${status.bg} px-6 py-4 border-b-2 ${status.border} flex flex-col md:flex-row justify-between items-start md:items-center gap-3`}
              >
                {/* Date */}
                <div className="flex items-center gap-3">
                  <Calendar className={`w-5 h-5 ${status.text}`} />
                  <div>
                    <h3 className={`font-bold ${status.text}`}>
                      {formatDate(log.logDate)}
                    </h3>
                    {isToday(log.logDate) && (
                      <span className="text-xs bg-white px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                        Today
                      </span>
                    )}
                  </div>
                </div>

                {/* Status + Edit */}
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-white border-2 ${status.border} ${status.text}`}
                  >
                    {status.icon} {status.label}
                  </span>

                  {(log.status === "pending" || log.status === "rejected") && (
                    <button
                      onClick={() => openEdit(log)}
                      className={`flex items-center gap-2 px-4 py-2 bg-white border-2 ${status.border} ${status.text} rounded-lg font-medium hover:bg-opacity-80 transition-colors`}
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Log Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h4 className="font-bold text-green-700 text-sm uppercase">
                        Work Accomplished
                      </h4>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {log.tasks}
                    </p>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h4 className="font-bold text-blue-700 text-sm uppercase">
                        New Learnings
                      </h4>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {log.learnings}
                    </p>
                  </div>

                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <h4 className="font-bold text-orange-700 text-sm uppercase">
                        Challenges
                      </h4>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {log.challenges}
                    </p>
                  </div>
                </div>

                {/* Manager Feedback Section */}
                {(log.status === "approved" || log.status === "rejected") && (
                  <div
                    className={`bg-gradient-to-r ${
                      log.status === "approved"
                        ? "from-green-50 to-blue-50"
                        : "from-red-50 to-orange-50"
                    } border-2 ${
                      log.status === "approved"
                        ? "border-green-200"
                        : "border-red-200"
                    } rounded-lg p-5`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare
                        className={`w-5 h-5 ${
                          log.status === "approved"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                      <h4
                        className={`font-bold ${
                          log.status === "approved"
                            ? "text-green-900"
                            : "text-red-900"
                        }`}
                      >
                        Manager Review Feedback
                      </h4>
                    </div>

                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-3">
                      <p className="text-gray-800 leading-relaxed">
                        {log.managerFeedback || "No feedback provided."}
                      </p>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>
                          <strong>Reviewed by:</strong>{" "}
                          {log.approvedBy?.name || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>
                          <strong>Review Date:</strong>{" "}
                          {log.approvedAt
                            ? new Date(log.approvedAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl animate-scale-in">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Pencil className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Daily Log
                  </h2>
                  <p className="text-sm text-gray-600">
                    {formatDate(editingLog.logDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingLog(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Today's Work Accomplishments
                </label>
                <Textarea
                  value={tasks}
                  onChange={(e) => setTasks(e.target.value)}
                  placeholder="Update your work accomplishments..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  New Learning & Skills
                </label>
                <Textarea
                  value={learnings}
                  onChange={(e) => setLearnings(e.target.value)}
                  placeholder="Update your learnings..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Challenges & Difficulties
                </label>
                <Textarea
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="Update your challenges..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> After updating, your log will be
                    marked as <strong>pending</strong> and require manager
                    approval again.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setEditingLog(null)}
                disabled={isSaving}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={isSaving || !tasks}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {alert.show && (
        <div className="fixed top-4 right-4 w-96 z-50 animate-slide-in-right">
          <Alert
            variant={alert.type === "error" ? "destructive" : "default"}
            className="shadow-2xl border-2"
          >
            {alert.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <AlertTitle className="font-bold">{alert.title}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DailyLogHistory;
