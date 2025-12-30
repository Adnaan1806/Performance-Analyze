import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lightbulb, AlertTriangle, Clock1 } from "lucide-react";
import { PlusCircle, RefreshCw, BarChart2, Clock } from "lucide-react";
import DailyLog from "./DailyLog";
import DailyLogHistory from "./DailyLogHistory";

const EmployeeDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("daily");
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const user = localStorage.getItem("user");
  const parsedUser = JSON.parse(user);
  const userName = parsedUser.name;

  const tabs = [
    { id: "daily", label: "Daily Entry", icon: <PlusCircle /> },
    { id: "history", label: "History", icon: <Clock /> },
    { id: "insights", label: "Insights", icon: <Lightbulb />, disabled: false },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart2 />,
      disabled: false,
    },
  ];

  return (
    <div className="min-h-screen">
      
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              <span className="text-pink-600">Employee Performance</span>{" "}
              <span className="text-gray-900">Tracker</span>
            </h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-4xl font-medium">
            Hello, <span className="text-pink-600">{parsedUser.name}</span>
          </p>
          <p className="text-gray-600 text-sm mb-4 mt-2.5">
            Track your daily accomplishments, learnings, and challenges to
            accelerate your professional growth
          </p>
          {hasSubmittedToday && (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm">
              <CheckCircle2 className="w-5 h-5" />
              Today's entry completed!
            </div>
          )}
        </div>
      </div>

   
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-center gap-2 mb-8 mt-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`px-9 py-2.5 rounded-md font-small transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-white text-black shadow-md border-2 border-gray-500"
                  : tab.disabled
                  ? "bg-white text-gray-400 border border-gray-200 cursor-not-allowed opacity-60"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {activeTab === "daily" && (
            <DailyLog onSubmitSuccess={() => setHasSubmittedToday(true)} />
          )}
          {activeTab === "history" && <DailyLogHistory />}
          {activeTab === "insights" && (
            <div className="text-center py-16">
              <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Insights Coming Soon
              </h3>
              <p className="text-gray-500">
                We're working on bringing you valuable insights.
              </p>
            </div>
          )}
          {activeTab === "analytics" && (
            <div className="text-center py-16">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analytics Coming Soon
              </h3>
              <p className="text-gray-500">
                We're working on detailed analytics for you.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
