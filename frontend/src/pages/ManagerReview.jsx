import { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API = axios.create({ baseURL: "http://localhost:4000/api" });
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

const ManagerReview = () => {
  const [pendingLogs, setPendingLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [feedback, setFeedback] = useState({});
  const [alert, setAlert] = useState({
    show: false,
    type: "",
    message: "",
    title: "",
  });

  const fetchEmployees = async () => {
    const res = await API.get("/manager/employees");
    setEmployees(res.data.employees);
  };

  const fetchLogs = async () => {
    const url =
      selectedEmployee === "all"
        ? "/manager/pending-logs"
        : `/manager/pending-logs?employeeId=${selectedEmployee}`;

    const res = await API.get(url);
    setPendingLogs(res.data.logs);
  };

  useEffect(() => {
    fetchEmployees();
    fetchLogs();
  }, [selectedEmployee]);

  const handleAction = async (id, action) => {
    try {
      const endpoint =
        action === "approve"
          ? `/manager/approve/${id}`
          : `/manager/reject/${id}`;

      await API.put(endpoint, { managerFeedback: feedback[id] || "" });

      setAlert({
        show: true,
        type: "success",
        title: "Success!",
        message: `Log ${
          action === "approve" ? "approved" : "rejected"
        } successfully.`,
      });

      await Promise.all([fetchLogs()]);

      setTimeout(() => setAlert({ ...alert, show: false }), 3500);
      fetchLogs();
    } catch (error) {
      console.error("Action failed with error:", error); // Log the full error
      console.error("Error response data:", error.response?.data);
      setAlert({
        show: true,
        type: "error",
        title: "Error",
        message: error.response?.data?.message,
      });
      setTimeout(() => setAlert({ ...alert, show: false }), 3500);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      {alert.show && (
        <div className="fixed top-4 right-4 w-96 z-50">
          <Alert variant={alert.type === "error" ? "destructive" : "default"}>
            {alert.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium flex items-center gap-2">
          Pending Reviews
          <span className="text-sm bg-yellow-200 text-yellow-800 px-2 py-1 rounded-md">
            {pendingLogs.length}
          </span>
        </h2>

        <div className="flex gap-2 items-center">
          <Filter className="text-gray-500 w-5 h-5" />
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Employees</option>

            {employees && employees.length > 0 ? (
              employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))
            ) : (
              <option disabled>No employees found</option>
            )}
          </select>
        </div>
      </div>

      {pendingLogs.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          No logs waiting for review.
        </p>
      )}

      <div className="space-y-6">
        {pendingLogs.map((log) => (
          <div
            key={log._id}
            className="border rounded-xl p-5 bg-gray-50 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                <p className="font-medium">{log.userId?.name}</p>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <p className="font-medium">
                  {new Date(log.logDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-green-700 mb-1">
                  Work Accomplished
                </h4>
                <p className="text-gray-700 whitespace-pre-line">{log.tasks}</p>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-1">Learnings</h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {log.learnings}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-orange-700 mb-1">Challenges</h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {log.challenges}
                </p>
              </div>
            </div>

            <textarea
              className="w-full border rounded-lg p-3 text-sm"
              placeholder="Manager feedback..."
              value={feedback[log._id] || ""}
              onChange={(e) =>
                setFeedback({ ...feedback, [log._id]: e.target.value })
              }
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleAction(log._id, "approve")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => handleAction(log._id, "reject")}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerReview;
