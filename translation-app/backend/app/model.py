from __future__ import annotations

import time
from threading import Lock
from typing import Tuple

import torch
from transformers import T5ForConditionalGeneration, T5Tokenizer

from .config import (
    ALLOWED_LANGUAGE_PAIRS,
    DECODER_START_TOKEN_ID,
    EARLY_STOPPING,
    EOS_TOKEN_ID,
    MAX_INPUT_TOKENS,
    MAX_NEW_TOKENS,
    MODEL_DIR,
    NUM_BEAMS,
    PAD_TOKEN_ID,
    SUPPORTED_LANGUAGES,
)

_model = None
_tokenizer = None
_device = None
_loaded_at = None
_lock = Lock()


def load_model() -> None:
    global _model, _tokenizer, _device, _loaded_at
    if _model is not None and _tokenizer is not None:
        return
    with _lock:
        if _model is not None and _tokenizer is not None:
            return
        if not MODEL_DIR.exists():
            raise FileNotFoundError(f"MODEL_DIR not found: {MODEL_DIR}")
        tokenizer = T5Tokenizer.from_pretrained(str(MODEL_DIR), use_fast=False)
        model = T5ForConditionalGeneration.from_pretrained(
            str(MODEL_DIR),
            torch_dtype=torch.float32,
            use_safetensors=True,
        )
        if len(tokenizer) != model.get_input_embeddings().weight.shape[0]:
            model.resize_token_embeddings(len(tokenizer))
        model.eval()
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        _tokenizer = tokenizer
        _model = model
        _device = device
        _loaded_at = time.time()


def is_model_loaded() -> bool:
    return _model is not None and _tokenizer is not None


def get_model_loaded_at() -> float | None:
    return _loaded_at


def _normalize_language(value: str) -> Tuple[str, str]:
    if not value or not value.strip():
        raise ValueError("Language value is empty.")
    key = value.strip().lower()
    for code, info in SUPPORTED_LANGUAGES.items():
        if key == code or key == info["name"].lower() or key in info["aliases"]:
            return code, info["name"]
    supported = ", ".join([info["name"] for info in SUPPORTED_LANGUAGES.values()])
    raise ValueError(f"Unsupported language '{value}'. Supported: {supported}.")


def translate(text: str, src_lang: str, tgt_lang: str) -> str:
    if not text or not text.strip():
        raise ValueError("Text is empty.")
    load_model()

    src_code, src_name = _normalize_language(src_lang)
    tgt_code, tgt_name = _normalize_language(tgt_lang)

    if (src_code, tgt_code) not in ALLOWED_LANGUAGE_PAIRS:
        raise ValueError("Unsupported translation direction.")

    prefix = f"translate {src_name} to {tgt_name}: "
    payload = prefix + text.strip()
    inputs = _tokenizer(
        payload,
        return_tensors="pt",
        max_length=MAX_INPUT_TOKENS,
        truncation=True,
        padding=True,
    )
    input_ids = inputs["input_ids"].to(_device)
    attention_mask = inputs["attention_mask"].to(_device)

    with torch.inference_mode():
        outputs = _model.generate(
            input_ids=input_ids,
            attention_mask=attention_mask,
            max_new_tokens=MAX_NEW_TOKENS,
            num_beams=NUM_BEAMS,
            early_stopping=EARLY_STOPPING,
            decoder_start_token_id=DECODER_START_TOKEN_ID,
            eos_token_id=EOS_TOKEN_ID,
            pad_token_id=PAD_TOKEN_ID,
        )

    return _tokenizer.decode(outputs[0], skip_special_tokens=True)
