import React, { useState } from "react";

const Elegant = ({ resume: initialResume = {} }) => {
  const [resume, setResume] = useState({
    personal: {
      name: "",
      role: "",
      email: "",
      phone: "",
      linkedin: "",
      photo: null,
      ...initialResume.personal,
    },
    summary: "",
    skills: [],
    languages: [],
    references: [],
    education: [],
    experience: [],
    projects: [],
    certificates: [],
  });

  const updatePersonal = (k, v) =>
    setResume({ ...resume, personal: { ...resume.personal, [k]: v } });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResume({
      ...resume,
      personal: { ...resume.personal, photo: URL.createObjectURL(file) },
    });
  };

  const addEducation = () =>
    setResume({
      ...resume,
      education: [
        ...resume.education,
        { institute: "", degree: "", year: "" },
      ],
    });

  const addExperience = () =>
    setResume({
      ...resume,
      experience: [
        ...resume.experience,
        { company: "", role: "", duration: "", description: "" },
      ],
    });

  const addProject = () =>
    setResume({
      ...resume,
      projects: [...resume.projects, { title: "", description: "" }],
    });

  const addCertificate = () =>
    setResume({
      ...resume,
      certificates: [...resume.certificates, { name: "", issuer: "", year: "" }],
    });

  return (
    <div className="grid grid-cols-2 h-screen font-sans">

      {/* ================= LEFT : BUILDER ================= */}
      <div className="p-6 overflow-y-auto border-r bg-white">

        <Section title="Profile Photo">
          <input type="file" accept="image/*" onChange={handlePhotoUpload} />
        </Section>

        <Section title="Personal Details">
          <Input placeholder="Full Name" onChange={(e) => updatePersonal("name", e.target.value)} />
          <Input placeholder="Job Title" onChange={(e) => updatePersonal("role", e.target.value)} />
          <Input placeholder="Email" onChange={(e) => updatePersonal("email", e.target.value)} />
          <Input placeholder="Phone" onChange={(e) => updatePersonal("phone", e.target.value)} />
          <Input placeholder="LinkedIn" onChange={(e) => updatePersonal("linkedin", e.target.value)} />
        </Section>

        <Section title="About Me">
          <textarea
            className="input h-24"
            onChange={(e) => setResume({ ...resume, summary: e.target.value })}
          />
        </Section>

        <Section title="Skills">
          <Input
            placeholder="Type skill & press Enter"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setResume({ ...resume, skills: [...resume.skills, e.target.value] });
                e.target.value = "";
              }
            }}
          />
        </Section>

        <Section title="Languages">
          <Input
            placeholder="Type language & press Enter"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setResume({ ...resume, languages: [...resume.languages, e.target.value] });
                e.target.value = "";
              }
            }}
          />
        </Section>

        {/* ===== EDUCATION ===== */}
        <Section title="Education">
          {resume.education.map((edu, i) => (
            <div key={i} className="border p-3 mb-3 rounded">
              <Input placeholder="Institute" onChange={(e) => edu.institute = e.target.value} />
              <Input placeholder="Degree" onChange={(e) => edu.degree = e.target.value} />
              <Input placeholder="Year" onChange={(e) => edu.year = e.target.value} />
            </div>
          ))}
          <AddButton onClick={addEducation}>+ Add Education</AddButton>
        </Section>

        {/* ===== EXPERIENCE ===== */}
        <Section title="Experience">
          {resume.experience.map((exp, i) => (
            <div key={i} className="border p-3 mb-3 rounded">
              <Input placeholder="Company" onChange={(e) => exp.company = e.target.value} />
              <Input placeholder="Role" onChange={(e) => exp.role = e.target.value} />
              <Input placeholder="Duration" onChange={(e) => exp.duration = e.target.value} />
              <textarea
                className="input h-20"
                placeholder="Description"
                onChange={(e) => exp.description = e.target.value}
              />
            </div>
          ))}
          <AddButton onClick={addExperience}>+ Add Experience</AddButton>
        </Section>

        {/* ===== PROJECTS ===== */}
        <Section title="Projects">
          {resume.projects.map((p, i) => (
            <div key={i} className="border p-3 mb-3 rounded">
              <Input placeholder="Project Title" onChange={(e) => p.title = e.target.value} />
              <textarea
                className="input h-20"
                placeholder="Description"
                onChange={(e) => p.description = e.target.value}
              />
            </div>
          ))}
          <AddButton onClick={addProject}>+ Add Project</AddButton>
        </Section>

        {/* ===== CERTIFICATES ===== */}
        <Section title="Certificates">
          {resume.certificates.map((c, i) => (
            <div key={i} className="border p-3 mb-3 rounded">
              <Input placeholder="Certificate Name" onChange={(e) => c.name = e.target.value} />
              <Input placeholder="Issuer" onChange={(e) => c.issuer = e.target.value} />
              <Input placeholder="Year" onChange={(e) => c.year = e.target.value} />
            </div>
          ))}
          <AddButton onClick={addCertificate}>+ Add Certificate</AddButton>
        </Section>
      </div>

      {/* ================= RIGHT : PREVIEW ================= */}
      <div className="bg-gray-100 p-6 overflow-y-auto">

        <div className="w-[794px] min-h-[1123px] mx-auto bg-white shadow-lg">
          <div className="grid grid-cols-[260px_1fr] min-h-[1123px]">

            {/* ===== SIDEBAR ===== */}
            <aside className="bg-slate-200 px-6 py-8">

              {resume.personal.photo && (
                <img src={resume.personal.photo} className="w-28 h-28 rounded-full mx-auto mb-6" />
              )}

              <PreviewSection title="Education">
                {resume.education.map((e, i) => (
                  <p key={i} className="text-sm mb-2">
                    <strong>{e.degree}</strong><br />
                    {e.institute}<br />
                    {e.year}
                  </p>
                ))}
              </PreviewSection>

              <PreviewSection title="Skills">
                <ul className="list-disc ml-4 text-sm">
                  {resume.skills.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </PreviewSection>

              <PreviewSection title="Languages">
                {resume.languages.map((l, i) => <p key={i}>{l}</p>)}
              </PreviewSection>
            </aside>

            {/* ===== MAIN ===== */}
            <main className="px-10 py-8">

              <h1 className="text-4xl font-bold uppercase">{resume.personal.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{resume.personal.role}</p>

              <PreviewSection title="About Me">
                <p className="text-sm">{resume.summary}</p>
              </PreviewSection>

              <PreviewSection title="Work Experience">
                {resume.experience.map((e, i) => (
                  <div key={i} className="mb-3">
                    <strong>{e.role}</strong> — {e.company}<br />
                    <em>{e.duration}</em>
                    <p className="text-sm">{e.description}</p>
                  </div>
                ))}
              </PreviewSection>

              <PreviewSection title="Projects">
                {resume.projects.map((p, i) => (
                  <p key={i}><strong>{p.title}</strong>: {p.description}</p>
                ))}
              </PreviewSection>

              <PreviewSection title="Certificates">
                {resume.certificates.map((c, i) => (
                  <p key={i}>{c.name} — {c.issuer} ({c.year})</p>
                ))}
              </PreviewSection>

            </main>
          </div>
        </div>

        <div className="text-center mt-6">
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Download Resume
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= HELPERS ================= */

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="font-semibold mb-2">{title}</h2>
    {children}
  </div>
);

const PreviewSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xs font-bold uppercase border-b mb-2">{title}</h3>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} className="w-full mb-2 border px-3 py-2 rounded" />
);

const AddButton = ({ children, ...props }) => (
  <button {...props} className="text-blue-600 font-semibold">{children}</button>
);

export default Elegant;
