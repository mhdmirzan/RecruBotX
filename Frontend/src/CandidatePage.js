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
  Play,
  Users
} from "lucide-react";
import image1 from "./assets/images/general/image1.jpg";
import { registerUser } from "./utils/userDatabase";

const CandidateSignupPage = () => {
  const navigate = useNavigate(); // ✅ for redirect after signup

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions.");
      return;
    }

    setIsLoading(true);

    // Register user in MongoDB database
    const result = await registerUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    });

    setIsLoading(false);

    if (result.success) {
      alert(`Account created successfully! Welcome, ${result.user.firstName}!`);
      // Redirect to Candidate Dashboard
      navigate("/candidate/dashboard");
    } else {
      setError(result.message);
    }
  };

  const benefits = [
    "Unlimited AI interview practice sessions",
    "24/7 availability - practice anytime",
    "Instant feedback and performance analytics",
    "Industry-specific interview questions",
    "No time limits or scheduling conflicts",
    "Build confidence before real interviews",
  ];

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full">
        
        {/* Left Side - Signup Form */}
        <div className="flex items-center justify-center p-6 lg:p-12 h-full">
          <motion.div 
            className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8"
            {...fadeInUp}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Join as Candidate
              </h1>
              <p className="text-gray-500">
                Start practicing interviews with AI and land your dream job
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="w-full border rounded-lg px-10 py-2 focus:ring focus:ring-blue-200"
                    required
                  />
                </div>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-200"
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
                  placeholder="Email Address"
                  className="w-full border rounded-lg px-10 py-2 focus:ring focus:ring-blue-200"
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
                  className="w-full border rounded-lg px-10 py-2 pr-10 focus:ring focus:ring-blue-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  className="w-full border rounded-lg px-10 py-2 pr-10 focus:ring focus:ring-blue-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  <Link to="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link to="/signin/candidate" className="text-blue-600 hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center p-6 lg:p-12 lg:sticky lg:top-0 lg:h-screen">
          <motion.div 
            className="w-full max-w-lg text-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Hero Image */}
            <div className="mb-6 rounded-2xl shadow-md w-full h-64 overflow-hidden">
              <img 
                src={image1} 
                alt="Interview Practice" 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Why Choose RecruBotX?
            </h2>
            <p className="text-gray-600 mb-6">
              Join thousands of candidates who have improved their interview skills
            </p>

            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start space-x-3 text-left"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <Link
              to="/demo"
              className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <Play className="mr-2 w-4 h-4" />
              Watch Demo
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CandidateSignupPage;
