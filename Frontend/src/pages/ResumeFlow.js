import React, { useState } from "react";

// import all steps correctly
import ExperienceLevel from "./ExperienceLevel";
import TemplateSelect from "./TemplateSelect";
import ResumeSource from "./ResumeSource";
import ResumeBuilder from "./ResumeBuilder";

const ResumeFlow = () => {
  const [step, setStep] = useState(1);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [template, setTemplate] = useState("");

  return (
    <>
      {step === 1 && (
        <ExperienceLevel
          onNext={(level) => {
            setExperienceLevel(level);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <TemplateSelect
          onNext={(selectedTemplate) => {
            setTemplate(selectedTemplate);
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <ResumeSource
          onNext={() => {
            setStep(4);
          }}
        />
      )}

      {step === 4 && (
        <ResumeBuilder
          experienceLevel={experienceLevel}
          template={template}
        />
      )}
    </>
  );
};

export default ResumeFlow;
