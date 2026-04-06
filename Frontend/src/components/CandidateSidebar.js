import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    Search,
    Cog,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { logoutUser, getCurrentUser } from "../utils/userDatabase";
import Logo from "./Logo";

const TOUR_KEY = "candidate_tour_done";
const SIDEBAR_COLLAPSE_KEY = "candidate_sidebar_collapsed";

const CandidateSidebar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "true";
        } catch {
            return false;
        }
    });

    useEffect(() => {
        setUser(getCurrentUser());
        const syncUser = () => setUser(getCurrentUser());
        window.addEventListener("storage", syncUser);
        return () => window.removeEventListener("storage", syncUser);
    }, []);

    useEffect(() => {
        localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(isCollapsed));
    }, [isCollapsed]);

    // Fire first-login tour once
    useEffect(() => {
        if (!localStorage.getItem(TOUR_KEY)) {
            // Small delay so the dashboard has time to mount
            const t = setTimeout(() => {
                window.dispatchEvent(new CustomEvent("rbx:start-tour"));
            }, 400);
            return () => clearTimeout(t);
        }
    }, []);

    const handleLogout = () => {
        logoutUser();
        navigate("/candidate/signin");
    };

    const navItemClass = ({ isActive }) =>
        `group relative font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isCollapsed ? "justify-center" : ""} ${isActive
            ? "bg-[#0a2a5e]/10 text-[#0a2a5e]"
            : "text-gray-700 hover:bg-gray-100 hover:text-[#0a2a5e]"
        }`;

    return (
        <aside className={`${isCollapsed ? "w-20" : "w-64"} h-screen bg-white shadow-xl flex flex-col ${isCollapsed ? "p-4" : "p-6"} border-r border-gray-200 flex-shrink-0 z-20 transition-all duration-200 relative`}>
            <div className="flex items-center justify-center mb-6 flex-shrink-0 relative">
                <Logo className={isCollapsed ? "h-9 w-9" : "h-11 w-auto"} variant={isCollapsed ? "letter" : "full"} />
                {!isCollapsed && (
                    <button
                        type="button"
                        onClick={() => setIsCollapsed((prev) => !prev)}
                        className={`transition-all absolute right-0 p-1 text-gray-400 hover:text-[#0a2a5e] rounded-lg`}
                        aria-label="Collapse sidebar"
                    >
                        <ChevronLeft className="w-4 h-4 -mr-10" />
                    </button>
                )}
            </div>
            {isCollapsed && (
                <button
                    type="button"
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className="absolute -right-5 top-6 p-1 text-gray-400 hover:text-[#0a2a5e] rounded-lg transition-all z-50"
                    aria-label="Expand sidebar"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}

            <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
                <NavLink data-tour="c-dashboard" to="/candidate/dashboard" className={navItemClass}>
                    <LayoutDashboard className={isCollapsed ? "w-7 h-7" : "w-5 h-5"} />
                    {!isCollapsed && <span>Dashboard</span>}
                    {isCollapsed && (
                        <span className="absolute left-full ml-3 px-2 py-1 text-xs bg-[#0a2a5e] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                            Dashboard
                        </span>
                    )}
                </NavLink>

                <NavLink data-tour="c-jobs" to="/candidate/jobs" className={navItemClass}>
                    <Briefcase className={isCollapsed ? "w-7 h-7" : "w-5 h-5"} />
                    {!isCollapsed && <span>Job Vacancies</span>}
                    {isCollapsed && (
                        <span className="absolute left-full ml-3 px-2 py-1 text-xs bg-[#0a2a5e] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                            Job Vacancies
                        </span>
                    )}
                </NavLink>

                <NavLink data-tour="c-resume" to="/candidate/resume/choose-template" className={navItemClass}>
                    <FileText className={isCollapsed ? "w-7 h-7" : "w-5 h-5"} />
                    {!isCollapsed && <span>Create Resume</span>}
                    {isCollapsed && (
                        <span className="absolute left-full ml-3 px-2 py-1 text-xs bg-[#0a2a5e] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                            Create Resume
                        </span>
                    )}
                </NavLink>

                <NavLink data-tour="c-cv-review" to="/candidate/analyze-resume" className={navItemClass}>
                    <Search className={isCollapsed ? "w-7 h-7" : "w-5 h-5"} />
                    {!isCollapsed && <span>Resume Analyzer</span>}
                    {isCollapsed && (
                        <span className="absolute left-full ml-3 px-2 py-1 text-xs bg-[#0a2a5e] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                            Resume Analyzer
                        </span>
                    )}
                </NavLink>

                <NavLink data-tour="c-settings" to="/candidate/settings" className={navItemClass}>
                    <Cog className={isCollapsed ? "w-7 h-7" : "w-5 h-5"} />
                    {!isCollapsed && <span>Settings</span>}
                    {isCollapsed && (
                        <span className="absolute left-full ml-3 px-2 py-1 text-xs bg-[#0a2a5e] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                            Settings
                        </span>
                    )}
                </NavLink>
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto flex-shrink-0 space-y-2">
                {user && (
                    <div className={`flex items-center gap-3 bg-gray-100 rounded-xl ${isCollapsed ? "px-2 py-2 justify-center" : "px-3 py-2.5"}`}>
                        <div className="w-10 h-10 bg-[#0a2a5e] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                            {user.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</>
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0">
                                <p className="font-bold text-[#0a2a5e] text-sm truncate">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                        )}
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className={`group relative w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all ${isCollapsed ? "px-1.5 py-1.5" : "px-2 py-2"}`}
                >
                    <LogOut className={isCollapsed ? "w-6 h-6" : "w-5 h-5"} />
                    {!isCollapsed && <span>Logout</span>}
                    {isCollapsed && (
                        <span className="absolute left-full ml-3 px-2 py-1 text-xs bg-[#0a2a5e] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                            Logout
                        </span>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default CandidateSidebar;
