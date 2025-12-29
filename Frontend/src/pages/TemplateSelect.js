import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, LogOut, LayoutDashboard, Cog, FileText, ArrowRight } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../utils/userDatabase";

import template1 from "./Double column.jpg";
import template2 from "./simple.jpg";
import template3 from "./elegant.jpg";
import template6 from "./template 3.jpg";

const templates = [
  { id: "double-column", name: "Double Column", image: template1 },
  { id: "Simple", name: "Simple", image: template2 },
  { id: "elegant", name: "Elegant", image: template3 },
];

export default function TemplateSelect() {
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);
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

  const handleContinue = () => {
    if (!selected) {
      alert("Please select a template");
      return;
    }

    // Store template for preview
    localStorage.setItem("selectedTemplate", selected);

    // Navigate to the next step - select resume source
    navigate("/candidate/resume/builder");
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
      <main className="flex-1 h-screen flex flex-col py-6 px-10">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Choose a CV Template</h2>
            <p className="mt-1 text-gray-500 text-md">Select a professional template that best represents your style and career level.</p>
          </div>
          {/* Continue Button - Moved to top right */}
          <button
            onClick={handleContinue}
            disabled={!selected}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Content - No scrolling */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-6xl">
            {/* Templates Grid */}
            <div className="grid grid-cols-3 gap-10 mb-10">
              {templates.map((tpl) => {
                const isActive = selected === tpl.id;

                return (
                  <motion.div
                    key={tpl.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelected(tpl.id)}
                    className="relative cursor-pointer"
                  >
                    <div
                      className={`relative aspect-[210/297] rounded-lg overflow-hidden border-2 bg-white p-2 transition ${isActive
                        ? "ring-4 ring-blue-600 border-blue-600 shadow-xl"
                        : "border-gray-200 hover:shadow-lg hover:border-blue-300"
                        }`}
                    >
                      <img
                        src={tpl.image}
                        alt={tpl.name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <p className="text-center mt-3 text-sm font-semibold text-gray-700">
                      {tpl.name}
                    </p>

                    {isActive && (
                      <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                        <Check size={18} />
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
