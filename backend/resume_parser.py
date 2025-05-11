import sys
import json
import spacy
import pdfplumber
import re
from transformers import pipeline
from spacy.matcher import PhraseMatcher
from skillNer.skill_extractor_class import SkillExtractor
from skillNer.general_params import SKILL_DB

# ✅ Load spaCy NLP Model
nlp = spacy.load("en_core_web_sm")

# ✅ Load BERT Model for Named Entity Recognition (NER)
ner_pipeline = pipeline("ner", model="dslim/bert-base-NER")

# ✅ Fix: Correctly Initialize PhraseMatcher (REMOVE `attr="LOWER"`)
phrase_matcher = PhraseMatcher(nlp.vocab)

# ✅ Fix: Initialize SkillExtractor correctly
skill_extractor = SkillExtractor(nlp, SKILL_DB, phraseMatcher=phrase_matcher)

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    with pdfplumber.open(pdf_path) as pdf:
        text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])
    return text

def extract_name(text):
    """Extract name using spaCy Named Entity Recognition (NER)."""
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
    return "Unknown"

def extract_email(text):
    """Extract email using regex."""
    match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    return match.group(0) if match else "Not provided"

def extract_phone(text):
    """Extract phone number using regex."""
    match = re.search(r"(\+91\s?\d{10}|\b\d{10}\b)", text)
    return match.group(0) if match else "Not provided"

def extract_education(text):
    """Extract education by searching for keywords."""
    education_keywords = ["Bachelor", "Master", "B.Tech", "B.E", "M.Tech", "PhD", "Diploma"]
    for line in text.split("\n"):
        if any(keyword in line for keyword in education_keywords):
            return line.strip()
    return "Not specified"

def extract_experience(text):
    """Extract experience using regex pattern for years of experience."""
    experience_match = re.search(r"(\d+)\s*(?:years?|yrs?)\s*(?:of)?\s*experience", text, re.IGNORECASE)
    return experience_match.group(0) if experience_match else "Not specified"

def extract_skills(text):
    """Extract skills using SkillNER."""
    try:
        annotations = skill_extractor.annotate(text)
        skills = list(set([skill["doc_node_value"] for skill in annotations["results"]["full_matches"]]))
        return skills if skills else ["Not specified"]
    except Exception as e:
        print(f"❌ Skill extraction failed: {e}")
        return ["Not specified"]

def extract_projects(text):
    """Extract projects based on project-related keywords."""
    project_keywords = ["Developed", "Designed", "Built", "Created", "Implemented"]
    projects = []

    for line in text.split("\n"):
        if any(keyword in line for keyword in project_keywords):
            projects.append(line.strip())

    return projects if projects else ["Not specified"]

def parse_resume(pdf_path):
    """Extract structured data from a resume PDF."""
    text = extract_text_from_pdf(pdf_path)

    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "contact": extract_phone(text),
        "education": extract_education(text),
        "experience": extract_experience(text),
        "skills": extract_skills(text),
        "projects": extract_projects(text),
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file provided"}))
        sys.exit(1)

    pdf_path = sys.argv[1]  # Get PDF path from Node.js
    parsed_data = parse_resume(pdf_path)

    print(json.dumps(parsed_data))  # Send JSON response to Node.js
