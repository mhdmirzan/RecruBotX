// src/pages/AnalyzeResume.jsx
import React, { useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";

const AnalyzeResume = () => {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleAnalyze = async () => {
    setError("");
    setAnalysis(null);
    if (!file) {
      setError("Please upload a CV file (.pdf or .docx).");
      return;
    }

    // If job description empty, confirm
    if (!jobDesc.trim()) {
      const ok = window.confirm("No job description provided. Continue with resume-only analysis?");
      if (!ok) return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      if (jobDesc.trim()) {
        fd.append("job_description", jobDesc);
      }

      const res = await fetch("http://localhost:8000/api/v1/candidate/analyze-resume", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const payload = await res.json();

      // Backend returns: { message, cv_filename, job_description_source, analysis }
      // analysis contains: { formatted_analysis }
      if (payload && payload.error) {
        throw new Error(payload.error);
      }

      const analysisData = payload.analysis || {};
      
      setAnalysis(analysisData.formatted_analysis || analysisData.raw_analysis || "No analysis available");
    } catch (err) {
      console.error("Analyze error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex justify-center items-start px-4 py-10">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">CV Screening & Job Match Analyzer</h1>
        <p className="text-center text-gray-500 mb-6">Upload your resume and paste the job description to analyze compatibility.</p>

        {/* Upload */}
        <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 flex flex-col items-center justify-center mb-4 hover:bg-blue-50 transition">
          <Upload className="w-10 h-10 text-blue-600 mb-3" />
          <input id="fileUpload" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
          <label htmlFor="fileUpload" className="cursor-pointer text-blue-600 font-medium hover:underline">
            {file ? file.name : "Click to upload your CV (.pdf / .docx)"}
          </label>
        </div>

        {/* Job description */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Job Description (optional)</label>
          <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} className="w-full p-3 rounded border h-40" placeholder="Paste the job description here..." />
        </div>

        <div className="flex gap-4">
          <button onClick={handleAnalyze} disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin w-5 h-5" /> Analyzing...</> : <><FileText className="w-5 h-5" /> Analyze Resume</>}
          </button>
        </div>

        {error && <div className="mt-4 text-red-600">{error}</div>}

        {/* Results */}
        {analysis && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">AI Analysis Results</h2>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg mb-6">
              <div className="prose prose-lg max-w-none text-gray-800 leading-loose" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: '1.8' }}>
                <div dangerouslySetInnerHTML={{ 
                  __html: typeof analysis === 'string' 
                    ? analysis
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '• $1')
                        .replace(/\n\n/g, '</p><p class="mb-4">')
                        .replace(/\n/g, '<br><br>')
                        .replace(/^(.*)$/, '<p class="mb-4">$1</p>')
                    : JSON.stringify(analysis, null, 2)
                }} />
              </div>
            </div>

            <div className="grid gap-12 mt-10 md:grid-cols-2">
              {analysis.professional_summary && (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 md:col-span-2 mb-4">
                  <h3 className="text-lg font-semibold text-blue-700 mb-4">Professional Summary</h3>
                  <div className="text-sm text-gray-700 leading-loose" 
                       style={{ lineHeight: '1.8' }}
                       dangerouslySetInnerHTML={{ 
                         __html: analysis.professional_summary
                           .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                           .replace(/\*(.*?)\*/g, '• $1')
                           .replace(/\n/g, '<br><br>')
                       }} />
                </div>
              )}

              {analysis.core_strengths && (
                <div className="bg-green-50 p-6 rounded-xl border border-green-200 mb-4">
                  <h3 className="text-lg font-semibold text-green-700 mb-4">Core Strengths</h3>
                  <div className="text-sm text-gray-700 leading-loose" 
                       style={{ lineHeight: '1.8' }}
                       dangerouslySetInnerHTML={{ 
                         __html: analysis.core_strengths
                           .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                           .replace(/\*(.*?)\*/g, '• $1')
                           .replace(/\n/g, '<br><br>')
                       }} />
                </div>
              )}

              {analysis.role_recommendations && (
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 mb-4">
                  <h3 className="text-lg font-semibold text-purple-700 mb-4">Recommended Roles</h3>
                  <div className="text-sm text-gray-700 leading-loose" 
                       style={{ lineHeight: '1.8' }}
                       dangerouslySetInnerHTML={{ 
                         __html: analysis.role_recommendations
                           .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                           .replace(/\*(.*?)\*/g, '• $1')
                           .replace(/\n/g, '<br><br>')
                       }} />
                </div>
              )}

              {analysis.skill_gaps && (
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 mb-4">
                  <h3 className="text-lg font-semibold text-yellow-700 mb-4">Skill Gaps</h3>
                  <div className="text-sm text-gray-700 leading-loose" 
                       style={{ lineHeight: '1.8' }}
                       dangerouslySetInnerHTML={{ 
                         __html: analysis.skill_gaps
                           .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                           .replace(/\*(.*?)\*/g, '• $1')
                           .replace(/\n/g, '<br><br>')
                       }} />
                </div>
              )}

              {analysis.next_steps && (
                <div className="bg-pink-50 p-6 rounded-xl border border-pink-200 mb-4">
                  <h3 className="text-lg font-semibold text-pink-700 mb-4">Next Steps</h3>
                  <div className="text-sm text-gray-700 leading-loose" 
                       style={{ lineHeight: '1.8' }}
                       dangerouslySetInnerHTML={{ 
                         __html: analysis.next_steps
                           .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                           .replace(/\*(.*?)\*/g, '• $1')
                           .replace(/\n/g, '<br><br>')
                       }} />
                </div>
              )}

              {analysis.raw_analysis && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 md:col-span-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Full Analysis</h3>
                  <div className="text-sm text-gray-700 leading-loose" 
                       style={{ lineHeight: '1.8' }}
                       dangerouslySetInnerHTML={{ 
                         __html: analysis.raw_analysis
                           .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                           .replace(/\*(.*?)\*/g, '• $1')
                           .replace(/\n/g, '<br><br>')
                       }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzeResume;
