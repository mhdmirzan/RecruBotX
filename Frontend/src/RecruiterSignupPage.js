import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  Briefcase
} from "lucide-react";
import recruiterHero from "./assets/images/general/image1.jpg"; // you can change image later

const RecruiterSignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    alert("Recruiter account created successfully!");
    navigate("/recruiter/dashboard");
  };

  const benefits = [
    "AI-powered candidate interviews",
    "Save recruiter time with automation",
    "Detailed candidate performance reports",
    "Custom interview questions",
    "Hire faster with data-driven insights",
    "Scalable hiring for teams",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">

        {/* Left Side - Signup Form */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <motion.div
            className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8"
            {...fadeInUp}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Join as Recruiter
              </h1>
              <p className="text-gray-500">
                Hire smarter with AI-powered interviews
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="w-full border rounded-lg px-10 py-2 focus:ring focus:ring-indigo-200"
                    required
                  />
                </div>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-indigo-200"
                  required
                />
              </div>

              {/* Company */}
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                  className="w-full border rounded-lg px-10 py-2 focus:ring focus:ring-indigo-200"
                  required
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Work Email"
                  className="w-full border rounded-lg px-10 py-2 focus:ring focus:ring-indigo-200"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full border rounded-lg px-10 py-2 pr-10 focus:ring focus:ring-indigo-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className="w-full border rounded-lg px-10 py-2 pr-10 focus:ring focus:ring-indigo-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Terms */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4"
                />
                <label className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link to="/terms" className="text-indigo-600 hover:underline">
                    Terms
                  </Link>{" "}
                  &{" "}
                  <Link to="/privacy" className="text-indigo-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center"
              >
                Create Recruiter Account
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link
                to="/signin/recruiter"
                className="text-indigo-600 hover:underline font-medium"
              >
                Sign in here
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Right Side - Benefits */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            className="w-full max-w-lg text-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={recruiterHero}
              alt="Recruiter hiring with AI"
              className="rounded-2xl shadow-md w-full mb-6"
            />

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Why Recruiters Love RecruBotX
            </h2>

            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3 text-left"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-600">{benefit}</span>
                </motion.div>
              ))}
            </div>


          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterSignupPage;
