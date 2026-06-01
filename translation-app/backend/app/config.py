from __future__ import annotations

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_DIR = Path(os.getenv("MODEL_DIR", BASE_DIR / "models" / "final_phase3")).resolve()

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

MAX_NEW_TOKENS = int(os.getenv("MAX_NEW_TOKENS", "512"))
NUM_BEAMS = int(os.getenv("NUM_BEAMS", "4"))
MAX_INPUT_TOKENS = int(os.getenv("MAX_INPUT_TOKENS", "1024"))
EARLY_STOPPING = os.getenv("EARLY_STOPPING", "true").lower() in {"1", "true", "yes"}

DECODER_START_TOKEN_ID = int(os.getenv("DECODER_START_TOKEN_ID", "0"))
EOS_TOKEN_ID = int(os.getenv("EOS_TOKEN_ID", "1"))
PAD_TOKEN_ID = int(os.getenv("PAD_TOKEN_ID", "0"))

SUPPORTED_LANGUAGES = {
    "darija_arabic": {
        "name": "Darija Arabic",
        "aliases": [
            "darija_arabic",
            "darija arabic",
            "darija",
            "arabic darija",
            "darija_ar",
        ],
    },
    "darija_arabizi": {
        "name": "Darija Arabizi",
        "aliases": [
            "darija_arabizi",
            "darija arabizi",
            "arabizi",
            "darija latin",
            "darija_latn",
        ],
    },
    "en": {
        "name": "English",
        "aliases": ["en", "english", "anglais"],
    },
}

ALLOWED_LANGUAGE_PAIRS = {
    ("en", "darija_arabic"),
    ("darija_arabic", "en"),
    ("en", "darija_arabizi"),
    ("darija_arabizi", "en"),
}
