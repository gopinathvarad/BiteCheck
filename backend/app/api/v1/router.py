"""API v1 router"""

from fastapi import APIRouter
from app.api.v1.endpoints import scan, product, user, corrections, admin

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(scan.router, prefix="/scan", tags=["scan"])
api_router.include_router(product.router, prefix="/product", tags=["product"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(corrections.router, prefix="/corrections", tags=["corrections"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

