import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Validation constants for minimum word counts
const WORD_COUNT_REQUIREMENTS = {
  summary: 30,           // Professional summary minimum
  educationDesc: 20,     // Education description minimum
  experienceDesc: 30,    // Experience description minimum
  projectDesc: 25,       // Project description minimum
};

// Helper function to count words
const countWords = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
};

// Helper function to validate resume content
const validateResume = (resume) => {
  const errors = [];

  // Check professional summary
  if (resume.summary) {
    const summaryWords = countWords(resume.summary);
    if (summaryWords < WORD_COUNT_REQUIREMENTS.summary) {
      errors.push(
        `Professional Summary: ${summaryWords} words (minimum ${WORD_COUNT_REQUIREMENTS.summary} required)`
      );
    }
  } else {
    errors.push("Professional Summary: Required field is empty");
  }

  // Check education descriptions
  if (Array.isArray(resume.education) && resume.education.length > 0) {
    resume.education.forEach((edu, idx) => {
      if (edu.degree || edu.institute) {
        if (!edu.description) {
          errors.push(`Education #${idx + 1}: Description is required`);
        } else {
          const descWords = countWords(edu.description);
          if (descWords < WORD_COUNT_REQUIREMENTS.educationDesc) {
            errors.push(
              `Education #${idx + 1} Description: ${descWords} words (minimum ${WORD_COUNT_REQUIREMENTS.educationDesc} required)`
            );
          }
        }
      }
    });
  }

  // Check experience descriptions
  if (Array.isArray(resume.experience) && resume.experience.length > 0) {
    resume.experience.forEach((exp, idx) => {
      if (exp.role || exp.company) {
        if (!exp.description) {
          errors.push(`Experience #${idx + 1}: Description is required`);
        } else {
          const descWords = countWords(exp.description);
          if (descWords < WORD_COUNT_REQUIREMENTS.experienceDesc) {
            errors.push(
              `Experience #${idx + 1} Description: ${descWords} words (minimum ${WORD_COUNT_REQUIREMENTS.experienceDesc} required)`
            );
          }
        }
      }
    });
  }

  // Check project descriptions
  if (Array.isArray(resume.projects) && resume.projects.length > 0) {
    resume.projects.forEach((proj, idx) => {
      if (proj.title) {
        if (!proj.description) {
          errors.push(`Project #${idx + 1}: Description is required`);
        } else {
          const descWords = countWords(proj.description);
          if (descWords < WORD_COUNT_REQUIREMENTS.projectDesc) {
            errors.push(
              `Project #${idx + 1} Description: ${descWords} words (minimum ${WORD_COUNT_REQUIREMENTS.projectDesc} required)`
            );
          }
        }
      }
    });
  }

  return errors;
};

const DownloadButton = () => {
  const [isValidating, setIsValidating] = useState(false);

  // Get resume data from the form (parent component passes through context or localStorage)
  const getResumeData = () => {
    try {
      // Try to get from sessionStorage or component state via window
      const stored = sessionStorage.getItem("currentResume");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error retrieving resume data:", error);
      return null;
    }
  };

  const downloadResume = async () => {
    try {
      setIsValidating(true);

      // Get resume data
      const resume = getResumeData();

      if (!resume || !resume.name) {
        alert("Please fill in at least your name before downloading.");
        setIsValidating(false);
        return;
      }

      // Validate content
      const errors = validateResume(resume);

      if (errors.length > 0) {
        const errorMessage = "Resume incomplete - Please fix the following:\n\n" +
          errors.map((err, idx) => `${idx + 1}. ${err}`).join("\n");
        alert(errorMessage);
        setIsValidating(false);
        return;
      }

      // Get the resume preview element
      const resumeElement = document.getElementById("resume-preview-content");

      if (!resumeElement) {
        alert("Please click Preview button first, then click Download PDF.");
        setIsValidating(false);
        return;
      }

      // Show loading state
      const button = document.querySelector("button[data-download-btn]");
      const originalText = button?.textContent;
      if (button) button.textContent = "Generating PDF...";

      // Capture the resume as canvas with higher quality
      const canvas = await html2canvas(resumeElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
        ignoreElements: () => false,
        height: resumeElement.scrollHeight, // Capture full height
        windowHeight: resumeElement.scrollHeight, // Ensure full window height
      });

      // A4 dimensions in mm (strict format)
      const A4_WIDTH = 210;
      const A4_HEIGHT = 297;
      const MARGIN = 10; // 10mm margins on all sides
      const CONTENT_WIDTH = A4_WIDTH - 2 * MARGIN; // 190mm
      const PAGE_HEIGHT = A4_HEIGHT - 2 * MARGIN; // 277mm per page

      // Convert canvas dimensions to mm (assuming 96 DPI)
      const DPI = 96;
      const MM_PER_INCH = 25.4;
      const canvasWidthMM = (canvas.width / DPI) * MM_PER_INCH;
      const canvasHeightMM = (canvas.height / DPI) * MM_PER_INCH;

      // Scale factor to fit content to A4 width
      const scaleFactor = CONTENT_WIDTH / canvasWidthMM;
      const scaledContentHeightMM = canvasHeightMM * scaleFactor;

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const imgData = canvas.toDataURL("image/png");

      // Calculate exact number of pages needed
      const totalPagesNeeded = Math.ceil(scaledContentHeightMM / PAGE_HEIGHT);
      let currentPosition = 0;

      // Add content to PDF pages
      for (let pageNum = 0; pageNum < totalPagesNeeded; pageNum++) {
        if (pageNum > 0) {
          pdf.addPage();
        }

        // Calculate height for this page
        const remainingHeight = scaledContentHeightMM - currentPosition;
        const pageContentHeight = Math.min(PAGE_HEIGHT, remainingHeight);

        // Calculate what portion of the canvas this page should show
        const canvasStartPixel = (currentPosition / scaledContentHeightMM) * canvas.height;
        const canvasPageHeightPixels = (pageContentHeight / scaledContentHeightMM) * canvas.height;

        // Create cropped canvas
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.ceil(canvasPageHeightPixels);

        const ctx = pageCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          Math.floor(canvasStartPixel),
          canvas.width,
          Math.ceil(canvasPageHeightPixels),
          0,
          0,
          canvas.width,
          Math.ceil(canvasPageHeightPixels)
        );

        const pageImgData = pageCanvas.toDataURL("image/png");
        pdf.addImage(
          pageImgData,
          "PNG",
          MARGIN,
          MARGIN,
          CONTENT_WIDTH,
          pageContentHeight
        );

        currentPosition += pageContentHeight;
      }

      // Download PDF with formatted filename
      const fileName = `Resume_${resume.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      // Restore button text
      if (button) button.textContent = originalText;
      setIsValidating(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
      setIsValidating(false);
    }
  };

  return (
    <button
      data-download-btn
      onClick={downloadResume}
      disabled={isValidating}
      className={`flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-semibold transition shadow-md ${isValidating
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
        }`}
    >
      {isValidating ? "Validating..." : "📥 Download PDF"}
    </button>
  );
};

export default DownloadButton;
