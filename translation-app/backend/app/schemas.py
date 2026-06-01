from pydantic import BaseModel, Field


class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1)
    source_lang: str = Field(..., min_length=1)
    target_lang: str = Field(..., min_length=1)


class TranslationResponse(BaseModel):
    translated_text: str
    source_lang: str
    target_lang: str
    processing_time_ms: int
