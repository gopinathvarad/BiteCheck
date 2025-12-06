# BiteCheck - Scan, Check, Eat Safe

BiteCheck is a comprehensive mobile application designed to help users make informed food choices. By scanning product barcodes, users can instantly access detailed nutritional information, ingredient lists, and personalized health warnings based on their specific allergies and dietary restrictions.

The platform includes a robust mobile app for users, a powerful backend API, and an administrative dashboard for managing crowdsourced data corrections.

## 🚀 Key Features

### Mobile App (Consumer)

- **Instant Scanning**: Fast barcode and QR code scanning to retrieve product data.
- **Personalized Safety**: Automatic checks against user-defined allergies and dietary restrictions.
- **Health Scores**: Clear visualization of product healthiness (e.g., Nutri-Score).
- **Detailed Insights**: Comprehensive breakdown of nutrition facts and ingredients.
- **History & Favorites**: specific lists to track previously scanned and favorite items.
- **Community Contributions**: Users can submit corrections for inaccurate product data.

### Admin Dashboard (Management)

- **Correction Review**: Interface for admins to review, approve, or reject user-submitted product corrections.
- **Data Management**: Tools to ensure the accuracy and integrity of the product database.

## 🛠 Tech Stack

BiteCheck is built as a modern monorepo-style project with three main components:

### 1. Mobile App (`/frontend`)

- **Framework**: React Native with [Expo SDK 51](https://expo.dev)
- **Language**: TypeScript
- **Routing**: Expo Router
- **UI**: Custom components with Expo standard libraries
- **State/Data**: React Query, Context API

### 2. Backend API (`/backend`)

- **Framework**: Python FastAPI
- **Language**: Python 3.11+
- **Database**: Supabase (PostgreSQL)
- **Validation**: Pydantic v2
- **Testing**: Pytest

### 3. Admin Dashboard (`/admin-dashboard`)

- **Framework**: Next.js 15+ (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Auth**: Supabase Auth

## 📂 Project Structure

```
BiteCheck/
├── frontend/              # React Native Expo mobile application
│   ├── app/               # Expo Router pages and layouts
│   ├── entities/          # Domain entities (User, Product, Scan)
│   ├── features/          # Feature-based logic (Auth, Scanner, History)
│   └── shared/            # Shared utilities and UI components
│
├── backend/               # FastAPI Python backend
│   ├── app/               # Application source code
│   │   ├── api/           # API Endpoints
│   │   ├── features/      # Business logic grouped by feature
│   │   └── services/      # External integrations (OpenFoodFacts, etc.)
│   ├── migrations/        # Database migrations
│   └── tests/             # Backend test suite
│
├── admin-dashboard/       # Next.js web dashboard for admins
│   ├── app/               # App Router pages
│   └── lib/               # Utilities and Supabase client
│
└── Docs/                  # Project documentation and design docs
```

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Supabase Account (for DB and Auth)
- Expo Go app on your phone (or a simulator)

---

### 🟢 1. Mobile App Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment:**

   ```bash
   cp env.example .env
   # Add your EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
   ```

4. **Run the App:**
   ```bash
   npx expo start
   ```
   Scan the QR code with your phone (Expo Go) or press `i` for iOS Simulator / `a` for Android Emulator.

---

### 🔵 2. Backend Setup

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Create and Activate Virtual Environment:**

   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install Dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment:**

   ```bash
   cp .env.example .env
   # Configure SUPABASE_URL, SUPABASE_KEY, etc.
   ```

5. **Run the Server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be live at `http://localhost:8000`. Docs available at `/docs`.

---

### 🟣 3. Admin Dashboard Setup

1. **Navigate to the directory:**

   ```bash
   cd admin-dashboard
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Access the dashboard at `http://localhost:3000`.

## 📚 Documentation

Detailed documentation can be found in the `Docs` directory:

- [Product Requirements (PRD)](Docs/prd_scan_nutrition_app_react_native_fast_api_supabase.md)
- [Design Philosophy](Docs/project_design_philosophy.md)
- [Feature Breakdown](Docs/FSD_MIGRATION.md)

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
