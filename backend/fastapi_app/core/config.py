from typing import List

from pydantic import BaseSettings


class Settings(BaseSettings):
    allowed_origins: List[str] = ["*"]
    ai_service_url: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
