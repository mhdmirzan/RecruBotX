// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Global Components
import Navbar from "./components/Navbar";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import PricingPage from "./components/PricingPage";
import HowItWorksPage from "./components/HowItWorksPage";
import AboutPage from "./components/AboutPage";
import FAQPage from "./components/FAQPage";
import PrivacyPolicyPage from "./components/PrivacyPolicyPage";
import TermsOfServicePage from "./components/TermsOfServicePage";
import ScrollToTop from "./components/ScrollToTop";

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
import CandidateSignupPage from "./CandidateSignupPage";
import CandidateDashboard from "./CandidateDashboard";
import CandidateSettings from "./CandidateSettings";
import CandidateApplication from "./CandidateApplication";
import AnalyzeResume from "./analyze_resume";
import VoiceInterview from "./VoiceInterview";

// Recruiter (HR)
import RecruiterSignupPage from "./RecruiterSignupPage";
import RecruiterSigninPage from "./RecruiterSigninPage";
import RecruiterDashboard from "./RecruiterDashboard";
import JobPosting from "./JobPosting";
import Evaluation from "./Evaluation";
import Ranking from "./Ranking";
import CandidateReport from "./CandidateReport";
import RecruiterSettings from "./RecruiterSettings";

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
      <ScrollToTop />
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
        <Route path="/about" element={<><AboutPage /><Footer /></>} />
        <Route path="/faq" element={<><FAQPage /><Footer /></>} />
        <Route path="/privacy" element={<><PrivacyPolicyPage /><Footer /></>} />
        <Route path="/terms" element={<><TermsOfServicePage /><Footer /></>} />
        <Route path="/signup" element={<Signup />} />

        {/* ===== CANDIDATE ===== */}
        <Route path="/candidate/signin" element={<><CandidatePage /><Footer /></>} />
        <Route path="/candidate/signup" element={<><CandidateSignupPage /><Footer /></>} />
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
        <Route path="/recruiter/signin" element={<><RecruiterSigninPage /><Footer /></>} />
        <Route path="/recruiter/signup" element={<><RecruiterSignupPage /><Footer /></>} />
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        <Route path="/recruiter/job-posting" element={<JobPosting />} />
        <Route path="/recruiter/evaluation" element={<Evaluation />} />
        <Route path="/recruiter/ranking" element={<Ranking />} />
        <Route path="/recruiter/report/:rankingId" element={<CandidateReport />} />
        <Route path="/recruiter/settings" element={<RecruiterSettings />} />
      </Routes>
    </Router>
  );
}

export default App;
