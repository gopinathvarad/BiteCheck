# 🏗️ BiteCheck Development Guide

## 🎯 MVP Philosophy: Keep It Simple

**This is an MVP - NO OVER-ENGINEERING**

- Build features that work, not perfect systems
- Prioritize functionality over complexity
- Clean, lean, modular code only
- Remove redundant code immediately after changes
- **Mobile-first**: Optimize for fast scanning and instant feedback

## 🏛️ Architecture Principles

### **Feature Slice Design (FSD)**

BiteCheck follows **Feature Slice Design** methodology for scalable, maintainable architecture:

#### **Frontend FSD Structure**

```
frontend/
├── app/                    # Expo Router (file-based routing)
│   ├── (auth)/            # Auth pages
│   ├── (tabs)/            # Tab pages
│   └── product/           # Product pages
├── processes/             # Complex multi-step user flows
│   └── scan-product/      # Scan → View → Save flow
├── pages/                  # Full-page compositions (if needed)
├── widgets/                # Large independent UI blocks
│   ├── product-card/      # Product display widget
│   └── scan-overlay/      # Camera overlay widget
├── features/               # Business features (self-contained)
│   ├── scan/              # Scanning feature
│   │   ├── ui/            # Feature UI components
│   │   ├── api/            # Feature API calls
│   │   ├── model/         # Feature types/models
│   │   └── lib/            # Feature utilities
│   ├── product/           # Product feature
│   ├── favorites/         # Favorites feature
│   ├── history/           # Scan history feature
│   └── auth/              # Authentication feature
├── entities/               # Business entities (data models)
│   ├── product/          # Product entity
│   │   ├── model/         # Product types
│   │   ├── api/            # Product API
│   │   └── lib/            # Product utilities
│   ├── user/              # User entity
│   └── scan/              # Scan entity
└── shared/                 # Shared code (reusable across slices)
    ├── ui/                # Shared UI components
    ├── lib/               # Shared utilities
    ├── api/               # Shared API client
    ├── config/            # App configuration
    └── types/             # Shared types
```

#### **FSD Layer Rules**

