import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Global Components
import Navbar from "./components/Navbar";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import PricingPage from "./components/PricingPage";
import HowItWorksPage from "./components/HowItWorksPage";

// Home Page Components (all inside home folder)
import Hero from "./components/home/Hero";
import WorkingProcess from "./components/home/WorkingProcess";
import About from "./components/home/About";
import Security from "./components/home/Security";
import Stats from "./components/home/Stats";
import FAQ from "./components/home/FAQ";
import Signup from "./components/home/Signup";
import Reviews from "./components/home/Reviews";

// ✅ Candidate Pages
import CandidatePage from "./CandidatePage";
import CandidateDashboard from "./CandidateDashboard";
import CandidateSettings from "./CandidateSettings";
import CandidateApplication from "./CandidateApplication"; // <-- Import added

function App() {
  return (
    <Router>
      <div className="font-sans bg-gray-50 text-gray-900">
        <Navbar />

        <Routes>
          {/* Homepage */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <WorkingProcess />
                <About />
                <Security />
                <Stats />
                <Reviews />
                <FAQ />
                <Footer />
              </>
            }
          />

          {/* Contact Page */}
          <Route
            path="/contact"
            element={
              <>
                <Contact />
                <Footer />
              </>
            }
          />

          {/* How It Works Page */}
          <Route
            path="/how-it-works"
            element={
              <>
                <HowItWorksPage />
                <Footer />
              </>
            }
          />

          {/* Pricing Page */}
          <Route
            path="/pricing"
            element={
              <>
                <PricingPage />
                <Footer />
              </>
            }
          />

          {/* Signup Page → redirects to dashboard on success */}
          <Route path="/signup" element={<Signup />} />

          {/* Candidate Auth Page */}
          <Route path="/candidate" element={<CandidatePage />} />

          {/* Candidate Dashboard */}
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />

          {/* Candidate Settings */}
          <Route path="/candidate/settings" element={<CandidateSettings />} />

          {/* ✅ Start Interview Page */}
          <Route
            path="/candidate/application"
            element={<CandidateApplication />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
