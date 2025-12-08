"""Open Food Facts API client"""

import httpx
from typing import Optional
from app.core.config import settings
from app.entities.product.models import Product, Nutrition, NutritionFacts


class OpenFoodFactsClient:
    """Client for Open Food Facts API"""
    
    def __init__(self):
        self.base_url = settings.OPEN_FOOD_FACTS_BASE_URL
        self.timeout = 10.0
    
    async def get_product_by_barcode(self, barcode: str) -> Optional[Product]:
        """
        Fetch product from Open Food Facts by barcode
        
        Args:
            barcode: Product barcode (EAN, UPC, etc.)
        
        Returns:
            Product object or None if not found
        """
        try:
            headers = {
                "User-Agent": "BiteCheck/1.0 (Integration Test)",
                "Accept": "application/json"
            }
            async with httpx.AsyncClient(timeout=self.timeout, headers=headers) as client:
                url = f"{self.base_url}/product/{barcode}.json"
                response = await client.get(url)
                
                if response.status_code == 404:
                    print(f"OFF returned 404 for barcode: {barcode}")
                    return None
                
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") == 0:
                    print(f"OFF returned status 0 for {barcode}: {data.get('status_verbose')}")
                    return None
                
                product_data = data.get("product", {})
                return self._parse_off_product(product_data, barcode)
        
        except httpx.HTTPError as e:
            print(f"Error fetching from Open Food Facts: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error: {e}")
            return None
    
    def _parse_off_product(self, data: dict, barcode: str) -> Product:
        """Parse Open Food Facts product data into Product model"""
        
        # Parse nutrition facts
        nutrition = None
        if data.get("nutriments"):
            nutriments = data["nutriments"]
            per_100g = NutritionFacts(
                energy_kcal=nutriments.get("energy-kcal_100g"),
                energy_kj=nutriments.get("energy-kj_100g"),
                fat=nutriments.get("fat_100g"),
                saturated_fat=nutriments.get("saturated-fat_100g"),
                carbohydrates=nutriments.get("carbohydrates_100g"),
                sugars=nutriments.get("sugars_100g"),
                fiber=nutriments.get("fiber_100g"),
                proteins=nutriments.get("proteins_100g"),
                salt=nutriments.get("salt_100g"),
                sodium=nutriments.get("sodium_100g"),
            )
            nutrition = Nutrition(per_100g=per_100g)
        
        # Parse allergens
        allergens = []
        if data.get("allergens"):
            allergens = [a.strip() for a in data["allergens"].split(",")]
        elif data.get("allergens_tags"):
            allergens = data["allergens_tags"]
        
        # Parse ingredients
        ingredients_parsed = None
        if data.get("ingredients"):
            ingredients_parsed = [
                ing.get("text", "") for ing in data["ingredients"]
                if ing.get("text")
            ]
        
        # Parse images
        images = []
        if data.get("image_url"):
            images.append(data["image_url"])
        if data.get("image_small_url"):
            images.append(data["image_small_url"])
        
        # Parse health score
        health_score = None
        if data.get("nutriscore_score") is not None:
             try:
                 health_score = float(data["nutriscore_score"])
             except (ValueError, TypeError):
                 pass

        return Product(
            barcode=barcode,
            name=data.get("product_name", ""),
            brand=data.get("brands", ""),
            category=data.get("categories", ""),
            manufacturer=data.get("manufacturer", ""),
            country_of_sale=data.get("countries", ""),
            ingredients_raw=data.get("ingredients_text", ""),
            ingredients_parsed=ingredients_parsed,
            nutrition=nutrition,
            allergens=allergens if allergens else None,
            images=images if images else None,
            health_score=health_score,
            source="openfoodfacts"
        )

