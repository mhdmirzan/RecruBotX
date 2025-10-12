import React, { useState } from "react";

const CandidateSettings = () => {
  const [formData, setFormData] = useState({
    fullName: "Fatima Nadeem",
    email: "fatima@example.com",
    password: "",
    notifications: true,
    profilePic: null,
  });

  const [toast, setToast] = useState(false);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, profilePic: URL.createObjectURL(files[0]) });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // Handle Save
  const handleSubmit = (e) => {
    e.preventDefault();
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-10">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        {/* Title */}
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          Account Settings
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <img
              src={formData.profilePic || "https://via.placeholder.com/100"}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border shadow"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="text-sm text-gray-600"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-medium mb-2">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium mb-2">Change Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <span className="font-medium">📩 Email Notifications</span>
            <input
              type="checkbox"
              name="notifications"
              checked={formData.notifications}
              onChange={handleChange}
              className="w-5 h-5 accent-blue-600"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Save Settings
          </button>
        </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg animate-bounce">
           Settings saved successfully!
        </div>
      )}
    </div>
  );
};

export default CandidateSettings;
