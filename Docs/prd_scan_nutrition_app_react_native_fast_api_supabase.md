# Product Requirements Document

**Project:** Scan & Nutrition — Mobile app to scan QR/barcodes and surface ingredients, nutrition, allergens, health guidance, and personalized advice.

**Tech stack (chosen):**

- Frontend: React Native (Expo)
- Backend: Python + FastAPI
- Database/Auth/Storage: Supabase (Postgres, Auth, Storage)
- Caching / Jobs: Redis (optional) / Supabase edge functions for light tasks
- External data sources: Open Food Facts (primary), USDA FoodData Central (region-specific), optional paid APIs (Spoonacular/Nutritionix)

**Document version:** 1.0
**Date:** 2025-11-11
**Author:** Generated for user

---

## 1. Objective & Scope

**Objective:** Build a cross-platform mobile application (iOS & Android) that allows users to scan QR codes and barcodes on packaged products and immediately receive: full ingredient list, nutrition facts (per serving and per 100g), allergen flags, healthiness assessment, target audience cautions (e.g., for diabetics), origin/manufacturer metadata, and healthy alternatives. The system should support user preferences (allergies, diets), history, favorites, and crowdsourced corrections.

**Scope (MVP):**

- Scan QR or barcode (UPC/EAN/QR) via camera or manual entry
- Lookup product from internal DB or Open Food Facts
- Display product: name, brand, images, ingredients (raw + parsed), nutrition table, allergens highlighted, simple health score (Nutri-Score or heuristic)
- Save scan history and favorites
- User account (sign up / log in) and basic preferences (allergies, vegetarian/vegan)
- Submit corrections to product data (crowdsourced)
- Admin dashboard (web) for approving corrections and merging products

**Out of scope for MVP:** advanced ML ingredient decomposition, paid APIs integration, multi-lingual support (except basic), and deep personalization algorithms.

---

## 2. Target Users & Personas

1. **Health-conscious consumer (Alice)** — wants quick nutrition info and alerts for allergens.
2. **Allergy-sensitive parent (Ben)** — needs reliable allergen flags and ingredient clarity.
3. **Diet follower (Cara)** — follows vegetarian/vegan or low-sugar diets; wants alternatives and recommendations.
4. **Curious shopper (Dinesh)** — wants origin, manufacturer and to compare similar products.

Each persona primarily uses the mobile app to scan in-store or at home and expects fast responses (<1s ideally when cached).

---

## 3. High-level Features (MVP and Post-MVP)

### MVP Features

- Camera scanning (QR & barcode) + manual code entry
- Product lookup (Supabase products table → Open Food Facts fallback)
- Product detail view: images, ingredients, nutrition facts, allergens, health score, origin
- User auth (Supabase Auth) + profile (allergies, diet preferences)
- Scan history and favorites
- Corrections submission flow (user-initiated)
- Admin dashboard to review corrections & merge duplicates

### Post-MVP / Nice-to-have

- Nutri-Score algorithm & traffic-light labeling
- Advanced ingredient parsing (NER + spaCy)
- OCR on product images to extract label text
- Personalized recommendations and alternative suggestions
- Offline caching of recently scanned products
- Multi-language support and region-specific nutrition sources
- B2B integrations / retailer catalogs

---

## 4. User Flows & Wireframes (textual)

1. **Onboarding**
   - Optional: collect diet preferences & allergies.
   - Offer sign up
2. **Scan**
   - Camera view with scanning rectangle, flashlight toggle, manual input button, history icon.
   - On successful decode: display a concise product card while fetching details.
3. **Product details**
   - Top: product image(s), name, brand, origin
   - Section: Nutrition facts (per serving / per 100g)
   - Section: Ingredients (raw string + parsed list). Highlight allergens in red and show a summary: “Contains: milk, wheat”
   - Section: Health score with short explanation and what it means
   - Badges: vegetarian/vegan, high sugar, high sodium, contains allergens
   - Actions: Save favorite, Report correction, Compare, Share
4. **Profile**
   - Manage allergies, diets, notification preferences, data deletion
5. **Corrections (crowdsource)**
   - Simple form to edit fields; attach photos; submit. Status: pending/approved/rejected.
6. **Admin dashboard**
   - Queue of pending corrections, product duplicate detection, merge tools, product enrichment logs

---

## 5. Functional Requirements (detailed)

### FR-1: Scan product

- FR-1.1: App must decode EAN/UPC/QR codes using device camera (Expo + vision-camera or barcode scanner library)
- FR-1.2: If QR payload is a URL, identify if it contains a barcode or redirect to a product page and attempt to extract a barcode
- FR-1.3: Allow manual barcode entry

### FR-2: Product lookup & response

- FR-2.1: Query order: Supabase `products` table → Open Food Facts API → fallback external (if integrated)
- FR-2.2: Normalize product data and return a consistent Product DTO to the app
- FR-2.3: Cache successful lookups in Supabase or Redis for faster subsequent responses

