import React, { useState, useEffect } from "react";
import { LogOut, LayoutDashboard, Cog, Download, Eye } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../utils/userDatabase";
import DownloadButton from "../components/DownloadButton";

// Import Builder Components
import DoubleColumnBuilder from "./builders/DoubleColumnBuilder";
import SimpleBuilder from "./builders/SimpleBuilder";
import ElegantBuilder from "./builders/ElegantBuilder";

const ResumeBuilder = () => {
  const [user, setUser] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  // Get current user on component mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/signin/candidate");
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  // Logout Handler
  const handleLogout = () => {
    logoutUser();
    navigate("/signin/candidate");
  };

  // Get selected template from localStorage safely
  // Default to "simple" if nothing selected
  const selectedTemplate = localStorage.getItem("selectedTemplate") || "Simple";

  // common props to pass to builders
  const builderProps = {
    user,
    handleLogout,
    showPreview,
    setShowPreview
  };

  // Render the appropriate builder based on template ID
  const renderBuilder = () => {
    // Normalize string to handle case sensitivity issues (e.g. "Simple" vs "simple")
    const templateId = selectedTemplate.toLowerCase();

    switch (templateId) {
      case "double-column":
        return <DoubleColumnBuilder {...builderProps} />;
      case "simple":
        return <SimpleBuilder {...builderProps} />;
      case "elegant":
        return <ElegantBuilder {...builderProps} />;
      default:
        // Fallback to simple if unknown
        return <SimpleBuilder {...builderProps} />;
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
      {/* Sidebar */}
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

      {/* Main Content */}
      <main className="flex-1 h-screen flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex justify-between items-center py-6 px-10 flex-shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Build Your Resume</h2>
            <p className="mt-1 text-gray-500 text-md">Fill in your details and watch your professional resume come to life.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
            >
              <Eye className="w-5 h-5" />
              {showPreview ? "Edit" : "Preview"}
            </button>
            <DownloadButton />
          </div>
        </div>

        {/* Builder Content - Dynamic based on template */}
        <div className="flex-1 overflow-hidden px-10 pb-8">
          {renderBuilder()}
        </div>
      </main>
    </div>
  );
};

export default ResumeBuilder;
