// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Global Components
import Navbar from "./components/Navbar";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import PricingPage from "./components/PricingPage";
import HowItWorksPage from "./components/HowItWorksPage";

// Home
import Hero from "./components/home/Hero";
import WorkingProcess from "./components/home/WorkingProcess";
import About from "./components/home/About";
import Security from "./components/home/Security";
import Stats from "./components/home/Stats";
import FAQ from "./components/home/FAQ";
import Signup from "./components/home/Signup";
import Reviews from "./components/home/Reviews";

// Candidate
import CandidatePage from "./CandidatePage";
import CandidateLoginPage from "./CandidateLoginPage";
import CandidateDashboard from "./CandidateDashboard";
import CandidateSettings from "./CandidateSettings";
import CandidateApplication from "./CandidateApplication";
import AnalyzeResume from "./analyze_resume";
import VoiceInterview from "./VoiceInterview";

// Recruiter (HR)
import RecruiterSignupPage from "./RecruiterSignupPage";
import RecruiterSigninPage from "./RecruiterSigninPage";
import RecruiterDashboard from "./RecruiterDashboard";
import RecruiterSettings from "./RecruiterSettings";
import JobPosting from "./JobPosting";
import Ranking from "./Ranking";
import Evaluation from "./Evaluation";
import CandidateReport from "./CandidateReport";

// Resume Builder Pages
import TemplateSelect from "./pages/TemplateSelect";
import ResumeBuilder from "./pages/ResumeBuilder";

// Initialize user database
import { initializeDummyUsers } from "./utils/userDatabase";

// Initialize dummy users on app load
initializeDummyUsers();

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* ===== HOME ===== */}
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

        <Route path="/contact" element={<><Contact /><Footer /></>} />
        <Route path="/how-it-works" element={<><HowItWorksPage /><Footer /></>} />
        <Route path="/pricing" element={<><PricingPage /><Footer /></>} />
        <Route path="/signup" element={<Signup />} />

        {/* ===== CANDIDATE ===== */}
        <Route path="/candidate" element={<CandidatePage />} />
        <Route path="/signin/candidate" element={<CandidateLoginPage />} />
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        <Route path="/candidate/settings" element={<CandidateSettings />} />
        <Route path="/candidate/interview" element={<VoiceInterview />} />
        <Route path="/candidate/analyze-resume" element={<AnalyzeResume />} />

        {/* ===== RESUME BUILDER FLOW ===== */}
        <Route
          path="/candidate/resume/choose-template"
          element={<TemplateSelect />}
        />
        <Route
          path="/candidate/resume/builder"
          element={<ResumeBuilder />}
        />

        {/* ===== RECRUITER (HR) ===== */}
        {/* Main recruiter route - opens signup page */}
        <Route path="/recruiter" element={<RecruiterSignupPage />} />

        {/* Recruiter signup route */}
        <Route path="/signup/recruiter" element={<RecruiterSignupPage />} />

        {/* Recruiter signin route */}
        <Route path="/signin/recruiter" element={<RecruiterSigninPage />} />

        {/* Recruiter dashboard */}
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />

        {/* Recruiter settings */}
        <Route path="/recruiter/settings" element={<RecruiterSettings />} />

        {/* Job posting */}
        <Route path="/recruiter/job-posting" element={<JobPosting />} />

        {/* Ranking */}
        <Route path="/recruiter/ranking" element={<Ranking />} />

        {/* Evaluation */}
        <Route path="/recruiter/evaluation" element={<Evaluation />} />

        {/* Candidate Report */}
        <Route path="/recruiter/report/:rankingId" element={<CandidateReport />} />
      </Routes>
    </Router>
  );
}

export default App;
