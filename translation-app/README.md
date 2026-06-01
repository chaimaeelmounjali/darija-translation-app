# Translation App (T5)

FastAPI + React + Tailwind application for T5-based machine translation.
The model is loaded once at startup and reused for all requests.

## Model files

Place your model files in:

backend/models/final_phase3/

Expected files:
- config.json
- generation_config.json
- model.safetensors
- spiece.model
- tokenizer.json
- tokenizer_config.json
- special_tokens_map.json

## Run with Docker Compose

From the project root:

```
docker-compose up --build
```

Frontend: http://localhost:5173
Backend: http://localhost:8000

## Run manually

### Backend

```
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

If your model folder is not at the default location, set:

```
$env:MODEL_DIR="C:\\path\\to\\models\\final_phase3"
```

### Frontend

```
cd frontend
npm install
$env:VITE_API_URL="http://localhost:8000"
npm run dev
```

## Environment variables

Backend:
- MODEL_DIR (default: backend/models/final_phase3)
- CORS_ORIGINS (default: http://localhost:5173)
- MAX_NEW_TOKENS (default: 512)
- NUM_BEAMS (default: 4)
- MAX_INPUT_TOKENS (default: 1024)
- EARLY_STOPPING (default: true)
- DECODER_START_TOKEN_ID (default: 0)
- EOS_TOKEN_ID (default: 1)
- PAD_TOKEN_ID (default: 0)

Frontend:
- VITE_API_URL (default: http://localhost:8000)
