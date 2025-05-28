import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.gemini_provider.gemini_ai import GeminiAI


app = FastAPI()
gemini = GeminiAI()

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


@app.post("/chat")
async def chat(request: ChatRequest):
    response = gemini.content_generator(request.message)
    return {"reply": response}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
