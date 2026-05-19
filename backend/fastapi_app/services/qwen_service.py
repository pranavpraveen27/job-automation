import asyncio
import json
import re
import urllib.error
import urllib.request
from typing import Any, Dict, List

from fastapi_app.core.config import settings


class QwenService:
    @staticmethod
    def is_configured() -> bool:
        if settings.qwen_provider == "ollama":
            return True
        if settings.qwen_provider == "openrouter":
            return bool(settings.qwen_api_key)
        return bool(settings.qwen_base_url)

    @staticmethod
    async def generate_text(prompt: str, system_instruction: str = "", temperature: float = 0.4) -> str:
        if not QwenService.is_configured():
            raise RuntimeError("Set OPENROUTER_API_KEY to enable AI features through OpenRouter.")

        return await asyncio.to_thread(
            QwenService._generate_text_sync,
            prompt,
            system_instruction,
            temperature,
        )

    @staticmethod
    async def generate_json(prompt: str, fallback: Any, system_instruction: str = "", temperature: float = 0.3) -> Any:
        try:
            text = await QwenService.generate_text(prompt, system_instruction, temperature)
            return QwenService.parse_json(text)
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
        if settings.qwen_provider == "ollama":
            return QwenService._generate_with_ollama(prompt, system_instruction, temperature)
        return QwenService._generate_with_openai_compatible(prompt, system_instruction, temperature)

    @staticmethod
    def _generate_with_ollama(prompt: str, system_instruction: str, temperature: float) -> str:
        payload = {
            "model": settings.qwen_model,
            "messages": QwenService._messages(prompt, system_instruction),
            "stream": False,
            "options": {"temperature": temperature},
        }
        body = QwenService._post_json(f"{settings.qwen_base_url}/api/chat", payload)
        text = body.get("message", {}).get("content", "").strip()
        if not text:
            raise RuntimeError("Local Ollama model returned an empty response.")
        return text

    @staticmethod
    def _generate_with_openai_compatible(prompt: str, system_instruction: str, temperature: float) -> str:
        base_url = settings.qwen_base_url
        url = base_url if base_url.endswith("/chat/completions") else f"{base_url}/v1/chat/completions"
        payload = {
            "model": settings.qwen_model,
            "messages": QwenService._messages(prompt, system_instruction),
            "temperature": temperature,
        }
        headers = {}
        if settings.qwen_api_key:
            headers["Authorization"] = f"Bearer {settings.qwen_api_key}"
        if settings.qwen_provider == "openrouter":
            headers["HTTP-Referer"] = settings.openrouter_site_url
            headers["X-Title"] = settings.openrouter_app_name

        body = QwenService._post_json(url, payload, headers)
        choices = body.get("choices") or []
        text = choices[0].get("message", {}).get("content", "").strip() if choices else ""
        if not text:
            raise RuntimeError("OpenRouter model returned an empty response.")
        return text

    @staticmethod
    def _post_json(url: str, payload: dict, headers: Dict[str, str] | None = None) -> dict:
        request = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", **(headers or {})},
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"OpenRouter request failed: {detail}") from exc
        except urllib.error.URLError as exc:
            if settings.qwen_provider == "ollama":
                raise RuntimeError(
                    "Qwen local server is not reachable. Install/start Ollama, then run "
                    f"`ollama pull {settings.qwen_model}` and `ollama serve`."
                ) from exc
            raise RuntimeError(f"OpenRouter server is not reachable at {settings.qwen_base_url}.") from exc
