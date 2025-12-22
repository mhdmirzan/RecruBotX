import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import template1 from "./Double column.jpg";
import template2 from "./ivy league.jpg";
import template3 from "./elegant.jpg";
import template4 from "./simple.jpg";
import template5 from "./template 4.jpg";
import template6 from "./template 3.jpg";

const templates = [
  { id: "double-column", name: "Double Column", image: template1 },
  { id: "ivy", name: "Ivy League", image: template2 },
  { id: "elegant", name: "Elegant", image: template3 },
  { id: "Simple", name: "Simple", image: template4 },
  { id: "polished", name: "Polished", image: template5 },
  { id: "modern", name: "Modern", image: template6 },
];

export default function TemplateSelect() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (!selected) {
      alert("Please select a template");
      return;
    }
    localStorage.setItem("selectedTemplate", selected);
    navigate("/candidate/resume/select-resume");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="text-center mt-10 mb-12">
        <h2 className="text-xl font-medium text-gray-800">
          Please select a template for your resume
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          You can always change it later
        </p>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
          {templates.map((tpl) => {
            const isActive = selected === tpl.id;

            return (
              <motion.div
                key={tpl.id}
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelected(tpl.id)}
                className="relative cursor-pointer"
              >
                
                <div
                  className={`relative aspect-[210/297] rounded-xl overflow-hidden border bg-white transition ${
                    isActive ? "ring-2 ring-blue-600" : "hover:shadow-xl"
                  }`}
                >


                  <img
                    src={tpl.image}
                    alt={tpl.name}
                    className="h-full w-full object-contain"
                  />
                </div>

                <p className="text-center mt-3 text-sm font-medium text-gray-700">
                  {tpl.name}
                </p>

                {isActive && (
                  <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                    <Check size={16} />
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-4">
          <div className="max-w-7xl mx-auto px-6 flex justify-end">
            <button
              onClick={handleContinue}
              className="px-10 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

