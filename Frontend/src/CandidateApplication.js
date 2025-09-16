import React, { useState } from "react";

const CandidateApplication = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    linkedin: "",
    resume: null,
    terms: false,
  });

  const [toast, setToast] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, resume: files[0] });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.terms) {
      alert("⚠️ Please agree to the Candidate Terms of Use.");
      return;
    }
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white shadow-xl rounded-2xl p-8">
        {/* Job Overview */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Full-Time — Employment Type
        </h1>
        <p className="text-gray-600 mb-6">
          Interviewer.AI is a video interviewing platform that enables
          companies to assess candidates for soft skills, personality traits,
          and culture fit before inviting them for an in-person interview. The
          platform allows companies to screen candidates faster with human
          accuracy, without wasting time and effort of their HR department.
        </p>
        <p className="text-gray-600 mb-6">
          Glad to hear you would like to join our innovation solution with us.
          We aim to bring explainable and conversational AI hiring solutions to
          companies, putting an extra value to help cover your business needs.
        </p>
        <p className="text-gray-600 mb-6">
          We aim for optimization and efficiency in remote hiring, saving time
          and resources in pre-interviewing and shortlisting candidates.
        </p>
        <p className="text-gray-600 mb-6">
          For the candidates, we are preparing them for the world of Virtual
          Interviews! You can learn from your introduction video and look
          forward to our new launches:
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
          <li>Mock Interviews</li>
          <li>Digital Profile</li>
          <li>Job Recommendations world-wide</li>
          <li>Job preparation techniques</li>
        </ul>
        <p className="text-gray-600 mb-6">
          We appreciate your time and look forward to a long and fruitful
          relationship! <br />
          Feel free to reach us at{" "}
          <span className="text-blue-600">support@recrubotx.com</span> for any
          questions.
        </p>

        {/* Application Form */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          📝 Application Form
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block font-medium mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="your_email@example.com"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block font-medium mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <label className="block font-medium mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-medium mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 234 567 890"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block font-medium mb-2">
              LinkedIn Profile (Optional)
            </label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://www.linkedin.com/in/username"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block font-medium mb-2">
              Resume (PDF, DOC, DOCX only){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="resume"
              accept=".pdf,.doc,.docx"
              required
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg bg-gray-50"
            />
            {formData.resume && (
              <p className="mt-2 text-sm text-gray-500">
                Uploaded: {formData.resume.name}
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              className="w-5 h-5 accent-blue-600"
              required
            />
            <span className="text-gray-700 text-sm">
              By submitting this form, you agree with{" "}
              <span className="text-blue-600 underline cursor-pointer">
                Recrubotx Candidate Terms of Use
              </span>
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            🚀 Submit Application
          </button>
        </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg animate-bounce">
          ✅ Application submitted successfully!
        </div>
      )}
    </div>
  );
};

export default CandidateApplication;


