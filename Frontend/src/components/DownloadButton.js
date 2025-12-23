import React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const DownloadButton = () => {
  const downloadResume = async () => {
    try {
      // Get the resume preview element
      const resumeElement = document.querySelector(".bg-white.rounded-2xl.shadow.border.p-6");
      
      if (!resumeElement) {
        alert("Resume preview not found. Please fill in your details first.");
        return;
      }

      // Show loading state
      const button = document.querySelector("button");
      const originalText = button?.textContent;
      if (button) button.textContent = "Generating PDF...";

      // Capture the resume as canvas with higher quality
      const canvas = await html2canvas(resumeElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? "portrait" : "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Download PDF
      pdf.save(`Resume_${new Date().toISOString().split("T")[0]}.pdf`);

      // Restore button text
      if (button) button.textContent = originalText;
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <button
      onClick={downloadResume}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
    >
      📥 Download PDF
    </button>
  );
};

export default DownloadButton;
