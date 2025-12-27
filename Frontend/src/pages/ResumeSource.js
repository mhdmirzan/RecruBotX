import Modern from "./Modern";
import DoubleColumn from "./DoubleColumn";
import Simple from "./Simple";
import Elegant from "./Elegant";

const ResumePreview = ({ resume = {} }) => {
  const template =
    localStorage.getItem("selectedTemplate") || "modern";

  switch (template) {
    case "elegant":
      return <Elegant resume={resume} />;

    case "double-column":
      return <DoubleColumn resume={resume} />;

    case "Simple":
      return <Simple resume={resume} />;

    default:
      return <Modern resume={resume} />;
  }
};

export default ResumePreview;
