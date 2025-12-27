import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import template1 from "./Double column.jpg";
import template2 from "./simple.jpg";
import template3 from "./elegant.jpg";
import template6 from "./template 3.jpg";

const templates = [
  { id: "double-column", name: "Double Column", image: template1 },
  { id: "Simple", name: "Simple", image: template2 },
  { id: "elegant", name: "Elegant", image: template3 },
  { id: "modern", name: "Modern", image: template6 },
];

export default function TemplateSelect({ onNext }) {
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (!selected) {
      alert("Please select a template");
      return;
    }

    // store template for preview
    localStorage.setItem("selectedTemplate", selected);

    onNext(selected); // ✅ FIX: move to next step in ResumeFlow
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="text-center mt-8 mb-10">
        <h2 className="text-xl font-medium text-gray-800">
          Please select a template for your resume
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          You can always change it later
        </p>
      </div>

      {/* Templates Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-4 gap-6 justify-items-center">
          {templates.map((tpl) => {
            const isActive = selected === tpl.id;

            return (
              <motion.div
                key={tpl.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelected(tpl.id)}
                className="relative cursor-pointer w-full max-w-[220px]"
              >
                <div
                  className={`relative aspect-[210/297] rounded-lg overflow-hidden border bg-white p-2 transition ${
                    isActive
                      ? "ring-2 ring-blue-600"
                      : "hover:shadow-lg"
                  }`}
                >
                  <img
                    src={tpl.image}
                    alt={tpl.name}
                    className="h-full w-full object-contain"
                  />
                </div>

                <p className="text-center mt-2 text-xs font-medium text-gray-700">
                  {tpl.name}
                </p>

                {isActive && (
                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                    <Check size={14} />
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-4">
          <div className="max-w-6xl mx-auto px-6 flex justify-end">
            <button
              onClick={handleContinue}
              className="px-8 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
