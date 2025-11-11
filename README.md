# BiteCheck - Scan & Nutrition App

A cross-platform mobile application that allows users to scan QR codes and barcodes on packaged products to receive comprehensive nutrition information, ingredient lists, allergen flags, and health guidance.

## Tech Stack

- **Frontend**: React Native (Expo)
- **Backend**: Python + FastAPI
- **Database/Auth/Storage**: Supabase (Postgres, Auth, Storage)
- **External APIs**: Open Food Facts (primary), USDA FoodData Central

## Project Structure

```
BiteCheck/
├── frontend/          # React Native Expo app
├── backend/           # FastAPI Python backend
├── docs/              # Documentation
└── prd_scan_nutrition_app_react_native_fast_api_supabase.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.11+
- Expo CLI (`npm install -g expo-cli`)
- Supabase account and project

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm start
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
uvicorn app.main:app --reload
```

## Development

See individual README files in `frontend/` and `backend/` directories for detailed setup instructions.

## License

MIT

# BiteCheck