### FR-3: Ingredients & allergens

- FR-3.1: Store `ingredients_raw` and `ingredients_parsed` in DB
- FR-3.2: Allergen mapping using a canonical allergen vocabulary (peanut, tree-nut, milk, egg, soy, wheat, fish, shellfish, sesame)
- FR-3.3: Highlight allergen occurrences in UI and provide an explicit allergen summary

### FR-4: Nutrition & health score

- FR-4.1: Store nutrition facts per 100g and per serving
- FR-4.2: Compute a simple health_score and explanation using deterministic rules (weight sugar, sat fat, salt)

### FR-5: User preferences & personalization

- FR-5.1: Allow users to record allergies and diet preferences
- FR-5.2: Use preferences to warn users on product view (e.g., "Contains: nuts — avoid")

### FR-6: Corrections workflow

- FR-6.1: Allow users to submit corrections with optional photo
- FR-6.2: Store corrections with status and allow admin review

### FR-7: Auth & security

- FR-7.1: Support Supabase Auth (email/password, OAuth providers)
- FR-7.2: Allow guest use with local-only history (option to upgrade)

---

## 6. Non-functional Requirements

- **Performance:** 90% of cached lookups < 500ms; uncached lookups < 1.5s depending on external API latency.
- **Availability:** 99.5% uptime for API services.
- **Scalability:** Design to scale reads for high scan volume (use caching and DB indices).
- **Security:** TLS everywhere, parametrized queries, role-based access for admin endpoints.
- **Privacy:** GDPR-compliant: user data export & deletion, minimal PII, clear consent on onboarding.
- **Localization-ready:** keep text keys and metadata ready for later translations.

---

## 7. Architecture & Technical Design (mapping to chosen stack)

### Frontend (React Native + Expo)

- Expo managed workflow
- Use `expo-camera` or `react-native-vision-camera` (with community plugins compatible with Expo) for scanning
- State management: React Query + Context for lightweight local state
- Network: Axios or fetch to FastAPI endpoints
- Local storage: SecureStore / AsyncStorage for guest history and cached products
- Auth: Supabase JS client for auth + session management

### Backend (Python + FastAPI)

- FastAPI app that exposes REST endpoints (or GraphQL in future)
- Dependency injection and Pydantic models for request/response validation
- Supabase Postgres as primary persistent store (products, corrections, users metadata). Use Supabase Auth for user management.
- Use Supabase Storage for product images uploaded by users
- Background jobs: Celery or RQ for enrichment tasks (image OCR, external sync)
- Caching layer: Redis (hosted) or Supabase Edge Cache / Postgres caching
- External integrations: Open Food Facts client, optional USDA API client

### Supabase

- Tables: products, users_meta, scans, favorites, corrections, admin_audit
- Auth: Supabase Auth (JWTs) with refresh
- Storage: images (product photos, user-submitted)
- Row-level security (RLS) for fine-grained access control (admin vs normal users)

### DevOps

- Deploy FastAPI on serverless container (Fly.io / Render / AWS Fargate) or Kubernetes
- CI/CD: GitHub Actions to run tests, build images, and deploy
- Monitoring: Sentry for exceptions, Prometheus/Grafana for metrics

---

## 8. Data Model (essential tables)

**products**

- id (uuid)
- barcode (text, unique)
- name (text)
- brand (text)
- category (text)
- manufacturer (text)
- country_of_sale (text)
- ingredients_raw (text)
- ingredients_parsed (jsonb)
- nutrition (jsonb) -- {per_100g: {...}, per_serving: {...}}
- allergens (text[])
- images (text[])
- health_score (numeric)
- source (text)
- created_at, updated_at

**users_meta** (additional profile data)

- user_id (uuid)
- allergies (text[])
- diets (text[])
- preferences (jsonb)

**scans**

- id (uuid)
- user_id (nullable)
- product_id
- scanned_at
- result_snapshot (jsonb)

**corrections**

- id
- product_id
- submitter_user_id
- field_name
- old_value
- new_value
- photo_url
- status (pending/approved/rejected)
- submitted_at, reviewed_at

---

## 9. API Surface (selected endpoints)

- `POST /api/v1/scan` — body: `{ code: string, type?: string, country?: string }` → returns Product DTO. Caching logic applied.
- `GET /api/v1/product/:id`
- `GET /api/v1/search?q=` — full text/product search
- `POST /api/v1/product/:id/correction` — create correction
- `POST /api/v1/auth/signup` — handled by Supabase Auth client on frontend
- `GET /api/v1/user/me` — returns profile and preferences
- `POST /api/v1/user/preferences` — update allergies/diets
- `GET /api/v1/recommendations?product_id=` — find healthier alternatives (post-MVP)

All endpoints return consistent JSON shapes with Pydantic validation and clear error codes.

