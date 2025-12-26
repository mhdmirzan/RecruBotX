import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  // Hide navbar on candidate dashboard pages
  if (
    location.pathname === "/candidate/dashboard" ||
    location.pathname === "/candidate/analyze-resume" ||
    location.pathname === "/candidate/settings" ||
    location.pathname === "/candidate/application"
  ) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          RecruBotX
        </Link>

        {/* Menu Links */}
        <div className="space-x-6 hidden md:flex items-center">
          <Link to="/how-it-works" className="hover:text-blue-600">
            How it Works
          </Link>

          <Link to="/pricing" className="hover:text-blue-600">
            Pricing
          </Link>

          {/* Candidates Route */}
          <Link to="/candidate" className="hover:text-blue-600">
            Candidates
          </Link>

          <Link to="/recruiters" className="hover:text-blue-600">
            Recruiters
          </Link>
        </div>

        {/* Buttons: Contact + Sign Up */}
        <div className="space-x-4 flex">
          <Link
            to="/contact"
            className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white"
          >
            Contact
          </Link>
          <Link
            to="/signup"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
