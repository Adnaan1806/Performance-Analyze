import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2Icon, AlertCircleIcon, Send, Edit } from "lucide-react";

const DailyLog = ({ onSubmitSuccess }) => {
  const [tasks, setTasks] = useState("");
  const [learnings, setLearnings] = useState("");
  const [challenges, setChallenges] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    type: "",
    message: "",
    title: "",
  });

  const submitDailyLog = async (logData) => {
    const token = localStorage.getItem("token");

    return axios.post("http://localhost:4000/api/employee/daily-log", logData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const handleSubmit = async () => {
    setLoading(true);

    const logData = {
      tasks,
      learnings,
      challenges,
      logDate: new Date().toISOString().split("T")[0],
    };

    try {
      await submitDailyLog(logData);

      setAlert({
        show: true,
        type: "success",
        title: "Success!",
        message: "Your daily log has been submitted successfully.",
      });

      setTasks("");
      setLearnings("");
      setChallenges("");

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      setTimeout(() => setAlert({ ...alert, show: false }), 5000);
    } catch (err) {
      if (err.response?.status === 400) {
        setAlert({
          show: true,
          type: "error",
          title: "Error",
          message: "You have already submitted your log for today.",
        });
      } else {
        setAlert({
          show: true,
          type: "error",
          title: "Error",
          message: err.response?.data?.message || "Failed to submit daily log.",
        });
      }
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {alert.show && (
        <div className="fixed top-4 right-4 w-96 z-50">
          <Alert variant={alert.type === "error" ? "destructive" : "default"}>
            {alert.type === "success" ? (
              <CheckCircle2Icon className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircleIcon className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="text mb-8">
        <h2 className="text-2xl flex items-center gap-2 font-semibold text-gray-900 mb-2">
          <Edit className="w-6 h-6 text-blue-600" /> Daily Performance Entry
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          Record your daily work progress, learnings, and challenges
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-md font-medium text-gray-900 mb-2">
            Today's Work Accomplishments
          </label>
          <Textarea
            placeholder="Describe what you accomplished today, key tasks completed, projects advanced..."
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-md font-medium text-gray-900 mb-2">
            New Learning & Skills
          </label>
          <Textarea
            placeholder="What new skills, knowledge, or insights did you gain today?"
            value={learnings}
            onChange={(e) => setLearnings(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-md font-medium text-gray-900 mb-2">
            Challenges & Difficulties
          </label>
          <Textarea
            placeholder="What obstacles did you face? What support or resources do you need?"
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !tasks}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium text-base transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          {loading ? "Submitting..." : "Submit Daily Entry"}
        </Button>
      </div>
    </div>
  );
};

export default DailyLog;
