import React from "react";

export const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    <div className="space-y-3">{children}</div>
  </div>
);

export const Input = (props) => (
  <input
    {...props}
    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

export const Textarea = (props) => (
  <textarea
    {...props}
    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

export const AddButton = ({ onClick, label }) => (
  <button
    onClick={onClick}
    className="text-sm font-medium text-blue-600 hover:underline"
  >
    + {label}
  </button>
);

// Word counter component with minimum requirement indicator
export const WordCounter = ({ text, minWords, label }) => {
  const wordCount = (text || "").trim().split(/\s+/).filter(Boolean).length;
  const isMet = wordCount >= minWords;
  
  return (
    <div className={`text-xs mt-1 px-3 py-1 rounded-lg inline-block ${
      isMet ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
    }`}>
      {wordCount}/{minWords} words {label && `(${label})`} {isMet ? "✓" : ""}
    </div>
  );
};
