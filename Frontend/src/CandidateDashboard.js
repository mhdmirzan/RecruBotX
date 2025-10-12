import React from "react";
import { Bell, LogOut, Settings } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const CandidateDashboard = () => {
  const navigate = useNavigate();

  // ✅ Dynamic Date
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ✅ Stats Data
  const stats = [
    { value: "83%", label: "Profile Complete", bg: "bg-yellow-100", text: "text-yellow-700" },
    { value: "3", label: "Scheduled Interviews", bg: "bg-blue-100", text: "text-blue-700" },
    { value: "91", label: "Practice Sessions", bg: "bg-pink-100", text: "text-pink-700" },
    { value: "126", label: "Reports Generated", bg: "bg-purple-100", text: "text-purple-700" },
  ];

  // ✅ Activities Data
  const activities = [
    { title: "Interview Scheduled – AI Engineer", date: "March 5, 2025 – 3:00 PM", status: "Upcoming", color: "text-green-600" },
    { title: "Practice Simulation Completed", date: "March 1, 2025", status: "Completed", color: "text-purple-600" },
  ];

  // ✅ Logout Handler
  const handleLogout = () => {
    navigate("/login");
  };

  // ✅ Start Interview Handler
  const handleStartInterview = () => {
    navigate("/candidate/application");
  };

  // ✅ CV Screening Handler
  const handleCVScreening = () => {
    navigate("/candidate/analyze-resume"); // ✅ fixed route
  };

  // ✅ Reusable Stat Card
  const StatCard = ({ value, label, bg, text }) => (
    <div className={`${bg} p-6 rounded-xl shadow text-center`}>
      <h3 className={`text-2xl font-bold ${text}`}>{value}</h3>
      <p className="text-gray-700">{label}</p>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col p-6">
        <nav className="flex flex-col space-y-8 text-gray-700">
          <NavLink
            to="/candidate/dashboard"
            className={({ isActive }) =>
              `font-medium ${isActive ? "text-blue-600" : "text-gray-700 hover:text-blue-600"}`
            }
          >
            🏠 Dashboard
          </NavLink>
          <NavLink
            to="/candidate/settings"
            className={({ isActive }) =>
              `font-medium ${isActive ? "text-blue-600" : "text-gray-700 hover:text-blue-600"}`
            }
          >
            ⚙️ Settings
          </NavLink>
        </nav>
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded-lg text-white hover:bg-red-600"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500">{today}</p>
          </div>
          <div className="flex items-center gap-6">
            <Bell className="text-gray-600 w-6 h-6 cursor-pointer" />
            <Settings className="text-gray-600 w-6 h-6 cursor-pointer hover:text-blue-600" />
            <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold">
              FN
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-[#0a2a5e] text-white rounded-2xl p-8 flex justify-between items-center shadow-lg mb-10">
          <div>
            <h2 className="text-3xl font-bold">Hi, Fatima 👋</h2>
            <p className="mt-2 text-lg">Ready to start your day with interviews?</p>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleStartInterview}
                className="bg-white text-[#0a2a5e] px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-100 transition"
              >
                Record Intro Video
              </button>
              <button
                onClick={handleCVScreening}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-600 transition"
              >
                CV Screening
              </button>
            </div>
          </div>
          <img
            src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
            alt="Candidate"
            className="w-28 h-28"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        {/* Recent Activities */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h3>
          {activities.map((activity, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow mb-4 flex justify-between items-center"
            >
              <div>
                <h4 className="font-bold text-gray-800">{activity.title}</h4>
                <p className="text-gray-500 text-sm">{activity.date}</p>
              </div>
              <span className={`${activity.color} font-medium`}>{activity.status}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;
