import spacy
from skillNer.skill_extractor_class import SkillExtractor
from skillNer.general_params import SKILL_DB

# Load spaCy NLP Model
nlp = spacy.load("en_core_web_sm")

# Initialize Skill Extractor
skill_extractor = SkillExtractor(nlp, SKILL_DB, phraseMatcher=None)  # 🔥 FIXED

# Sample text
text = "I have experience in Python, Java, and React.js."

# Extract skills
output = skill_extractor.annotate(text)

print(output)  # ✅ Should print extracted skills
