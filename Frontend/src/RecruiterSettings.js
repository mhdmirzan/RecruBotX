import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Settings,
    LogOut,
    PlusCircle,
    TrendingUp,
    BarChart3,
    User,
    Mail,
    Building2,
    Globe,
    Phone,
    Check,
    X,
    Cog,
    Camera
} from "lucide-react";

const RecruiterSettings = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [recruiterData, setRecruiterData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        companyName: "",
        companyWebsite: "",
        phone: "",
        profileImage: null,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        // Get recruiter data from localStorage
        const storedUser = localStorage.getItem("recruiterUser");
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setRecruiterData(userData);
            setFormData({
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                email: userData.email || "",
                companyName: userData.companyName || "",
                companyWebsite: userData.companyWebsite || "",
                phone: userData.phone || "",
                profileImage: userData.profileImage || null,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } else {
            navigate("/signin/recruiter");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("recruiterUser");
        navigate("/recruiter");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Show toast notification
    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
    };

    // Handle Image Upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profileImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    // Get initials for avatar
    const getInitials = () => {
        if (formData.firstName && formData.lastName) {
            return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`;
        }
        return "U";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate password fields if user is trying to change password
        if (formData.newPassword || formData.confirmPassword) {
            if (!formData.currentPassword) {
                showToast("Please enter your current password to change it", "error");
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                showToast("New passwords don't match", "error");
                return;
            }
            if (formData.newPassword.length < 6) {
                showToast("New password must be at least 6 characters", "error");
                return;
            }
        }

        setIsLoading(true);

        try {
            // Call backend API to update profile
            const response = await fetch(`http://localhost:8000/api/recruiter/profile/${recruiterData.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    companyName: formData.companyName,
                    companyWebsite: formData.companyWebsite,
                    phone: formData.phone,
                    profileImage: formData.profileImage
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to update profile");
            }

            // Update localStorage with new data
            localStorage.setItem("recruiterUser", JSON.stringify(data.user));
            setRecruiterData(data.user);
            showToast("Settings saved successfully!", "success");

            // Clear password fields
            setFormData({
                ...formData,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error) {
            console.error("Update error:", error);
            showToast(error.message || "Failed to update profile. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (!recruiterData) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
            {/* Sidebar - Matching Dashboard Style */}
            <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0">

                {/* Logo */}
                <div className="mb-8 text-center flex-shrink-0">
                    <h1 className="text-3xl font-bold text-blue-600">RecruBotX</h1>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
                    <NavLink
                        to="/recruiter/dashboard"
                        className={({ isActive }) =>
                            `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                            }`
                        }
                    >
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </NavLink>

                    <NavLink
                        to="/recruiter/job-posting"
                        className={({ isActive }) =>
                            `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                            }`
                        }
                    >
                        <PlusCircle className="w-5 h-5" /> Job Posting
                    </NavLink>

                    <NavLink
                        to="/recruiter/ranking"
                        className={({ isActive }) =>
                            `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                            }`
                        }
                    >
                        <TrendingUp className="w-5 h-5" /> Ranking
                    </NavLink>

                    <NavLink
                        to="/recruiter/evaluation"
                        className={({ isActive }) =>
                            `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                            }`
                        }
                    >
                        <BarChart3 className="w-5 h-5" /> Evaluation
                    </NavLink>

                    <NavLink
                        to="/recruiter/settings"
                        className={({ isActive }) =>
                            `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                            }`
                        }
                    >
                        <Cog className="w-5 h-5" /> Settings
                    </NavLink>
                </nav>

                {/* Bottom Section - Logout Button Only */}
                <div className="mt-auto flex-shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md"
                    >
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content - Non-scrollable container */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden py-6 px-10">

                {/* Header with User Profile */}
                <div className="mb-4 flex-shrink-0 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Account Settings</h2>
                        <p className="mt-1 text-gray-500 text-md py-4">Manage your profile and account preferences</p>
                    </div>

                    {/* User Profile - Top Right */}
                    <div className="flex items-center gap-3">

                        <div className="text-right">
                            <h3 className="font-bold text-gray-800">
                                {recruiterData.firstName} {recruiterData.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">{recruiterData.email}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
                            {recruiterData.profileImage ? (
                                <img src={recruiterData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <>{recruiterData.firstName?.charAt(0)}{recruiterData.lastName?.charAt(0)}</>
                            )}
                        </div>
                    </div>
                </div>

                {/* Settings Form - Scrollable Content Area */}
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

                            {/* Personal Information */}
                            <div className="pb-6 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-blue-600" />
                                    Personal Information
                                </h3>
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

                                <div className="mt-4">
                                    <label className="block font-medium text-gray-700 mb-2 flex items-center">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Email Address
                                    </label>
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

                            {/* Company Information */}
                            <div className="pb-6 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                    <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                                    Company Information
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Your Company Name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2 flex items-center">
                                            <Globe className="w-4 h-4 mr-2" />
                                            Company Website
                                        </label>
                                        <input
                                            type="url"
                                            name="companyWebsite"
                                            value={formData.companyWebsite}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="https://example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2 flex items-center">
                                            <Phone className="w-4 h-4 mr-2" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Change Password */}
                            <div className="pb-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Change Password</h3>
                                <p className="text-sm text-gray-500 mb-4">Leave blank if you don't want to change your password</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-2">New Password</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                placeholder="Enter new password"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-medium text-gray-700 mb-2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </main>

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-5 right-5 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                    }`}>
                    {toast.type === "success" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default RecruiterSettings;