---

## 10. User Stories & Acceptance Criteria (examples)

1. **As a user, I want to scan a product so I can view ingredients and nutrition.**
   - AC: Scanning a barcode opens the product details if present in DB or fetches from Open Food Facts and displays ingredients and nutrition.
2. **As an allergy-sensitive user, I want to be warned when a scanned product contains my allergens.**
   - AC: If user has allergy set to "peanut", any product with peanut in allergens shows a visible red warning on product page.
3. **As a user, I want to submit a correction to a product's ingredients.**
   - AC: User can submit a correction with optional photo; correction appears in Admin queue as pending.
4. **As a guest, I want to scan without creating an account.**
   - AC: Guest scans are stored locally and can be optionally migrated to an account upon signup.

---

## 11. Security & Privacy Considerations

- Use Supabase Auth — secure by default, but ensure secrets & keys are stored in CI secrets
- GDPR compliance: export/delete user data endpoints; minimal retention for guest histories unless user opts in
- Rate-limit public scanning endpoints to prevent scraping
- Validate and sanitize all user-submitted content (photos, correction text)
- Use row-level security in Supabase to restrict admin endpoints

---

## 12. Analytics & Metrics

Track: daily active users (DAU), scan volume, scan success rate (product found), average API latency, correction submission rate, retention (7/30-day), conversion guest→registered, and error rates.

Suggested tools: Supabase telemetry, Segment, Firebase Analytics, or Amplitude (post-MVP).

---

## 13. Testing Strategy

- Unit tests for Pydantic schemas, ingredient parser functions, and health-score logic (PyTest)
- Integration tests for API endpoints (FastAPI TestClient)
- E2E mobile tests (Detox or Appium) for scanning and product view flows
- Load testing for scan endpoint (k6)

---

## 14. Roadmap & Milestones (suggested timeline)

**Sprint 0 (1 week)**: Specs finalization, repo & infra setup, Supabase schema
**Sprint 1 (2 weeks)**: Camera scanning UI + manual input; basic FastAPI `scan` endpoint that fetches from Open Food Facts and returns normalized Product DTO
**Sprint 2 (2 weeks)**: Product detail UI, user auth (Supabase), profile preferences, scan history
**Sprint 3 (2 weeks)**: Corrections flow + admin dashboard MVP
**Sprint 4 (2 weeks)**: Health score implementation, allergen highlighting, caching & performance tuning
**Launch Beta (after ~9 weeks)**: Invite-only beta, monitor metrics, fix issues
**Post-beta (3 months)**: Add recommendations, image OCR, paid data sources, and advanced parsing

---

## 15. Success Metrics

- Scan success rate >= 80% within 6 weeks of launch
- DAU target for beta: 1,000 users in first month
- Conversion (guest→registered) >= 10%
- Correction approval throughput: average review time < 72 hours

---

## 16. Risks & Mitigations

- **Data coverage gaps:** many products might not exist in Open Food Facts. _Mitigation:_ encourage photo uploads and corrections; prioritize popular SKU imports.
- **Ambiguous ingredients (“natural flavours”):** may cause false negatives for allergens. _Mitigation:_ display unknown flags and advise caution; offer an option for users to mark severity.
- **External API rate limits / downtime:** _Mitigation:_ caching, retries, and fallback messaging.
- **Privacy/regulatory problems when giving health advice:** _Mitigation:_ include medical disclaimer and avoid prescriptive medical claims.

---

## 17. Appendix: Implementation notes & code pointers

- **Ingredient parsing starter:** Python with `rapidfuzz` for fuzzy matching and `spaCy` for tokenization. Keep mapping table for synonyms and allergen aliases in Supabase table `ingredient_aliases`.
- **Supabase tips:** use RLS policies for corrections to be insertable by users but only modifiable by admins; use Storage buckets with public read for product images but keep user-submitted images in a separate bucket with limited access.
- **FastAPI tips:** use `uvicorn` + `gunicorn` in production; enable gzip compression; use Pydantic models for DTOs; document APIs with OpenAPI (auto-generated) and secure admin endpoints with extra scopes.

---

## 18. Next immediate steps (recommendations)

1. Create Supabase project and apply the schema (tables listed in section 8).
2. Scaffold FastAPI project with core `POST /scan` and `GET /product/:id` endpoints and basic Open Food Facts adapter.
3. Scaffold Expo app with camera scanning screen wired to `POST /scan` and local result rendering.
4. Create admin dashboard skeleton (Next.js or simple React) pointing to Supabase for corrections queue.

---

If you'd like, I can now:

- Generate the Supabase SQL schema migration for the tables above,
- Scaffold FastAPI `scan` endpoint code (starter) including Open Food Facts adapter,
- Create Expo React Native scan screen code (starter), or
- Draft the admin dashboard wireframe and endpoints.

Tell me which of the above you want me to produce right away and I will generate it.