1. **app/** - Expo Router pages only, minimal logic
2. **processes/** - Complex multi-step flows spanning multiple features
3. **pages/** - Full page compositions (use sparingly, prefer app/)
4. **widgets/** - Large independent UI blocks used across features
5. **features/** - Business features with own UI, API, models, and logic
6. **entities/** - Business entities (data models, API, utilities)
7. **shared/** - Reusable code across all layers

#### **Import Rules (FSD)**

- ✅ Features can import from: entities, shared
- ✅ Widgets can import from: features, entities, shared
- ✅ Pages can import from: widgets, features, entities, shared
- ✅ Processes can import from: pages, widgets, features, entities, shared
- ✅ App can import from: all layers
- ❌ Never import from higher layers (no circular dependencies)
- ❌ Features cannot import from other features directly

#### **Backend Vertical Slice Architecture**

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/  # Route handlers (thin controllers)
│   ├── features/           # Business features (vertical slices)
│   │   ├── scan/          # Scan feature
│   │   │   ├── models.py   # Feature-specific models
│   │   │   ├── service.py  # Business logic
│   │   │   └── router.py   # Feature routes (if needed)
│   │   ├── product/       # Product feature
│   │   ├── user/          # User feature
│   │   └── correction/    # Correction feature
│   ├── entities/          # Business entities
│   │   ├── product/       # Product entity
│   │   └── user/          # User entity
│   ├── shared/            # Shared code
│   │   ├── models/        # Shared Pydantic models
│   │   ├── utils/         # Shared utilities
│   │   └── exceptions/    # Shared exceptions
│   ├── external/          # External API clients
│   └── core/              # Core configuration
│       ├── config.py
│       └── database.py
```

### **Mobile-First Performance**

- Scan-to-result latency < 1.5s (cached < 500ms)
- Minimize API calls - batch data when possible
- Cache product data aggressively on device
- Progressive loading: show basic info first, enrich later

### **API-First Design**

- Single/minimal API calls with rich responses to reduce network overhead
- Backend handles data aggregation and external API orchestration
- Frontend displays data, doesn't compute business logic

### **Supabase-Native Patterns**

- Leverage Supabase Auth, RLS, and Storage directly from frontend when appropriate
- Use Supabase Postgres for all persistent data
- Prefer Supabase client over custom API endpoints for simple CRUD

## 🔧 API Design Standards

### **RESTful Conventions**

```python
# ✅ Correct patterns
@router.post("/scan")                    # Actions (no slash)
@router.get("/product/{id}")             # Individual resources (no slash)
@router.get("/products/")                 # Collections (with trailing slash)
@router.post("/product/{id}/correction") # Nested actions (no slash)
@router.get("/user/me")                  # Special resources (no slash)

# ❌ Avoid
@router.post("/scanProduct")              # No verbs in URLs
@router.get("/getProduct/{id}")          # Redundant verbs
@router.post("/product/create")          # Redundant paths
```

### **Response Format**

```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### **Error Format**

```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### **Product Scan Response**

- Always return complete product data in single response
- Include nutrition, ingredients, allergens, health_score in one payload
- Minimize follow-up requests

## 📁 Project Structure

### **Frontend Structure (FSD)**

- **app/**: Expo Router screens (file-based routing) - minimal logic
- **processes/**: Complex multi-step user flows
- **pages/**: Full-page compositions (use sparingly)
- **widgets/**: Large independent UI blocks
- **features/**: Business features (scan, product, favorites, history, auth)
  - Each feature contains: `ui/`, `api/`, `model/`, `lib/`
- **entities/**: Business entities (product, user, scan)
  - Each entity contains: `model/`, `api/`, `lib/`
- **shared/**: Shared utilities, UI components, API client, config, types

### **Backend Structure (Vertical Slices)**

- **app/api/v1/endpoints/**: Thin route handlers (controllers)
- **app/features/**: Business features (vertical slices)
  - Each feature: `models.py`, `service.py`, `router.py` (if needed)
- **app/entities/**: Business entities
- **app/shared/**: Shared models, utilities, exceptions
- **app/external/**: External API clients (Open Food Facts, USDA)
- **app/core/**: Configuration and database setup

### **Database**: Supabase (Postgres + Auth + Storage)

- Managed via Supabase dashboard or migrations
- Use RLS policies for security

### **Documentation**: `Docs/` (PRD, Architecture, API docs)

## 🔧 Development Rules

### **Code Quality Standards**

- **Clean After Changes**: Remove redundant code immediately
- **No Dead Code**: Delete unused functions, imports, components
- **Modular Design**: Each module has single responsibility
- **Type Safety**: Full TypeScript coverage required (frontend), Pydantic models (backend)
- **Performance**: Profile scan flow regularly, optimize hot paths
- **FSD Compliance**: Follow layer import rules strictly

### **Feature Development Process**

1. **Identify Layer**: Determine if it's a feature, entity, widget, or shared
2. **Backend**: Create feature slice → models → service → endpoint
3. **Frontend**: Create feature/entity → UI → API integration → types
4. **Database**: Update Supabase schema if needed → test RLS policies
5. **Clean Up**: Remove unused code, optimize imports, check bundle size
6. **Test**: Verify functionality works end-to-end, test offline scenarios

### **Component Placement (Frontend)**

- **Screen-specific**: `app/` - keep logic minimal, delegate to features
- **Feature UI**: `features/{feature-name}/ui/` - feature-specific components
- **Reusable UI**: `shared/ui/` - only when used in 2+ features
- **Business logic**: Backend services or feature services
- **Data fetching**: Feature API hooks in `features/{feature-name}/api/`

### **Mobile-Specific Guidelines**

- **Offline Support**: Cache recent scans locally, sync when online
- **Camera Permissions**: Handle gracefully, provide manual entry fallback
- **Network Errors**: Show clear messages, allow retry
- **Loading States**: Show skeleton screens, not just spinners
- **Error Boundaries**: Wrap screens to prevent full app crashes

## 💻 Frontend Code Standards

### **TypeScript & React Native**

- Write concise, technical TypeScript code with accurate examples
- Use functional and declarative programming patterns; avoid classes
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError)
- Structure files: exported component, subcomponents, helpers, static content, types
- Follow Expo's official documentation: https://docs.expo.dev/

### **Naming Conventions**

- Use lowercase with dashes for directories (e.g., `features/scan-product/`)
- Favor named exports for components
- Use PascalCase for components, camelCase for functions/variables

### **TypeScript Usage**

- Use TypeScript for all code; prefer interfaces over types
- Avoid enums; use maps instead
- Use functional components with TypeScript interfaces
- Use strict mode in TypeScript for better type safety

### **Syntax and Formatting**

- Use the "function" keyword for pure functions
- Avoid unnecessary curly braces in conditionals; use concise syntax
- Use declarative JSX
- Use Prettier for consistent code formatting

### **UI and Styling**

- Use Expo's built-in components for common UI patterns
- Implement responsive design with Flexbox and `useWindowDimensions`
- Use styled-components or Tailwind CSS for component styling
- Implement dark mode support using `useColorScheme`
- Ensure high accessibility (a11y) standards
- Leverage `react-native-reanimated` and `react-native-gesture-handler` for animations

### **Safe Area Management**

- Use `SafeAreaProvider` from `react-native-safe-area-context` globally
- Wrap top-level components with `SafeAreaView`
- Use `SafeAreaScrollView` for scrollable content
- Avoid hardcoding padding or margins for safe areas

### **Performance Optimization**

- Minimize `useState` and `useEffect`; prefer context and reducers
- Use Expo's `AppLoading` and `SplashScreen` for startup
- Optimize images: use WebP, include size data, lazy load with `expo-image`
- Implement code splitting with React's `Suspense` and dynamic imports
- Avoid unnecessary re-renders by memoizing components
- Use `useMemo` and `useCallback` appropriately

### **Navigation**

- Use Expo Router for file-based routing
- Leverage deep linking and universal links
- Use dynamic routes with expo-router

### **State Management**

- Use React Context and `useReducer` for global state
- Leverage `react-query` for data fetching and caching
- For complex state, consider Zustand or Redux Toolkit
- Handle URL search parameters using `expo-linking`

### **Error Handling and Validation**

- Use Zod for runtime validation and error handling
- Implement proper error logging using Sentry or similar
- Handle errors at the beginning of functions
- Use early returns for error conditions
- Avoid unnecessary else statements; use if-return pattern
- Implement global error boundaries

### **Testing**

- Write unit tests using Jest and React Native Testing Library
- Implement integration tests for critical user flows using Detox
- Use Expo's testing tools for different environments
- Consider snapshot testing for components

### **Security**

- Sanitize user inputs to prevent XSS attacks
- Use `react-native-encrypted-storage` for sensitive data
- Ensure secure communication with APIs using HTTPS
- Follow Expo's Security guidelines: https://docs.expo.dev/guides/security/

## 🐍 Backend Code Standards

### **Python & FastAPI**

- Write concise, technical Python code with accurate examples
- Use functional, declarative programming; avoid classes where possible
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., is_active, has_permission)
- Use lowercase with underscores for directories and files (e.g., `features/scan_product/`)
- Favor named exports for routes and utility functions
- Use the Receive an Object, Return an Object (RORO) pattern

### **Python/FastAPI Specifics**

- Use `def` for pure functions and `async def` for asynchronous operations
- Use type hints for all function signatures
- Prefer Pydantic models over raw dictionaries for input validation
- File structure: exported router, sub-routes, utilities, static content, types (models, schemas)
- Use concise, one-line syntax for simple conditionals

### **Error Handling and Validation**

- Prioritize error handling and edge cases
- Handle errors at the beginning of functions
- Use early returns for error conditions
- Place the happy path last in the function
- Avoid unnecessary else statements; use if-return pattern
- Use guard clauses to handle preconditions early
- Implement proper error logging and user-friendly messages
- Use custom error types or error factories for consistency

### **Dependencies**

- FastAPI
- Pydantic v2
- Async database libraries like asyncpg
- SQLAlchemy 2.0 (if using ORM features)

### **FastAPI-Specific Guidelines**

- Use functional components (plain functions) and Pydantic models
- Use declarative route definitions with clear return type annotations
- Use `def` for synchronous, `async def` for asynchronous operations
- Minimize `@app.on_event`; prefer lifespan context managers
- Use middleware for logging, error monitoring, and performance
- Optimize for performance using async functions for I/O-bound tasks
- Use `HTTPException` for expected errors
- Use Pydantic's `BaseModel` for consistent validation

### **Performance Optimization**

- Minimize blocking I/O operations; use async for all database calls
- Implement caching for static and frequently accessed data (Redis or in-memory)
- Optimize data serialization with Pydantic
- Use lazy loading for large datasets and substantial API responses

### **Key Conventions**

1. Rely on FastAPI's dependency injection system
2. Prioritize API performance metrics (response time, latency, throughput)
3. Limit blocking operations in routes:
   - Favor asynchronous and non-blocking flows
   - Use dedicated async functions for database and external API operations
   - Structure routes and dependencies clearly

## 🔐 Security & Privacy

### **Data Handling**

- **User Data**: Minimal PII, use Supabase Auth user IDs
- **Guest Mode**: Local-only storage, optional account upgrade
- **GDPR**: Support data export and deletion endpoints
- **Rate Limiting**: Protect scan endpoint from abuse

### **Supabase RLS**

- Users can only read/write their own scans, favorites, preferences
- Corrections are readable by all, writable by users, modifiable by admins only
- Products are publicly readable, writable by backend service only

## 📋 Quick Reference

### **Essential Paths**

- **PRD**: `Docs/prd_scan_nutrition_app_react_native_fast_api_supabase.md`
- **Frontend**: `frontend/`
- **Backend**: `backend/`
- **API Docs**: Auto-generated at `http://localhost:8000/docs` (FastAPI)

### **Key Endpoints**

- `POST /api/v1/scan` - Scan product by barcode/QR
- `GET /api/v1/product/{id}` - Get product details
- `GET /api/v1/user/me` - Get user profile
- `POST /api/v1/user/preferences` - Update allergies/diets
- `POST /api/v1/corrections` - Submit product correction

### **External Integrations**

- **Open Food Facts**: Primary data source for product lookup
- **USDA FoodData Central**: Fallback for US products
- **Supabase**: Auth, Database, Storage

### **Before Any Feature**

- [ ] Read this guide
- [ ] Identify correct FSD layer (feature, entity, widget, shared)
- [ ] Check existing patterns in similar features
- [ ] Plan minimal implementation (MVP mindset)
- [ ] Consider mobile performance impact
- [ ] Test offline/error scenarios
- [ ] Clean up after completion
- [ ] Verify FSD import rules are followed

## 🚀 Performance Priorities

1. **Scan Speed**: Optimize barcode detection and API response time
2. **Caching**: Cache product data in Supabase and local storage
3. **Bundle Size**: Keep React Native bundle lean, lazy load heavy screens
4. **Image Loading**: Optimize product images, use thumbnails in lists
5. **Network**: Minimize API calls, batch when possible

## 🧪 Testing Strategy

- **Unit Tests**: Backend services, utility functions, data parsers
- **Integration Tests**: API endpoints with test database
- **E2E Tests**: Critical flows (scan → view product → save favorite)
- **Manual Testing**: Always test on real device, not just simulator

**Keep it simple, keep it clean, make it fast, make it work. Follow FSD principles for scalable architecture.**
