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
    qwen_provider: str
    qwen_api_key: str
    qwen_base_url: str
    qwen_model: str
    openrouter_site_url: str
    openrouter_app_name: str

    def __init__(self) -> None:
        origins = os.getenv("ALLOWED_ORIGINS", "*")
        self.allowed_origins = [origin.strip() for origin in origins.split(",") if origin.strip()]
        self.ai_service_url = os.getenv("AI_SERVICE_URL", "")
        self.qwen_provider = os.getenv("QWEN_PROVIDER", "openrouter").strip().lower()
        self.qwen_api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("QWEN_API_KEY", "")
        self.qwen_base_url = os.getenv("QWEN_BASE_URL", "https://openrouter.ai/api").rstrip("/")
        self.qwen_model = (
            os.getenv("OPENROUTER_MODEL")
            or os.getenv("QWEN_MODEL")
            or "mistralai/mistral-small-3.2-24b-instruct:free"
        )
        self.openrouter_site_url = os.getenv("OPENROUTER_SITE_URL", "http://localhost:5173")
        self.openrouter_app_name = os.getenv("OPENROUTER_APP_NAME", "AICruit")


settings = Settings()
