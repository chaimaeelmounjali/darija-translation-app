from __future__ import annotations

import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS, SUPPORTED_LANGUAGES
from .model import get_model_loaded_at, is_model_loaded, load_model, translate
from .schemas import TranslationRequest, TranslationResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.model_load_error = None
    try:
        load_model()
    except Exception as exc:  # pragma: no cover - startup path
        app.state.model_load_error = str(exc)
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": is_model_loaded(),
        "model_loaded_at": get_model_loaded_at(),
        "error": app.state.model_load_error,
    }


@app.get("/languages")
def languages():
    return {
        "languages": [
            {"code": code, "name": info["name"]}
            for code, info in SUPPORTED_LANGUAGES.items()
        ]
    }


@app.post("/translate", response_model=TranslationResponse)
@app.post("/api/translate", response_model=TranslationResponse)
def translate_route(payload: TranslationRequest):
    start = time.perf_counter()
    try:
        translated = translate(
            payload.text,
            payload.source_lang,
            payload.target_lang,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Translation failed.")

    elapsed_ms = int((time.perf_counter() - start) * 1000)
    return TranslationResponse(
        translated_text=translated,
        source_lang=payload.source_lang,
        target_lang=payload.target_lang,
        processing_time_ms=elapsed_ms,
    )
