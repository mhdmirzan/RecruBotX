import React from "react";

const ResumePreview = ({ resume }) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 font-sans text-sm leading-relaxed">
      {/* Header Section */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
          {resume.name || "Your Name"}
        </h1>
        <p className="text-lg text-gray-600 mt-1">
          {resume.role || "Job Title / Role"}
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-gray-700">
          {resume.email && <span>📧 {resume.email}</span>}
          {resume.phone && <span>📞 {resume.phone}</span>}
          {resume.address && <span>📍 {resume.address}</span>}
          {resume.linkedin && (
            <span>
              🔗{" "}
              <a
                href={resume.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                LinkedIn
              </a>
            </span>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-400 pb-1 mb-3">
            Professional Summary
          </h2>
          <p className="text-gray-700 text-justify">{resume.summary}</p>
        </div>
      )}

      {/* Skills */}
      {resume.skills && resume.skills.filter(Boolean).length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-400 pb-1 mb-3">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills
              .filter((skill) => skill.trim())
              .map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education &&
        resume.education.some((edu) => edu.degree || edu.institute) && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-400 pb-1 mb-3">
              Education
            </h2>
            {resume.education
              .filter((edu) => edu.degree || edu.institute)
              .map((edu, idx) => (
                <div key={idx} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-900">
                      {edu.degree || "Degree"}
                    </h3>
                    {edu.year && (
                      <span className="text-xs text-gray-600">{edu.year}</span>
                    )}
                  </div>
                  {edu.institute && (
                    <p className="text-gray-700 text-sm">{edu.institute}</p>
                  )}
                </div>
              ))}
          </div>
        )}

      {/* Experience */}
      {resume.experience &&
        resume.experience.some((exp) => exp.role || exp.company) && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-400 pb-1 mb-3">
              Professional Experience
            </h2>
            {resume.experience
              .filter((exp) => exp.role || exp.company)
              .map((exp, idx) => (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-900">
                      {exp.role || "Role"}
                    </h3>
                    {exp.duration && (
                      <span className="text-xs text-gray-600">
                        {exp.duration}
                      </span>
                    )}
                  </div>
                  {exp.company && (
                    <p className="text-gray-700 text-sm italic mb-1">
                      {exp.company}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-gray-700 text-sm text-justify">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}

      {/* Projects */}
      {resume.projects &&
        resume.projects.some((proj) => proj.title || proj.description) && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-400 pb-1 mb-3">
              Projects
            </h2>
            {resume.projects
              .filter((proj) => proj.title || proj.description)
              .map((proj, idx) => (
                <div key={idx} className="mb-3">
                  {proj.title && (
                    <h3 className="font-semibold text-gray-900">
                      {proj.title}
                    </h3>
                  )}
                  {proj.description && (
                    <p className="text-gray-700 text-sm text-justify">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}

      {/* Certifications */}
      {resume.certifications &&
        resume.certifications.filter(Boolean).length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-400 pb-1 mb-3">
              Certifications
            </h2>
            <ul className="list-disc list-inside space-y-1">
              {resume.certifications
                .filter((cert) => cert.trim())
                .map((cert, idx) => (
                  <li key={idx} className="text-gray-700">
                    {cert}
                  </li>
                ))}
            </ul>
          </div>
        )}

      {/* References */}
      {resume.references && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-400 pb-1 mb-3">
            References
          </h2>
          <p className="text-gray-700 text-sm">{resume.references}</p>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
