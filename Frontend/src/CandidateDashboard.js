import React, { useState, useEffect } from "react";
import { LogOut, FileText, Mic, Search, Sparkles, LayoutDashboard, Cog } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "./utils/userDatabase";

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Get current user on component mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      // Redirect to login if not authenticated
      navigate("/signin/candidate");
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  // ✅ Dynamic Date
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ✅ Logout Handler
  const handleLogout = () => {
    logoutUser();
    navigate("/signin/candidate");
  };

  // ✅ Start Interview Handler
  const handleStartInterview = () => {
    navigate("/candidate/interview");
  };

  // ✅ CV Screening Handler
  const handleCVScreening = () => {
    navigate("/candidate/analyze-resume");
  };

  // ✅ Create Resume Handler
  const handleCreateResume = () => {
    navigate("/candidate/resume/choose-template");
  };

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Action cards data
  const actionCards = [
    {
      id: "interview",
      title: "Start Interview",
      description: "Practice with AI-powered mock interviews tailored to your target role.",
      icon: <Mic className="w-7 h-7 text-blue-600" />,
      bgColor: "bg-blue-50",
      hoverBgColor: "hover:bg-blue-100",
      iconBg: "bg-blue-100",
      textColor: "text-gray-800",
      onClick: handleStartInterview,
    },
    {
      id: "resume",
      title: "Create Resume",
      description: "Build a professional, ATS-friendly resume with AI assistance.",
      icon: <FileText className="w-7 h-7 text-blue-600" />,
      bgColor: "bg-blue-50",
      hoverBgColor: "hover:bg-blue-100",
      iconBg: "bg-blue-100",
      textColor: "text-gray-800",
      onClick: handleCreateResume,
    },
    {
      id: "screening",
      title: "CV Screening",
      description: "Analyze your resume against specific job descriptions.",
      icon: <Search className="w-7 h-7 text-blue-600" />,
      bgColor: "bg-blue-50",
      hoverBgColor: "hover:bg-blue-100",
      iconBg: "bg-blue-100",
      textColor: "text-gray-800",
      onClick: handleCVScreening,
    },
  ];

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
      {/* Sidebar - Always Visible, No Scroll */}
      <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0">

        {/* Logo */}
        <div className="mb-8 text-center flex-shrink-0">
          <h1 className="text-3xl font-bold text-blue-600">RecruBotX</h1>
        </div>

        <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
          <NavLink
            to="/candidate/dashboard"
            className={({ isActive }) =>
              `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`
            }
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </NavLink>
          <NavLink
            to="/candidate/settings"
            className={({ isActive }) =>
              `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`
            }
          >
            <Cog className="w-5 h-5" /> Settings
          </NavLink>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto flex-shrink-0">
          {/* User Profile Section */}
          <div className="mb-4 text-center pb-4 border-b border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl shadow-lg overflow-hidden">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</>
              )}
            </div>
            <h3 className="font-bold text-gray-800 text-lg">{user.firstName} {user.lastName}</h3>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>

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
        {/* Top Header */}
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-gray-500 text-md mt-1 py-4">{today}</p>
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
                Welcome back, {user.firstName}!
              </h3>
              <p className="mt-1 text-blue-100 text-sm">Ready to ace your next interview? Let's get started.</p>
            </div>
          </div>
          
        </div>

        {/* Action Cards - Light background design */}
        <div className="grid grid-cols-3 gap-10 flex-1 my-8">
          {actionCards.map((card) => (
            <button
              key={card.id}
              onClick={card.onClick}
              className={`${card.bgColor} ${card.hoverBgColor} border border-gray-200
                rounded-2xl p-10 shadow-sm hover:shadow-lg transition-all duration-300 
                transform hover:scale-[1.02] flex flex-col items-center justify-center text-center cursor-pointer group`}
            >
              <div className={`w-14 h-14 ${card.iconBg} rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                {card.icon}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${card.textColor}`}>{card.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;
