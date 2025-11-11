# 🏗️ BiteCheck Development Guide

## 🎯 MVP Philosophy: Keep It Simple

**This is an MVP - NO OVER-ENGINEERING**

- Build features that work, not perfect systems
- Prioritize functionality over complexity
- Clean, lean, modular code only
- Remove redundant code immediately after changes
- **Mobile-first**: Optimize for fast scanning and instant feedback

## 🏛️ Architecture Principles

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

### **Key Layers**

- **Frontend**: `frontend/` (React Native + Expo Router)
  - `app/` - Expo Router screens (file-based routing)
  - `lib/` - Utilities (Supabase client, API client)
  - `types/` - TypeScript type definitions
  - `components/` - Reusable UI components (create as needed)
  - `hooks/` - Custom React hooks (create as needed)

- **Backend**: `backend/` (FastAPI + Supabase)
  - `app/api/v1/endpoints/` - API route handlers
  - `app/models/` - Pydantic models for request/response
  - `app/services/` - Business logic layer
  - `app/external/` - External API clients (Open Food Facts, USDA)
  - `app/core/` - Configuration and database setup

- **Database**: Supabase (Postgres + Auth + Storage)
  - Managed via Supabase dashboard or migrations
  - Use RLS policies for security

- **Documentation**: `Docs/` (PRD, Architecture, API docs)

## 🔧 Development Rules

### **Code Quality Standards**

- **Clean After Changes**: Remove redundant code immediately
- **No Dead Code**: Delete unused functions, imports, components
- **Modular Design**: Each module has single responsibility
- **Type Safety**: Full TypeScript coverage required (frontend), Pydantic models (backend)
- **Performance**: Profile scan flow regularly, optimize hot paths

### **Feature Development Process**

1. **Backend**: Create endpoint → Pydantic model → service → external client (if needed)
2. **Frontend**: Create screen → API integration → UI components → types
3. **Database**: Update Supabase schema if needed → test RLS policies
4. **Clean Up**: Remove unused code, optimize imports, check bundle size
5. **Test**: Verify functionality works end-to-end, test offline scenarios

### **Component Placement**

- **Screen-specific**: `app/(tabs)/` or `app/(auth)/` - keep logic in screen files
- **Reusable UI**: `components/` - only when used in 2+ places
- **Business logic**: Backend services or Supabase RPC functions
- **Data fetching**: React Query hooks in screen files or custom hooks

### **Mobile-Specific Guidelines**

- **Offline Support**: Cache recent scans locally, sync when online
- **Camera Permissions**: Handle gracefully, provide manual entry fallback
- **Network Errors**: Show clear messages, allow retry
- **Loading States**: Show skeleton screens, not just spinners
- **Error Boundaries**: Wrap screens to prevent full app crashes

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
- [ ] Check existing patterns in similar features
- [ ] Plan minimal implementation (MVP mindset)
- [ ] Consider mobile performance impact
- [ ] Test offline/error scenarios
- [ ] Clean up after completion

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

**Keep it simple, keep it clean, make it fast, make it work.**

