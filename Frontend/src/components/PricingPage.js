import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PricingCard } from "./ui/price";
import { User, Building2, Star, Zap, Crown } from "lucide-react";

const PricingPage = () => {
  const [billingMode, setBillingMode] = useState("candidate"); // 'candidate' or 'recruiter'

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const candidatePlans = [
    {
      planName: "Basic (Free)",
      description: "For individuals entering the job market",
      price: 0,
      billingCycle: "/month",
      features: [
        "3 Resume Analysis / month",
        "2 AI Interviews / month",
        "1 Resume Builder Template",
        "Basic AI Feedback Quality",
        "Standard Processing Speed",
      ],
      buttonText: "Start Free",

      icon: <User />,
    },
    {
      planName: "Silver (Pro)",
      variant: "popular",
      description: "For active job seekers looking for an edge",
      price: 15,
      billingCycle: "/month",
      features: [
        "20 Resume Analysis / month",
        "10 AI Interviews / month",
        "5 Resume Builder Templates",
        "Detailed AI Feedback",
        "10 Resume Report Downloads / month",
        "Interview Performance Insights",
        "Faster Processing Speed",
      ],
      buttonText: "Get Silver",
      icon: <Zap />,
    },
    {
      planName: "Gold (Advanced)",
      description: "For relentless job hunting preparation",
      price: 30,
      billingCycle: "/month",
      features: [
        "50 Resume Analysis / month",
        "25 AI Interviews / month",
        "12 Resume Builder Templates",
        "Advanced (deep insights) AI Feedback",
        "Unlimited Resume Report Downloads",
        "Detailed Interview Performance Insights",
        "Priority (fastest) Processing Speed",
      ],
      buttonText: "Get Gold",
      icon: <Crown />,
    },
  ];

  const recruiterPlans = [
    {
      planName: "Basic",
      description: "For small teams getting started",
      price: 99,
      billingCycle: "/month",
      features: [
        "3 Job Posts",
        "100 CV Screening / month",
        "20 Candidate PDF Reports / month",
        "Advanced Ranking System",
        "Basic Candidate Reports Detail",
        "Standard Processing Speed",
        "1 Team Seat",
      ],
      buttonText: "Get Basic",
      icon: <Building2 />,
    },
    {
      planName: "Silver",
      variant: "popular",
      description: "For growing companies",
      price: 199,
      billingCycle: "/month",
      features: [
        "10 Job Posts",
        "500 CV Screening / month",
        "100 Candidate PDF Reports / month",
        "Advanced Ranking System",
        "Full Candidate Reports Detail",
        "Standard Processing Speed",
        "3 Team Seats",
      ],
      buttonText: "Get Silver",
      icon: <Zap />,
    },
    {
      planName: "Gold",
      description: "For large organizations",
      price: 449,
      billingCycle: "/month",
      features: [
        "25 Job Posts",
        "2000 CV Screening / month",
        "Unlimited Candidate PDF Reports",
        "Advanced Ranking System",
        "Full + Insights Candidate Reports Detail",
        "Full Analytics & Hiring Insights",
        "Priority AI Processing",
        "10 Team Seats",
      ],
      buttonText: "Get Gold",
      icon: <Crown />,
    },
  ];

  const activePlans = billingMode === "candidate" ? candidatePlans : recruiterPlans;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <section className="py-20 bg-[#0a2a5e] text-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-500 text-white px-5 py-2 rounded-full mb-8 shadow-sm border border-blue-400">
            <Star className="w-4 h-4 text-blue-200" aria-hidden="true" />
            <span className="text-sm font-medium">
              Find the plan that matches your ambition
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Choose the plan that fits your goals. Whether you're a candidate preparing for interviews or a recruiter hiring the best talent.
          </p>
          
          {/* Toggle */}
          <div className="flex justify-center mb-8">
            <div className="relative flex items-center p-1 bg-blue-700/50 rounded-full shadow-inner backdrop-blur-sm">
              <button
                className={`relative w-40 py-2.5 text-sm font-semibold rounded-full z-10 transition-colors duration-300 ${
                  billingMode === "candidate" ? "text-blue-600" : "text-blue-100 hover:text-white"
                }`}
                onClick={() => setBillingMode("candidate")}
              >
                Candidate
              </button>
              <button
                className={`relative w-40 py-2.5 text-sm font-semibold rounded-full z-10 transition-colors duration-300 ${
                  billingMode === "recruiter" ? "text-blue-600" : "text-blue-100 hover:text-white"
                }`}
                onClick={() => setBillingMode("recruiter")}
              >
                Recruiter
              </button>
              <div
                className="absolute top-1 bottom-1 w-40 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out z-0"
                style={{
                  transform: billingMode === "candidate" ? "translateX(0)" : "translateX(100%)"
                }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <div className="w-full max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={billingMode}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
          >
            {activePlans.map((plan, index) => (
              <motion.div key={index} variants={itemVariants} className="h-full">
                <PricingCard {...plan} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PricingPage;
