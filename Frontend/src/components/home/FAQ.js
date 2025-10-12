import React, { useState } from "react";

const faqs = [
  { q: "What's included in free trial?", a: "Access to basic AI interview features." },
  { q: "What is RecruBotX?", a: "An AI-powered interview automation platform." },
  { q: "How does RecruBotX track candidate activity?", a: "It analyzes responses and facial cues securely." },
  { q: "Can RecruBotX be used for teams?", a: "Yes, HR teams can collaborate easily." },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="px-6 md:px-16 py-12 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
      <div className="max-w-2xl mx-auto">
        {faqs.map((item, i) => (
          <div key={i} className="border-b py-4">
            <button
              className="flex justify-between w-full text-left font-medium"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              {item.q}
              <span>{openIndex === i ? "-" : "+"}</span>
            </button>
            {openIndex === i && <p className="mt-2 text-gray-600">{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
