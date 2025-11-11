# BiteCheck Backend API

FastAPI backend for the BiteCheck nutrition scanning application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials and other settings
```

4. Run the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

## Project Structure

```
backend/
├── app/
│   ├── api/              # API routes
│   │   └── v1/
│   │       ├── endpoints/  # Endpoint handlers
│   │       └── router.py   # API router
│   ├── core/             # Core configuration
│   │   ├── config.py     # Settings
│   │   └── database.py   # Database connection
│   ├── models/           # Pydantic models
│   ├── services/         # Business logic
│   └── external/         # External API clients
├── tests/                # Test files
├── requirements.txt      # Python dependencies
└── main.py              # Application entry point
```

## API Endpoints

- `POST /api/v1/scan` - Scan product by barcode/QR code
- `GET /api/v1/product/{id}` - Get product by ID
- `GET /api/v1/user/me` - Get current user profile
- `POST /api/v1/user/preferences` - Update user preferences
- `POST /api/v1/corrections` - Submit product correction

## Development

- Run tests: `pytest`
- Format code: `black app/`
- Lint code: `flake8 app/`
- Type check: `mypy app/`

## Tech Stack

- FastAPI 0.109+
- Python 3.11+
- Supabase (Postgres, Auth, Storage)
- Pydantic for data validation
- httpx for HTTP requests

