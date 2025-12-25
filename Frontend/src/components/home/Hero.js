import React from "react";
import { Link } from "react-router-dom";   // 👈 Import Link for navigation
import Img1 from "../../assets/images/home/2.jpg";
import Img2 from "../../assets/images/home/4.jpeg";
import Img3 from "../../assets/images/home/5.png";
import Img4 from "../../assets/images/home/3.jpg";

const Hero = () => {
  return (
    <section className="px-6 md:px-16 py-12 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 leading-snug">
            RecruBotX – Redefining Hiring Through Intelligent Conversations
          </h1>
          <p className="mt-4 text-gray-600">
            RecruBotx empowers you with AI-driven video interviews to hire faster,
            smarter, and fairer. From screening to selection, it streamlines the
            journey for HR and candidates alike—your all-in-one solution for
            finding the right talent at any scale.
          </p>

          {/* ✅ Navigation Buttons */}
          <div className="mt-6 flex gap-4">
            <Link
              to="/candidate"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              Candidate Login
            </Link>

            <Link
              to="/signup"
              className="bg-gray-200 text-gray-900 px-5 py-2 rounded-lg hover:bg-gray-300"
            >
              HR Login
            </Link>
          </div>
        </div>

        {/* ✅ Image Grid */}
        <div className="grid grid-cols-2 gap-4">
          <img src={Img1} alt="Interview" className="rounded-xl shadow-md" />
          <img src={Img2} alt="AI Interview" className="rounded-xl shadow-md" />
          <img src={Img3} alt="Tech Interview" className="rounded-xl shadow-md" />
          <img src={Img4} alt="Candidate" className="rounded-xl shadow-md" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
