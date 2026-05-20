import asyncio
import json
import re
import urllib.error
import urllib.request
from typing import Any, Dict, List

from fastapi_app.core.config import settings


class GroqService:
    DEFAULT_HEADERS = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "pronnati-job-agent/1.0",
    }

    @staticmethod
    def is_configured() -> bool:
        return bool(settings.groq_api_key)

    @staticmethod
    async def generate_text(prompt: str, system_instruction: str = "", temperature: float = 0.4) -> str:
        if not GroqService.is_configured():
            raise RuntimeError("Set GROQ_API_KEY to enable AI features through Groq.")

        return await asyncio.to_thread(
            GroqService._generate_text_sync,
            prompt,
            system_instruction,
            temperature,
        )

    @staticmethod
    async def generate_json(prompt: str, fallback: Any, system_instruction: str = "", temperature: float = 0.2) -> Any:
        try:
            text = await GroqService.generate_text(prompt, system_instruction, temperature)
            return GroqService.parse_json(text)
        except Exception:
            return fallback

    @staticmethod
    def parse_json(text: str) -> Any:
        cleaned = text.strip()
        fenced = re.search(r"```(?:json)?\s*(.*?)```", cleaned, re.DOTALL | re.IGNORECASE)
        if fenced:
            cleaned = fenced.group(1).strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r"(\{.*\}|\[.*\])", cleaned, re.DOTALL)
            if not match:
                raise
            return json.loads(match.group(1))

    @staticmethod
    def _messages(prompt: str, system_instruction: str) -> List[Dict[str, str]]:
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})
        return messages

    @staticmethod
    def _generate_text_sync(prompt: str, system_instruction: str, temperature: float) -> str:
        payload = {
            "model": settings.groq_model,
            "messages": GroqService._messages(prompt, system_instruction),
            "temperature": temperature,
        }
        headers = {
            "Authorization": f"Bearer {settings.groq_api_key}",
        }

        body = GroqService._post_json(
            f"{settings.groq_base_url}/chat/completions",
            payload,
            headers,
        )
        choices = body.get("choices") or []
        text = choices[0].get("message", {}).get("content", "").strip() if choices else ""
        if not text:
            raise RuntimeError("Groq returned an empty response.")
        return text

    @staticmethod
    def _post_json(url: str, payload: dict, headers: Dict[str, str] | None = None) -> dict:
        request = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={**GroqService.DEFAULT_HEADERS, **(headers or {})},
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(GroqService._format_error(exc.code, detail)) from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Groq server is not reachable at {settings.groq_base_url}.") from exc

    @staticmethod
    def _format_error(status_code: int, detail: str) -> str:
        cleaned = detail.strip()

        try:
            payload = json.loads(cleaned)
            error = payload.get("error", payload)
            message = error.get("message") if isinstance(error, dict) else None
            if message:
                return f"Groq request failed ({status_code}): {message}"
        except json.JSONDecodeError:
            pass

        if "error code: 1010" in cleaned.lower():
            return (
                "Groq request failed (1010): request was blocked before reaching the API. "
                "Check GROQ_BASE_URL, GROQ_API_KEY, network/VPN/proxy settings, and restart the FastAPI service."
            )

        text = re.sub(r"<[^>]+>", " ", cleaned)
        text = re.sub(r"\s+", " ", text).strip()
        return f"Groq request failed ({status_code}): {text or 'empty error response'}"
