import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.ai_providers.agent_wrapper import ModelAgent
from backend.database.database import Base, engine
from backend.api.routes import user

app = FastAPI()
Base.metadata.create_all(bind=engine)
app.include_router(user.router)

# Configuración CORS
origins = [
    "http://localhost:5173",  # frontend React por defecto
    # otros orígenes que quieras permitir
]

ALLOWED_ORIGINS = set(origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def verify_origin_header(request: Request, call_next):
    if request.method != "GET":
        origin = request.headers.get("origin")
        referer = request.headers.get("referer")

        # Si no hay origin ni referer, rechaza
        if origin is None and referer is None:
            raise HTTPException(
                status_code=403, detail="Missing Origin or Referer header"
            )

        # Verifica origin
        if origin and origin not in ALLOWED_ORIGINS:
            raise HTTPException(status_code=403, detail="Invalid Origin header")

        # Si no hay origin pero hay referer, verificar que referer empiece con algún origen permitido
        if (
            not origin
            and referer
            and not any(referer.startswith(o) for o in ALLOWED_ORIGINS)
        ):
            raise HTTPException(status_code=403, detail="Invalid Referer header")

    response = await call_next(request)
    return response


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
