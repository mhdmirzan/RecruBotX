import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    PlusCircle,
    TrendingUp,
    BarChart3,
    Cog,
    Camera,
    Eye,
    EyeOff,
    Check,
    X
} from "lucide-react";

const RecruiterSettings = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [recruiterData, setRecruiterData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        companyName: "",
        email: "",
        newPassword: "",
        confirmPassword: "",
        profileImage: null
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("recruiterUser");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setRecruiterData(user);
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                companyName: user.companyName || "",
                email: user.email || "",
                newPassword: "",
                confirmPassword: "",
                profileImage: user.profileImage || null
            });
        } else {
            navigate("/signin/recruiter");
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profileImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData.newPassword || formData.confirmPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                showToast("Passwords do not match!", "error");
                setIsLoading(false);
                return;
            }
            if (formData.newPassword.length < 6) {
                showToast("Password must be at least 6 characters!", "error");
                setIsLoading(false);
                return;
            }
        }

        const updatedUser = {
            ...recruiterData,
            firstName: formData.firstName,
            lastName: formData.lastName,
            companyName: formData.companyName,
            email: formData.email,
            profileImage: formData.profileImage
        };

        localStorage.setItem("recruiterUser", JSON.stringify(updatedUser));
        setRecruiterData(updatedUser);
        showToast("Settings saved successfully!", "success");
        setFormData(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
        setIsLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("recruiterUser");
        navigate("/signin/recruiter");
    };

    const getInitials = () => {
        if (formData.firstName && formData.lastName) {
            return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`;
        }
        return "R";
    };

    if (!recruiterData) return null;

    return (
        <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0 font-poppins">
            {/* Sidebar */}
            <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0">
                <div className="mb-8 text-center flex-shrink-0">
                    <h1 className="text-3xl font-bold text-blue-600">RecruBotX</h1>
                </div>

                <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
                    <NavLink to="/recruiter/dashboard" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`}><LayoutDashboard className="w-5 h-5" /> Dashboard</NavLink>
                    <NavLink to="/recruiter/job-posting" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`}><PlusCircle className="w-5 h-5" /> Job Posting</NavLink>
                    <NavLink to="/recruiter/ranking" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`}><TrendingUp className="w-5 h-5" /> Ranking</NavLink>
                    <NavLink to="/recruiter/evaluation" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`}><BarChart3 className="w-5 h-5" /> Evaluation</NavLink>
                    <NavLink to="/recruiter/settings" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`}><Cog className="w-5 h-5" /> Settings</NavLink>
                </nav>

                <div className="mt-auto flex-shrink-0">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md mt-4 font-semibold"><LogOut className="w-5 h-5" /> Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
                {/* Header */}
                <div className="mb-6 flex-shrink-0 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Recruiter Settings</h2>
                        <p className="text-gray-500 text-md mt-1">Manage your professional profile and account settings</p>
                    </div>

                    {/* User Profile - Top Right */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <h3 className="font-bold text-gray-800">{recruiterData.firstName} {recruiterData.lastName}</h3>
                            <p className="text-sm text-gray-500">{recruiterData.email}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
                            {formData.profileImage ? (
                                <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <>{formData.firstName.charAt(0)}{formData.lastName.charAt(0)}</>
                            )}
                        </div>
                    </div>
                </div>

                {/* Settings Form - Full Page Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
                        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
                            {/* Profile Picture Section */}
                            <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                                <div className="relative group">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg overflow-hidden">
                                        {formData.profileImage ? (
                                            <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            getInitials()
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-all"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Profile Picture</h3>
                                    <p className="text-sm text-gray-500 mt-1">Click the camera icon to upload a new photo</p>
                                </div>
                            </div>

                            {/* Full Name Section */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Company & Email Section */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">Company Name</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Change Password Section */}
                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-4">Change Password</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="block font-medium text-gray-700 mb-2">New Password</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleInputChange}
                                            placeholder="Enter new password"
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-11 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <label className="block font-medium text-gray-700 mb-2">Confirm Password</label>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Confirm new password"
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-11 text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-2 italic font-poppins">Leave blank if you don't want to change your password</p>
                            </div>

                            {/* Save Button */}
                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Toast Notification */}
                {toast.show && (
                    <div className={`fixed bottom-5 right-5 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce z-50 ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                        {toast.type === "success" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        {toast.message}
                    </div>
                )}
            </main>
        </div>
    );
};

export default RecruiterSettings;
