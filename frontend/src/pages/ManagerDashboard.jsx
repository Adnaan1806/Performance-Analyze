import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import ManagerReview from "./ManagerReview";
import { BarChart2, Star, Settings } from "@/components/ui/icons";

const ManagerDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("reviews");

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const user = localStorage.getItem("user");
  const parsedUser = JSON.parse(user);
  const userName = parsedUser.name;

  const tabs = [
    { id: "reviews", label: "Log Review", icon: <Star /> },
    { id: "settings", label: "BIS Comparison", icon: <Settings /> },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              <span className="text-pink-600">Manager Dashboard</span>
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

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-4xl font-medium">
            Welcome, <span className="text-pink-600">{userName}</span>
          </p>
          <p className="text-gray-600 text-sm mb-4 mt-2.5">
            Manage your team's performance and insights
          </p>
        </div>
      </div>

      {/* Tabs */}
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

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {activeTab === "reviews" && <ManagerReview />}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
