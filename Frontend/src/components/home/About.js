import React from "react";
import teamImage from "../../assets/images/home/Rectangle-95.png";

const About = () => {
  return (
    <section className="bg-[#F7F7FF] py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 grid md:grid-cols-2 gap-12 items-center">

        {/* Left Side - Image with decorative dots */}
        <div className="relative">
          <img
            src={teamImage}
            alt="Team working together"
            className="rounded-xl shadow-lg"
          />
          {/* Decorative Dots - Top Left */}
          <div className="absolute -top-6 -left-6 w-20 h-20 grid grid-cols-5 gap-1 opacity-80">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#0a2a5e]" />
            ))}
          </div>
          {/* Decorative Dots - Bottom Right */}
          <div className="absolute -bottom-6 -right-6 w-20 h-20 grid grid-cols-5 gap-1 opacity-80">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#0a2a5e]" />
            ))}
          </div>
        </div>

        {/* Right Side - Text */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a2a5e] mb-6">
            Hire Better with AI
          </h2>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            RecruBotX is an AI-powered video interview platform designed to streamline your entire recruitment process. 
            <br /><br />
            With intelligent candidate analysis and real-time evaluations, our end-to-end system empowers HR teams to save time, reduce bias, and make faster, data-driven hiring decisions at scale.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
