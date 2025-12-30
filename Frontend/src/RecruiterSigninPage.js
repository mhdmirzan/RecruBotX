import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Briefcase,
    CheckCircle
} from "lucide-react";
import recruiterHero from "./assets/images/general/image1.jpg";

const RecruiterSigninPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setError(""); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/api/recruiter/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Login failed");
            }

            // Store user data in localStorage
            localStorage.setItem("recruiterUser", JSON.stringify(data.user));

            alert("Login successful!");
            navigate("/recruiter/dashboard");
        } catch (error) {
            console.error("Login error:", error);
            setError(error.message || "Failed to login. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
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

                {/* Left Side - Signin Form */}
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
                                Recruiter Sign In
                            </h1>
                            <p className="text-gray-500">
                                Welcome back! Access your hiring dashboard
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

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

                            {/* Forgot Password */}
                            <div className="text-right">
                                <Link
                                    to="/forgot-password/recruiter"
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-2 rounded-lg font-medium flex items-center justify-center ${isLoading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                                    }`}
                            >
                                {isLoading ? "Signing In..." : "Sign In"}
                                {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Don't have an account?{" "}
                            <Link
                                to="/signup/recruiter"
                                className="text-indigo-600 hover:underline font-medium"
                            >
                                Sign up here
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

export default RecruiterSigninPage;
