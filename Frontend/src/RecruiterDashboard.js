import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Briefcase,
  Users,
  Video,
  FileText,
  TrendingUp,
  BarChart3,
  Sparkles,
  PlusCircle
} from "lucide-react";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [recruiterData, setRecruiterData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    activeJobs: 8,
    totalCandidates: 124,
    aiInterviews: 56,
    cvsScreened: 92
  });

  const [recentJobs, setRecentJobs] = useState([
    {
      id: 1,
      title: "Frontend Developer",
      candidates: "12-25",
      screening: "AI Screening Enabled"
    },
    {
      id: 2,
      title: "Backend Engineer",
      candidates: "12-25",
      screening: "AI Screening Enabled"
    },
    {
      id: 3,
      title: "UI/UX Designer",
      candidates: "12-25",
      screening: "AI Screening Enabled"
    }
  ]);

  useEffect(() => {
    // Get recruiter data from localStorage
    const storedUser = localStorage.getItem("recruiterUser");
    if (storedUser) {
      setRecruiterData(JSON.parse(storedUser));
    } else {
      // Redirect to login if not authenticated
      navigate("/signin/recruiter");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("recruiterUser");
    navigate("/recruiter");
  };

  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  if (!recruiterData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
      {/* Sidebar - Matching Candidate Dashboard Style */}
      <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0">

        {/* Logo */}
        <div className="mb-8 text-center flex-shrink-0">
          <h1 className="text-3xl font-bold text-blue-600">RecruBotX</h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
          <NavLink
            to="/recruiter/dashboard"
            className={({ isActive }) =>
              `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </NavLink>

          <NavLink
            to="/recruiter/job-posting"
            className={({ isActive }) =>
              `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`
            }
          >
            <PlusCircle className="w-5 h-5" /> Job Posting
          </NavLink>

          <NavLink
            to="/recruiter/ranking"
            className={({ isActive }) =>
              `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`
            }
          >
            <TrendingUp className="w-5 h-5" /> Ranking
          </NavLink>

          <NavLink
            to="/recruiter/evaluation"
            className={({ isActive }) =>
              `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`
            }
          >
            <BarChart3 className="w-5 h-5" /> Evaluation
          </NavLink>

          <NavLink
            to="/recruiter/settings"
            className={({ isActive }) =>
              `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`
            }
          >
            <Settings className="w-5 h-5" /> Settings
          </NavLink>
        </nav>

        {/* Bottom Section - Logout Button Only */}
        <div className="mt-auto flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content - Non-scrollable */}
      <main className="flex-1 h-screen flex flex-col overflow-hidden py-6 px-10">
        {/* Top Header with User Profile */}
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Recruiter Dashboard</h2>
            <p className="text-gray-500 text-md mt-1 py-4">{getCurrentDate()}</p>
          </div>

          {/* User Profile - Top Right */}
          <div className="flex items-center gap-3">

            <div className="text-right">
              <h3 className="font-bold text-gray-800">
                {recruiterData.firstName} {recruiterData.lastName}
              </h3>
              <p className="text-sm text-gray-500">{recruiterData.email}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
              {recruiterData.profileImage ? (
                <img src={recruiterData.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <>{recruiterData.firstName?.charAt(0)}{recruiterData.lastName?.charAt(0)}</>
              )}
            </div>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#0a2a5e] to-[#1e4a8e] text-white rounded-2xl p-6 shadow-xl mb-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-8">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-7 h-7 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                Welcome back, {recruiterData.firstName}!
              </h3>
              <p className="mt-1 text-blue-100 text-sm">Manage your hiring pipeline and find the best talent efficiently.</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-4 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-800">{dashboardStats.activeJobs}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Candidates</p>
                <p className="text-2xl font-bold text-gray-800">{dashboardStats.totalCandidates}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">AI Interviews</p>
                <p className="text-2xl font-bold text-gray-800">{dashboardStats.aiInterviews}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">CVs Screened</p>
                <p className="text-2xl font-bold text-gray-800">{dashboardStats.cvsScreened}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Job Postings - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex-1"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
            Recent Job Postings
          </h2>
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div>
                  <h3 className="font-medium text-gray-800">{job.title}</h3>
                  <p className="text-sm text-gray-500">
                    {job.candidates} Candidates • {job.screening}
                  </p>
                </div>
                <button className="text-blue-600 hover:underline text-sm font-medium">
                  View
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default RecruiterDashboard;
