# Feature Slice Design (FSD) Migration Summary

## Overview

The BiteCheck project has been restructured to follow **Feature Slice Design (FSD)** methodology for both frontend and backend. This provides a scalable, maintainable architecture that organizes code by business features rather than technical layers.

## Changes Made

### Frontend Structure (FSD)

#### New Structure
```
frontend/
├── app/                    # Expo Router (file-based routing)
├── processes/             # Complex multi-step user flows
├── pages/                 # Full-page compositions (if needed)
├── widgets/               # Large independent UI blocks
├── features/              # Business features (self-contained)
│   ├── scan/
│   ├── product/
│   ├── favorites/
│   ├── history/
│   └── auth/
├── entities/              # Business entities (data models)
│   ├── product/
│   ├── user/
│   └── scan/
└── shared/                 # Shared code (reusable across slices)
    ├── ui/
    ├── lib/
    ├── api/
    └── types/
```

#### Key Changes
1. **Types moved to entities**: `types/index.ts` → `entities/{entity}/model/types.ts`
2. **API client moved to shared**: `lib/api.ts` → `shared/api/client.ts`
3. **Supabase client moved to shared**: `lib/supabase.ts` → `shared/lib/supabase.ts`
4. **Feature APIs created**: Each feature now has its own `api/` directory
5. **Backward compatibility**: Old paths (`lib/`, `types/`) now re-export from new locations

### Backend Structure (Vertical Slices)

#### New Structure
```
backend/
├── app/
│   ├── api/v1/endpoints/  # Thin route handlers (controllers)
│   ├── features/          # Business features (vertical slices)
│   │   ├── scan/
│   │   ├── product/
│   │   ├── user/
│   │   └── correction/
│   ├── entities/          # Business entities
│   │   └── product/
│   ├── shared/            # Shared code
│   │   ├── models/
│   │   ├── utils/
│   │   └── exceptions/
│   ├── external/          # External API clients
│   └── core/              # Core configuration
```

#### Key Changes
1. **Models moved to entities**: `app/models/product.py` → `app/entities/product/models.py`
2. **Services moved to features**: `app/services/{service}.py` → `app/features/{feature}/service.py`
3. **Feature models created**: Each feature has its own `models.py` for request/response models
4. **Endpoints updated**: All endpoints now import from feature slices

## Import Rules (FSD)

### Frontend
- ✅ Features can import from: entities, shared
- ✅ Widgets can import from: features, entities, shared
- ✅ Pages can import from: widgets, features, entities, shared
- ✅ Processes can import from: pages, widgets, features, entities, shared
- ✅ App can import from: all layers
- ❌ Never import from higher layers (no circular dependencies)
- ❌ Features cannot import from other features directly

### Backend
- ✅ Endpoints import from: features
- ✅ Features can import from: entities, shared, external
- ✅ Entities are self-contained
- ✅ Shared code is used across features

## Migration Guide

### For Frontend Developers

**Old way:**
```typescript
import { Product } from '../../types';
import apiClient from '../../lib/api';
```

**New way:**
```typescript
import { Product } from '../../entities/product/model/types';
import { scanProduct } from '../../features/scan/api/scan-api';
```

**Or use shared types:**
```typescript
import { Product } from '../../shared/types';
```

### For Backend Developers

**Old way:**
```python
from app.models.product import Product
from app.services.product_service import ProductService
```

**New way:**
```python
from app.entities.product.models import Product
from app.features.product.service import ProductService
```

## Files Removed

### Frontend
- None (backward compatibility maintained via re-exports)

### Backend
- `app/models/product.py` (moved to `app/entities/product/models.py`)
- `app/services/product_service.py` (moved to `app/features/product/service.py`)
- `app/services/user_service.py` (moved to `app/features/user/service.py`)
- `app/services/correction_service.py` (moved to `app/features/correction/service.py`)

## Next Steps

1. **Update existing screens**: Gradually migrate remaining screens to use new FSD structure
2. **Create feature UI components**: Extract reusable UI from screens into feature `ui/` directories
3. **Add widgets**: Create large independent UI blocks in `widgets/` when needed
4. **Create processes**: Extract complex multi-step flows to `processes/` when needed
5. **Remove backward compatibility**: After full migration, remove old re-export aliases

## Benefits

1. **Scalability**: Easy to add new features without affecting existing code
2. **Maintainability**: Clear separation of concerns, easy to locate code
3. **Testability**: Features are self-contained, easier to test
4. **Team Collaboration**: Multiple developers can work on different features simultaneously
5. **Code Reusability**: Shared code is clearly identified and reusable

## References

- [Feature Slice Design Documentation](https://feature-sliced.design/)
- Updated `Docs/project_design_philosophy.md` for full FSD guidelines

