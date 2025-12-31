import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/userDatabase";
import CandidateSidebar from "../components/CandidateSidebar";

import template1 from "./Double column.jpg";
import template2 from "./simple.jpg";
import template3 from "./elegant.jpg";

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
      <CandidateSidebar />

      {/* Main Content */}
      <main className="flex-1 h-screen flex flex-col py-8 px-8 overflow-hidden">
        {/* Top Header */}
        <div className="mb-6 flex-shrink-0 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Choose a CV Template</h2>
            <p className="text-gray-500 text-md mt-1">Select a professional template that best represents your style and career level.</p>
          </div>

          {/* User Profile - Top Right */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h3 className="font-bold text-gray-800">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content - Full width box with internal header */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full h-full flex flex-col overflow-hidden">

            {/* Templates Grid */}
            <div className="grid grid-cols-3 gap-8 mb-6 flex-1 overflow-hidden p-2">
              {templates.map((tpl) => {
                const isActive = selected === tpl.id;

                return (
                  <motion.div
                    key={tpl.id}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setSelected(tpl.id)}
                    className="relative cursor-pointer flex flex-col items-center"
                  >
                    <div
                      className={`relative rounded-lg overflow-hidden border-2 bg-white p-2 transition w-full ${isActive
                        ? "ring-4 ring-blue-600 border-blue-600 shadow-xl"
                        : "border-gray-200 hover:shadow-lg hover:border-blue-300"
                        }`}
                      style={{ height: '380px' }}
                    >
                      <img
                        src={tpl.image}
                        alt={tpl.name}
                        className="h-full w-full object-contain"
                      />

                      {isActive && (
                        <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg z-10">
                          <Check size={18} />
                        </span>
                      )}
                    </div>

                    <p className="text-center mt-2 text-sm font-semibold text-gray-700">
                      {tpl.name}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Continue Button - Inside box, right aligned */}
            <div className="flex justify-end pt-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={handleContinue}
                disabled={!selected}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
