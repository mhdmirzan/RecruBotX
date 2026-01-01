import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/userDatabase";
import CandidateSidebar from "../components/CandidateSidebar";


import template1 from "./Double column.jpg";
import template2 from "./simple.jpg";
import template3 from "./Image.PNG";

const templates = [
  { id: "double-column", name: "Double Column", image: template1 },
  { id: "Simple", name: "Simple", image: template2 },
  { id: "elegant", name: "Elegant", image: template3 },
];

export default function TemplateSelect() {
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
    localStorage.setItem("selectedTemplate", selected);
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
    <div className="h-screen w-screen flex bg-gray-50 fixed inset-0 overflow-hidden">
      {/* Sidebar */}
      <CandidateSidebar />

      {/* Main */}
      <main className="flex-1 px-10 py-8 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Choose a CV Template
            </h2>
            <p className="text-gray-500 mt-1">
              Select a professional template that best represents your style and career level.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-800">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {user.firstName?.charAt(0)}
              {user.lastName?.charAt(0)}
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md p-8 h-[calc(100%-90px)] flex flex-col">

          {/* ✅ REDUCED TEMPLATE HEIGHT */}
          <div className="grid grid-cols-3 gap-10 mb-6">
            {templates.map((tpl) => {
              const isActive = selected === tpl.id;
              return (
                <motion.div
                  key={tpl.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelected(tpl.id)}
                  className="cursor-pointer relative"
                >
                  <div
                    className={`h-[360px] border-2 rounded-lg p-2 transition ${isActive
                      ? "border-blue-600 ring-4 ring-blue-600 shadow-lg"
                      : "border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    <img
                      src={tpl.image}
                      alt={tpl.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <p className="text-center mt-3 font-semibold text-gray-700">
                    {tpl.name}
                  </p>

                  {isActive && (
                    <span className="absolute top-3 right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                      <Check size={18} />
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Continue Button */}
          <div className="flex justify-end mt-auto">
            <button
              onClick={handleContinue}
              disabled={!selected}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition shadow
                ${selected
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-400 text-white cursor-not-allowed"
                }`}
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
