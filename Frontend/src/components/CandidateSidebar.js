import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    Search,
    Cog,
    LogOut
} from "lucide-react";
import { logoutUser } from "../utils/userDatabase";

const CandidateSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate("/candidate/signin");
    };

    const navItemClass = ({ isActive }) =>
        `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive
            ? "bg-[#0a2a5e]/10 text-[#0a2a5e]"
            : "text-gray-700 hover:bg-gray-100 hover:text-[#0a2a5e]"
        }`;

    return (
        <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0 z-20">
            {/* Logo */}
            <div className="mb-8 text-center flex-shrink-0">
                <h1 className="text-3xl font-bold text-[#0a2a5e]">RecruBotX</h1>
            </div>

            <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
                <NavLink to="/candidate/dashboard" className={navItemClass}>
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                </NavLink>

                <NavLink to="/candidate/jobs" className={navItemClass}>
                    <Briefcase className="w-5 h-5" /> Job Applications
                </NavLink>

                <NavLink to="/candidate/resume/choose-template" className={navItemClass}>
                    <FileText className="w-5 h-5" /> Create Resume
                </NavLink>

                <NavLink to="/candidate/analyze-resume" className={navItemClass}>
                    <Search className="w-5 h-5" /> CV Screening
                </NavLink>

                <NavLink to="/candidate/settings" className={navItemClass}>
                    <Cog className="w-5 h-5" /> Settings
                </NavLink>
            </nav>

            {/* Bottom Section - Logout */}
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
