"""Product entity models"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class NutritionFacts(BaseModel):
    """Nutrition facts per 100g or per serving"""
    energy_kcal: Optional[float] = None
    energy_kj: Optional[float] = None
    fat: Optional[float] = None
    saturated_fat: Optional[float] = None
    carbohydrates: Optional[float] = None
    sugars: Optional[float] = None
    fiber: Optional[float] = None
    proteins: Optional[float] = None
    salt: Optional[float] = None
    sodium: Optional[float] = None


class Nutrition(BaseModel):
    """Nutrition information"""
    per_100g: Optional[NutritionFacts] = None
    per_serving: Optional[NutritionFacts] = None


class Product(BaseModel):
    """Product model"""
    id: Optional[str] = None
    barcode: str
    name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    country_of_sale: Optional[str] = None
    ingredients_raw: Optional[str] = None
    ingredients_parsed: Optional[List[str]] = None
    nutrition: Optional[Nutrition] = None
    allergens: Optional[List[str]] = None
    warnings: Optional[List[str]] = None
    images: Optional[List[str]] = None
    health_score: Optional[float] = None
    source: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

