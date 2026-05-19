import re
from typing import List

COMMON_SKILLS = [
    "python",
    "javascript",
    "typescript",
    "react",
    "vue",
    "angular",
    "node.js",
    "node",
    "django",
    "fastapi",
    "flask",
    "sql",
    "postgresql",
    "mysql",
    "mongodb",
    "graphql",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "ci/cd",
    "git",
    "rest",
    "rest api",
    "machine learning",
    "nlp",
    "data analysis",
    "pandas",
    "numpy",
    "scrum",
    "agile",
    "project management",
]


def parse_skills_from_text(text: str) -> List[str]:
    normalized_text = text.lower()
    skills = []

    for skill in COMMON_SKILLS:
        pattern = rf"\b{re.escape(skill.lower())}\b"
        if re.search(pattern, normalized_text):
            skills.append(skill)

    return sorted(set(skills), key=str.lower)
