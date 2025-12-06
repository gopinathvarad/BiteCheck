import pytest
from app.external.openfoodfacts import OpenFoodFactsClient

def test_parse_off_product_health_score_mapping():
    """Verify that nutriscore_score is correctly mapped to health_score"""
    client = OpenFoodFactsClient()
    
    # Test case 1: Positive score
    data = {
        "product_name": "Test Product",
        "nutriscore_score": 55,
        "brands": "Test Brand"
    }
    product = client._parse_off_product(data, "123456789")
    assert product.health_score == 55.0

    # Test case 2: Negative score
    data = {
        "product_name": "Healthy Product",
        "nutriscore_score": -2,
        "brands": "Healthy Brand"
    }
    product = client._parse_off_product(data, "987654321")
    assert product.health_score == -2.0

    # Test case 3: String score (should be converted)
    data = {
        "product_name": "String Score Product",
        "nutriscore_score": "10",
        "brands": "String Brand"
    }
    product = client._parse_off_product(data, "111222333")
    assert product.health_score == 10.0

def test_parse_off_product_missing_health_score():
    """Verify behavior when nutriscore_score is missing or invalid"""
    client = OpenFoodFactsClient()
    
    # Test case 1: Missing field
    data = {
        "product_name": "No Score Product",
        "brands": "No Score Brand"
    }
    product = client._parse_off_product(data, "123")
    assert product.health_score is None

    # Test case 2: None value
    data = {
        "product_name": "None Score Product",
        "nutriscore_score": None,
        "brands": "None Brand"
    }
    product = client._parse_off_product(data, "456")
    assert product.health_score is None

    # Test case 3: Invalid non-numeric value
    data = {
        "product_name": "Invalid Score Product",
        "nutriscore_score": "not-a-number",
        "brands": "Invalid Brand"
    }
    product = client._parse_off_product(data, "789")
    assert product.health_score is None
