import React from "react";
import { Bell, LogOut, Settings } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const CandidateDashboard = () => {
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const stats = [
    { value: "83%", label: "Profile Complete", bg: "bg-yellow-100", text: "text-yellow-700" },
    { value: "3", label: "Scheduled Interviews", bg: "bg-blue-100", text: "text-blue-700" },
    { value: "91", label: "Practice Sessions", bg: "bg-pink-100", text: "text-pink-700" },
    { value: "126", label: "Reports Generated", bg: "bg-purple-100", text: "text-purple-700" },
  ];

  const activities = [
    { title: "Interview Scheduled – AI Engineer", date: "March 5, 2025 – 3:00 PM", status: "Upcoming", color: "text-green-600" },
    { title: "Practice Simulation Completed", date: "March 1, 2025", status: "Completed", color: "text-purple-600" },
  ];

  const StatCard = ({ value, label, bg, text }) => (
    <div className={`${bg} p-6 rounded-xl shadow text-center`}>
      <h3 className={`text-2xl font-bold ${text}`}>{value}</h3>
      <p className="text-gray-700">{label}</p>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-white shadow-lg flex-col p-6">
        <nav className="flex flex-col space-y-8">
          <NavLink to="/candidate/dashboard" className="font-medium hover:text-blue-600">
            🏠 Dashboard
          </NavLink>
          <NavLink to="/candidate/settings" className="font-medium hover:text-blue-600">
            ⚙️ Settings
          </NavLink>
        </nav>

        <button
          onClick={() => navigate("/login")}
          className="mt-auto flex items-center gap-2 bg-red-500 px-4 py-2 rounded-lg text-white hover:bg-red-600"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-500">{today}</p>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="w-6 h-6 cursor-pointer" />
            <Settings className="w-6 h-6 cursor-pointer" />
            <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold">
              FN
            </div>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-[#0a2a5e] text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Hi, Fatima 👋</h2>
            <p className="mt-2 text-base md:text-lg">
              Build your ATS-friendly resume in minutes
            </p>

            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={() => navigate("/candidate/application")}
                className="bg-white text-[#0a2a5e] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
              >
                Record Intro Video
              </button>

              <button
                onClick={() => navigate("/candidate/analyze-resume")}
                className="bg-green-500 px-6 py-3 rounded-lg font-semibold hover:bg-green-600"
              >
                CV Screening
              </button>

              <button
                onClick={() => navigate("/candidate/resume/experience-level")}
                className="bg-blue-500 px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
              >
                Create Resume
              </button>
            </div>
          </div>

          <img
            src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
            alt="Candidate"
            className="hidden sm:block w-24 md:w-28 h-24 md:h-28"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        {/* Activities */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Recent Activities</h3>
          {activities.map((a, i) => (
            <div
              key={i}
              className="bg-white p-4 sm:p-6 rounded-xl shadow mb-4 flex flex-col sm:flex-row justify-between gap-2"
            >
              <div>
                <h4 className="font-bold">{a.title}</h4>
                <p className="text-gray-500 text-sm">{a.date}</p>
              </div>
              <span className={a.color}>{a.status}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;
