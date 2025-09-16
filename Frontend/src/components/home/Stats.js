import React from "react";

const Stats = () => {
  const data = [
    { value: "95%", label: "Bias Reduction" },
    { value: "70%", label: "Time Saved" },
    { value: "10k+", label: "Interviews Conducted" },
  ];

  return (
    <section className="px-6 md:px-16 py-12 bg-[#0a2a5e]">
      <div className="grid md:grid-cols-3 gap-6 text-center">
        {data.map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-3xl font-bold text-blue-600">{item.value}</h3>
            <p className="text-gray-600">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
