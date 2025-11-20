# BiteCheck - Scan & Nutrition App

A cross-platform mobile application that allows users to scan QR codes and barcodes on packaged products to receive comprehensive nutrition information, ingredient lists, allergen flags, and health guidance.

## Overview

BiteCheck is a feature-rich nutrition scanning app that helps users make informed food choices by providing:
- **Product Scanning**: Scan barcodes/QR codes to instantly retrieve product information
- **Nutrition Details**: Comprehensive nutrition facts, ingredients, and allergen information
- **Personalization**: User preferences for allergies, dietary restrictions, and health goals
- **History & Favorites**: Track scanned products and save favorites
- **Crowdsourced Corrections**: Community-driven product data improvements

## Tech Stack

- **Frontend**: React Native (Expo SDK 51)
- **Backend**: Python 3.11+ with FastAPI
- **Database/Auth/Storage**: Supabase (PostgreSQL, Auth, Storage)
- **External APIs**: Open Food Facts (primary), USDA FoodData Central
- **Type Safety**: TypeScript (frontend), Pydantic (backend)

## Project Structure

```
BiteCheck/
├── frontend/              # React Native Expo mobile app
│   ├── app/              # Expo Router app directory
│   ├── entities/         # Domain entities (product, scan, user)
│   ├── features/         # Feature modules (auth, favorites, history, etc.)
│   ├── shared/           # Shared utilities and types
│   └── widgets/          # Reusable UI widgets
├── backend/              # FastAPI Python backend
│   ├── app/
│   │   ├── api/          # API routes and endpoints
│   │   ├── core/         # Configuration and database
│   │   ├── entities/     # Domain entities
│   │   ├── features/     # Feature modules (scan, product, user, correction)
│   │   ├── external/     # External API clients
│   │   ├── services/     # Business logic services
│   │   └── shared/       # Shared models and utilities
│   ├── migrations/       # Database migration files
│   └── tests/            # Test suite
└── Docs/                 # Project documentation
    ├── prd_scan_nutrition_app_react_native_fast_api_supabase.md
    ├── project_design_philosophy.md
    └── FSD_MIGRATION.md
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.11+
- **Expo CLI** (`npm install -g expo-cli`)
- **Supabase** account and project
- **Git** for version control

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp env.example .env
# Edit .env with your Supabase credentials
```

4. Start the development server:
```bash
npm start
```

For more details, see [frontend/README.md](frontend/README.md)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials and configuration
```

5. Run the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`  
API documentation at `http://localhost:8000/docs`

For more details, see [backend/README.md](backend/README.md)

### Database Setup

1. Apply database migrations:
   - See [backend/migrations/README.md](backend/migrations/README.md) for detailed instructions
   - Migrations can be applied via Supabase Dashboard, CLI, or psql

2. Verify tables are created:
   - Check Supabase dashboard for all tables
   - Verify Row Level Security (RLS) policies are enabled

## Key Features

### MVP Features
- ✅ Barcode/QR code scanning
- ✅ Product lookup from Open Food Facts
- ✅ Nutrition information display
- ✅ Ingredient lists and allergen flags
- ✅ User authentication
- ✅ Scan history
- ✅ Favorites
- ✅ User preferences (allergies, dietary restrictions)
- ✅ Crowdsourced corrections

### Architecture Highlights
- **Feature-based organization**: Code organized by features for better maintainability
- **Entity-driven design**: Clear separation of domain entities
- **Type safety**: Full TypeScript and Pydantic validation
- **API versioning**: RESTful API with versioning support
- **Database migrations**: Version-controlled schema changes

## Development

### Code Quality
- **Backend**: 
  - Format: `black app/`
  - Lint: `flake8 app/`
  - Type check: `mypy app/`
  - Test: `pytest`

- **Frontend**:
  - TypeScript for type safety
  - ESLint for code quality

### Testing
- Backend tests: `pytest` (from `backend/` directory)
- Frontend tests: See `frontend/README.md`

## Documentation

- [Product Requirements Document](Docs/prd_scan_nutrition_app_react_native_fast_api_supabase.md)
- [Project Design Philosophy](Docs/project_design_philosophy.md)
- [Database Migrations Guide](backend/migrations/README.md)
- [Backend API Documentation](backend/README.md)
- [Frontend Setup Guide](frontend/README.md)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT
