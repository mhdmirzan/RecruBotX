import pdfplumber
import re
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
import logging
from dataclasses import dataclass
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class CVSection:
    """Represents a section of a CV with title and content."""
    title: str
    content: str
    start_page: int
    end_page: int


@dataclass
class ParsedCV:
    """Complete parsed CV data structure."""
    filename: str
    full_text: str
    sections: List[CVSection]
    metadata: Dict[str, Any]
    text_statistics: Dict[str, int]


class CVParser:
    """
    Advanced PDF CV parser that extracts structured text and sections from CV documents.
    Handles various PDF formats and provides clean, structured output.
    """

    def __init__(self):
        self.section_patterns = {
            'contact': r'^(contact|personal|profile|about).*',
            'education': r'^(education|academic|qualifications|degrees).*',
            'experience': r'^(experience|work|employment|professional|career).*',
            'skills': r'^(skills|competencies|expertise|technologies).*',
            'projects': r'^(projects|portfolio|achievements).*',
            'certifications': r'^(certifications|certificates|courses|training).*',
            'languages': r'^(languages|language).*',
            'references': r'^(references|referees).*'
        }

    def parse_pdf(self, file_path: str) -> ParsedCV:
        """
        Parse a PDF CV file and extract structured information.

        Args:
            file_path (str): Path to the PDF file

        Returns:
            ParsedCV: Structured CV data

        Raises:
            FileNotFoundError: If PDF file doesn't exist
            ValueError: If file is not a PDF or parsing fails
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found: {file_path}")

        if not file_path.lower().endswith('.pdf'):
            raise ValueError("File must be a PDF")

        try:
            filename = Path(file_path).name
            full_text = ""
            all_sections = []
            page_texts = []

            with pdfplumber.open(file_path) as pdf:
                total_pages = len(pdf.pages)

                for page_num, page in enumerate(pdf.pages):
                    try:
                        # Extract text from page
                        page_text = page.extract_text()
                        if page_text:
                            full_text += page_text + "\n"
                            page_texts.append((page_num + 1, page_text))

                    except Exception as e:
                        logger.warning(f"Error extracting text from page {page_num + 1}: {e}")
                        continue

                # Extract sections
                sections = self._extract_sections(full_text, page_texts)

                # Calculate text statistics
                text_stats = self._calculate_statistics(full_text)

                # Extract metadata
                metadata = self._extract_metadata(full_text, filename)

                return ParsedCV(
                    filename=filename,
                    full_text=full_text.strip(),
                    sections=sections,
                    metadata=metadata,
                    text_statistics=text_stats
                )

        except Exception as e:
            raise ValueError(f"Failed to parse PDF: {e}")

    def _extract_sections(self, full_text: str, page_texts: List[Tuple[int, str]]) -> List[CVSection]:
        """
        Extract structured sections from CV text using pattern matching.

        Args:
            full_text (str): Complete CV text
            page_texts (List[Tuple[int, str]]): Page number and text tuples

        Returns:
            List[CVSection]: List of extracted sections
        """
        sections = []

        # Split text into lines for better processing
        lines = full_text.split('\n')
        current_section = None
        current_content = []
        current_start_page = 1

        for line_num, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue

            # Check if line is a section header
            section_title = self._identify_section_header(line)

            if section_title:
                # Save previous section if exists
                if current_section and current_content:
                    sections.append(CVSection(
                        title=current_section,
                        content='\n'.join(current_content).strip(),
                        start_page=current_start_page,
                        end_page=self._find_section_end_page(current_section, page_texts)
                    ))

                # Start new section
                current_section = section_title
                current_content = []
                current_start_page = self._find_section_start_page(section_title, page_texts)
            else:
                # Add line to current section content
                if current_section:
                    current_content.append(line)

        # Don't forget the last section
        if current_section and current_content:
            sections.append(CVSection(
                title=current_section,
                content='\n'.join(current_content).strip(),
                start_page=current_start_page,
                end_page=self._find_section_end_page(current_section, page_texts)
            ))

        # If no sections found, create a general section
        if not sections:
            sections.append(CVSection(
                title="General",
                content=full_text.strip(),
                start_page=1,
                end_page=len(page_texts)
            ))

        return sections

    def _identify_section_header(self, line: str) -> Optional[str]:
        """
        Identify if a line is a section header using various patterns.

        Args:
            line (str): Line to check

        Returns:
            Optional[str]: Section title if identified, None otherwise
        """
        line_lower = line.lower().strip()

        # Check against known section patterns
        for section, pattern in self.section_patterns.items():
            if re.match(pattern, line_lower, re.IGNORECASE):
                return self._clean_section_title(line)

        # Additional pattern matching for common CV headers
        if re.match(r'^[A-Z][A-Z\s&]{2,}$', line.strip()):
            return self._clean_section_title(line)

        # Check for numbered sections
        if re.match(r'^\d+\.?\s*[A-Z]', line):
            return self._clean_section_title(line)

        return None

    def _clean_section_title(self, title: str) -> str:
        """Clean and standardize section titles."""
        # Remove common prefixes and suffixes
        title = re.sub(r'^[\d\.\s]+', '', title)  # Remove leading numbers
        title = re.sub(r'[\s\._-]+$', '', title)  # Remove trailing punctuation
        return title.strip()

    def _find_section_start_page(self, section_title: str, page_texts: List[Tuple[int, str]]) -> int:
        """Find the page where a section starts."""
        section_lower = section_title.lower()

        for page_num, page_text in page_texts:
            if section_lower in page_text.lower():
                return page_num

        return 1  # Default to first page

    def _find_section_end_page(self, section_title: str, page_texts: List[Tuple[int, str]]) -> int:
        """Find the page where a section ends."""
        section_lower = section_title.lower()
        start_page = None

        # Find start page
        for page_num, page_text in page_texts:
            if section_lower in page_text.lower():
                start_page = page_num
                break

        if start_page is None:
            return len(page_texts)

        # Find next section or end
        next_section_found = False
        for page_num, page_text in page_texts[start_page - 1:]:
            page_lower = page_text.lower()

            # Check if another major section starts
            for section, pattern in self.section_patterns.items():
                if section != section_lower and re.search(pattern, page_lower):
                    return page_num - 1

            # Check for other section indicators
            if re.search(r'^[A-Z][A-Z\s]{3,}$', page_lower):
                return page_num - 1

        return len(page_texts)

    def _extract_metadata(self, text: str, filename: str) -> Dict[str, Any]:
        """
        Extract metadata from CV text.

        Args:
            text (str): Full CV text
            filename (str): Original filename

        Returns:
            Dict[str, Any]: Extracted metadata
        """
        metadata = {
            'filename': filename,
            'email': self._extract_email(text),
            'phone': self._extract_phone(text),
            'name': self._extract_name(text)
        }

        return metadata

    def _extract_email(self, text: str) -> Optional[str]:
        """Extract email address from text."""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        match = re.search(email_pattern, text)
        return match.group(0) if match else None

    def _extract_phone(self, text: str) -> Optional[str]:
        """Extract phone number from text."""
        phone_patterns = [
            r'\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}',
            r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}'
        ]

        for pattern in phone_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        return None

    def _extract_name(self, text: str) -> Optional[str]:
        """Extract potential name from beginning of CV."""
        lines = text.split('\n')[:10]  # Check first 10 lines
        for line in lines:
            line = line.strip()
            if len(line) > 2 and len(line) < 50:
                # Look for lines that might be names (capitalized words)
                words = line.split()
                if len(words) >= 2 and all(word[0].isupper() for word in words if len(word) > 1):
                    return line
        return None

    def _calculate_statistics(self, text: str) -> Dict[str, int]:
        """Calculate text statistics."""
        return {
            'total_characters': len(text),
            'total_words': len(text.split()),
            'total_lines': len(text.split('\n')),
            'average_words_per_line': len(text.split()) / max(len(text.split('\n')), 1)
        }

    def preprocess_text(self, text: str) -> str:
        """
        Clean and preprocess extracted text for better processing.

        Args:
            text (str): Raw extracted text

        Returns:
            str: Cleaned and preprocessed text
        """
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)

        # Remove page numbers (common in PDFs)
        text = re.sub(r'\s+\d+\s*$', '', text, flags=re.MULTILINE)

        # Remove common PDF artifacts
        text = re.sub(r'[^\x00-\x7F]+', '', text)  # Remove non-ASCII characters

        # Fix broken words at line ends
        text = re.sub(r'(\w)-\s+(\w)', r'\1\2', text)

        # Remove excessive spaces around punctuation
        text = re.sub(r'\s+([,.!?;:])', r'\1', text)
        text = re.sub(r'([,.!?;:])\s*', r'\1 ', text)

        return text.strip()

    def batch_parse_pdfs(self, directory_path: str) -> List[ParsedCV]:
        """
        Parse all PDF files in a directory.

        Args:
            directory_path (str): Path to directory containing PDF files

        Returns:
            List[ParsedCV]: List of parsed CVs

        Raises:
            FileNotFoundError: If directory doesn't exist
        """
        if not os.path.exists(directory_path):
            raise FileNotFoundError(f"Directory not found: {directory_path}")

        pdf_files = list(Path(directory_path).glob("*.pdf"))
        parsed_cvs = []

        for pdf_file in pdf_files:
            try:
                logger.info(f"Parsing {pdf_file.name}...")
                parsed_cv = self.parse_pdf(str(pdf_file))
                parsed_cvs.append(parsed_cv)
            except Exception as e:
                logger.error(f"Failed to parse {pdf_file.name}: {e}")
                continue

        return parsed_cvs

    def batch_parse_pdf_files(self, file_paths: List[str]) -> Dict[str, ParsedCV]:
        """
        Parse multiple PDF files from a list of file paths.

        Args:
            file_paths (List[str]): List of paths to PDF files

        Returns:
            Dict[str, ParsedCV]: Dictionary mapping file paths to parsed CVs

        Raises:
            ValueError: If any file path is invalid
        """
        parsed_cvs = {}

        for file_path in file_paths:
            try:
                if not os.path.exists(file_path):
                    logger.warning(f"File not found: {file_path}")
                    continue
                    
                logger.info(f"Parsing {Path(file_path).name}...")
                parsed_cv = self.parse_pdf(file_path)
                parsed_cvs[file_path] = parsed_cv
            except Exception as e:
                logger.error(f"Failed to parse {file_path}: {e}")
                continue

        return parsed_cvs


def save_parsed_cv(parsed_cv: ParsedCV, output_path: str):
    """
    Save parsed CV data to a file.

    Args:
        parsed_cv (ParsedCV): Parsed CV object
        output_path (str): Path to save the data
    """
    import json

    # Convert to serializable format
    data = {
        'filename': parsed_cv.filename,
        'full_text': parsed_cv.full_text,
        'sections': [
            {
                'title': section.title,
                'content': section.content,
                'start_page': section.start_page,
                'end_page': section.end_page
            } for section in parsed_cv.sections
        ],
        'metadata': parsed_cv.metadata,
        'text_statistics': parsed_cv.text_statistics
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def load_parsed_cv(input_path: str) -> ParsedCV:
    """
    Load parsed CV data from a file.

    Args:
        input_path (str): Path to load the data from

    Returns:
        ParsedCV: Loaded parsed CV object
    """
    import json

    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    sections = [
        CVSection(
            title=section['title'],
            content=section['content'],
            start_page=section['start_page'],
            end_page=section['end_page']
        ) for section in data['sections']
    ]

    return ParsedCV(
        filename=data['filename'],
        full_text=data['full_text'],
        sections=sections,
        metadata=data['metadata'],
        text_statistics=data['text_statistics']
    )


