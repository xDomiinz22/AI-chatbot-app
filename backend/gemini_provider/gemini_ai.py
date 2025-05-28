from google import genai
from backend.config import GEMINI_API_KEY


class GeminiAI:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GeminiAI, cls).__new__(cls)
            cls._instance.client = genai.Client(api_key=GEMINI_API_KEY)
        return cls._instance

    def content_generator(self, message: str) -> str:
        response = self.client.models.generate_content(
            model="gemini-2.0-flash", contents=message
        )
        return response.text
