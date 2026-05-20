import os
from pathlib import Path
from typing import List


def load_env_file() -> None:
    env_path = Path.cwd() / ".env"
    if not env_path.exists():
        env_path = Path(__file__).resolve().parents[2] / ".env"

    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_file()


class Settings:
    allowed_origins: List[str]
    ai_service_url: str
    groq_api_key: str
    groq_base_url: str
    groq_model: str

    def __init__(self) -> None:
        origins = os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,https://job-automation.pages.dev",
        )
        self.allowed_origins = [origin.strip() for origin in origins.split(",") if origin.strip()]
        self.ai_service_url = os.getenv("AI_SERVICE_URL", "http://127.0.0.1:8000")
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")
        self.groq_base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1").rstrip("/")
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


settings = Settings()
