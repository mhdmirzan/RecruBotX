import React, { useState } from "react";
import ResumePreview from "../components/ResumePreview";
import DownloadButton from "../components/DownloadButton";

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    <div className="space-y-3">{children}</div>
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

const AddButton = ({ onClick, label }) => (
  <button
    onClick={onClick}
    className="text-sm font-medium text-blue-600 hover:underline"
  >
    + {label}
  </button>
);

const ResumeBuilder = () => {
  const [resume, setResume] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    summary: "",
    skills: [""],
    education: [{ degree: "", institute: "", year: "" }],
    experience: [{ role: "", company: "", duration: "", description: "" }],
    projects: [{ title: "", description: "" }],
    certifications: [""],
    references: "",
  });

  // Get selected template from localStorage safely
  const selectedTemplate =
    localStorage.getItem("selectedTemplate") || "modern";

  const handleChange = (e) =>
    setResume({ ...resume, [e.target.name]: e.target.value });

  const handleArrayChange = (section, index, field, value) => {
    const updated = [...resume[section]];
    if (!updated[index]) updated[index] = {};
    updated[index][field] = value;
    setResume({ ...resume, [section]: updated });
  };

  const addItem = (section, item) =>
    setResume({ ...resume, [section]: [...resume[section], item] });

  // Safe resume object for preview to avoid undefined errors
  const safeResume = {
    name: resume.name || "",
    role: resume.role || "",
    email: resume.email || "",
    phone: resume.phone || "",
    address: resume.address || "",
    linkedin: resume.linkedin || "",
    summary: resume.summary || "",
    skills: Array.isArray(resume.skills) ? resume.skills : [],
    education: Array.isArray(resume.education) ? resume.education : [],
    experience: Array.isArray(resume.experience) ? resume.experience : [],
    projects: Array.isArray(resume.projects) ? resume.projects : [],
    certifications: Array.isArray(resume.certifications) ? resume.certifications : [],
    references: resume.references || "",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-10 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Resume Builder</h1>
        <DownloadButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
        {/* LEFT – FORM */}
        <div className="space-y-6 overflow-y-auto max-h-[88vh] pr-2">
          <Section title="Personal Information">
            <Input name="name" placeholder="Full Name" onChange={handleChange} />
            <Input name="role" placeholder="Job Title / Role" onChange={handleChange} />
            <Input name="email" placeholder="Email" onChange={handleChange} />
            <Input name="phone" placeholder="Phone" onChange={handleChange} />
            <Input name="address" placeholder="Address" onChange={handleChange} />
            <Input name="linkedin" placeholder="LinkedIn Profile" onChange={handleChange} />
          </Section>

          <Section title="Professional Summary">
            <Textarea
              name="summary"
              rows="4"
              placeholder="Brief summary highlighting your strengths..."
              onChange={handleChange}
            />
          </Section>

          <Section title="Skills">
            {safeResume.skills.map((skill, i) => (
              <Input
                key={i}
                value={skill}
                placeholder={`Skill ${i + 1}`}
                onChange={(e) => {
                  const skills = [...safeResume.skills];
                  skills[i] = e.target.value;
                  setResume({ ...resume, skills });
                }}
              />
            ))}
            <AddButton label="Add Skill" onClick={() => addItem("skills", "")} />
          </Section>

          <Section title="Education">
            {safeResume.education.map((edu, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Degree" onChange={(e) =>
                  handleArrayChange("education", i, "degree", e.target.value)
                } />
                <Input placeholder="Institute" onChange={(e) =>
                  handleArrayChange("education", i, "institute", e.target.value)
                } />
                <Input placeholder="Year" onChange={(e) =>
                  handleArrayChange("education", i, "year", e.target.value)
                } />
              </div>
            ))}
            <AddButton label="Add Education" onClick={() =>
              addItem("education", { degree: "", institute: "", year: "" })
            } />
          </Section>

          <Section title="Experience">
            {safeResume.experience.map((exp, i) => (
              <div key={i} className="space-y-2">
                <Input placeholder="Role" onChange={(e) =>
                  handleArrayChange("experience", i, "role", e.target.value)
                } />
                <Input placeholder="Company" onChange={(e) =>
                  handleArrayChange("experience", i, "company", e.target.value)
                } />
                <Input placeholder="Duration" onChange={(e) =>
                  handleArrayChange("experience", i, "duration", e.target.value)
                } />
                <Textarea placeholder="What did you achieve?" rows="3"
                  onChange={(e) =>
                    handleArrayChange("experience", i, "description", e.target.value)
                  }
                />
              </div>
            ))}
            <AddButton label="Add Experience" onClick={() =>
              addItem("experience", { role: "", company: "", duration: "", description: "" })
            } />
          </Section>

          <Section title="Projects">
            {safeResume.projects.map((proj, i) => (
              <div key={i} className="space-y-2">
                <Input placeholder="Project Title" onChange={(e) =>
                  handleArrayChange("projects", i, "title", e.target.value)
                } />
                <Textarea placeholder="Project Description" rows="3"
                  onChange={(e) =>
                    handleArrayChange("projects", i, "description", e.target.value)
                  }
                />
              </div>
            ))}
            <AddButton label="Add Project" onClick={() =>
              addItem("projects", { title: "", description: "" })
            } />
          </Section>

          <Section title="Certifications">
            {safeResume.certifications.map((c, i) => (
              <Input
                key={i}
                placeholder={`Certification ${i + 1}`}
                onChange={(e) => {
                  const certs = [...safeResume.certifications];
                  certs[i] = e.target.value;
                  setResume({ ...resume, certifications: certs });
                }}
              />
            ))}
            <AddButton label="Add Certification" onClick={() =>
              addItem("certifications", "")
            } />
          </Section>

          <Section title="References (Optional)">
            <Textarea
              name="references"
              rows="2"
              placeholder="Available upon request"
              onChange={handleChange}
            />
          </Section>
        </div>

        {/* RIGHT – PREVIEW */}
        <div className="bg-white rounded-2xl shadow border p-6 overflow-y-auto max-h-[88vh]">
          <ResumePreview resume={safeResume} template={selectedTemplate} />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
