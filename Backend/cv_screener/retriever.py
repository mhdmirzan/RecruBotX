from matcher import Matcher
from pdf_parser import CVParser
from typing import List, Dict , Any
from pathlib import Path


class CVRetriever:
    """A class to retrieve CVs that match a job description."""

    def __init__(self, matcher: Matcher, parser: CVParser):
        """Initializes the retriever with a matcher and parser."""
        self.matcher = matcher
        self.parser = parser

    def retrieve(self, jd_text: str, cv_dir: str) -> List[Dict[str, Any]]:
        """Retrieves CVs that match the job description."""
        # Parse all CVs in the directory
        cv_files = [f for f in Path(cv_dir).glob('*.pdf') if f.is_file()]
        parsed_cvs = [self.parser.parse_pdf(str(f)) for f in cv_files]
        cv_texts = [cv.full_text for cv in parsed_cvs]
        cv_names = [cv.filename for cv in parsed_cvs]
        results = self.matcher.match(cv_names=cv_names, cv_texts=cv_texts, jd_text=jd_text)
        return results


# Instantiate the required classes
matcher = Matcher()
parser = CVParser()
retriever = CVRetriever(matcher=matcher, parser=parser)


output = retriever.retrieve(jd_text="""Job Summary:
We are seeking a motivated and customer-focused Call Center Representative to join our team. In this role, you will handle inbound and outbound calls, provide information, resolve customer inquiries, and ensure a positive customer experience.

Key Responsibilities:

Answer incoming calls and respond to customer inquiries in a professional manner.

Make outbound calls to follow up with customers or provide product/service information.

Resolve customer complaints or escalate to the appropriate department when necessary.

Meet performance targets such as call handling, customer satisfaction, and quality scores.

Provide feedback and insights to improve customer service processes.

Requirements:



Strong communication and active listening skills.

Ability to handle stressful situations with patience and professionalism.



Employment Type: Full-time / Part-time (depending on company needs)
Location: On-site / Remote (specify as needed)

Salary Range: Competitive, based on experience + performance incentives.

""" , cv_dir=r"C:\Users\moham\OneDrive\Desktop\FYP\cv")
print(output)