from pydantic_ai import Agent
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.providers.google import GoogleProvider
from backend.config import GEMINI_API_KEY


class ModelAgent:
    def __init__(self, provider: str, model_name: str):
        if provider == "Google":
            ai_provider = GoogleProvider(api_key=GEMINI_API_KEY)
            self.agent = Agent(GoogleModel(model_name=model_name, provider=ai_provider))

    async def ask(self, prompt: str) -> str:
        result = await self.agent.run(prompt)
        return str(result.output)
