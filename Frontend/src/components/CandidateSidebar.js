import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Mic, FileText, Search, Cog, LogOut } from "lucide-react";
import { logoutUser, getCurrentUser } from "../utils/userDatabase";

const CandidateSidebar = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const handleLogout = () => {
        logoutUser();
        navigate("/signin/candidate");
    };

    const handleStartInterview = () => {
        navigate("/candidate/interview");
    };

    const handleCreateResume = () => {
        navigate("/candidate/resume/choose-template");
    };

    const handleCVScreening = () => {
        navigate("/candidate/analyze-resume");
    };

    return (
        <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0">
            {/* Logo */}
            <div className="mb-8 text-center flex-shrink-0">
                <h1 className="text-3xl font-bold text-blue-600">RecruBotX</h1>
            </div>

            <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
                <NavLink
                    to="/candidate/dashboard"
                    className={({ isActive }) =>
                        `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        }`
                    }
                >
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                </NavLink>

                <button
                    onClick={handleStartInterview}
                    className="font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 text-left"
                >
                    <Mic className="w-5 h-5" /> Start Interview
                </button>

                <button
                    onClick={handleCreateResume}
                    className="font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 text-left"
                >
                    <FileText className="w-5 h-5" /> Create Resume
                </button>

                <button
                    onClick={handleCVScreening}
                    className="font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 text-left"
                >
                    <Search className="w-5 h-5" /> CV Screening
                </button>

                <NavLink
                    to="/candidate/settings"
                    className={({ isActive }) =>
                        `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        }`
                    }
                >
                    <Cog className="w-5 h-5" /> Settings
                </NavLink>
            </nav>

            {/* Bottom Section - Logout Only */}
            <div className="mt-auto flex-shrink-0">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md"
                >
                    <LogOut className="w-5 h-5" /> Logout
                </button>
            </div>
        </aside>
    );
};

export default CandidateSidebar;
