import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.ai_providers.agent_wrapper import ModelAgent

app = FastAPI()

# Configuración CORS
origins = [
    "http://localhost:5173",  # tu frontend React por defecto
    # otros orígenes que quieras permitir
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    provider: str
    model: str


@app.post("/chat")
async def chat(request: ChatRequest):
    agent = ModelAgent(provider=request.provider, model_name=request.model)
    response = await agent.ask(request.message)
    return {"reply": response}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
