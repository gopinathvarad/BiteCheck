# BiteCheck Mobile App (Frontend)

React Native mobile application built with Expo for scanning products and viewing nutrition information.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase and API credentials
```

3. Start the development server:
```bash
npm start
```

## Project Structure

```
frontend/
├── app/                 # Expo Router app directory
│   ├── (auth)/         # Authentication screens
│   ├── (tabs)/         # Main app tabs
│   └── _layout.tsx     # Root layout
├── components/          # Reusable components
├── lib/                 # Utilities and configurations
│   ├── supabase.ts     # Supabase client
│   └── api.ts          # API client
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── constants/           # App constants
└── assets/              # Images, fonts, etc.
```

## Key Features

- Camera-based barcode/QR scanning
- Product detail views with nutrition information
- User authentication via Supabase
- Scan history and favorites
- Allergen warnings based on user preferences

## Tech Stack

- Expo SDK 51
- React Native 0.74
- Expo Router for navigation
- Supabase for auth and data
- React Query for data fetching
- TypeScript

