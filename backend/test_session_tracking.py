#!/usr/bin/env python3
"""
Test script for session tracking endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1/cart"

def test_session_tracking():
    # Test session ID
    session_id = "test-session-123"

    print("=== Testing Session Tracking Endpoints ===\n")

    # 1. Get initial product count (should be 0)
    print("1. Getting initial product count...")
    response = requests.get(f"{BASE_URL}/session/{session_id}/product-count")
    if response.status_code == 200:
        data = response.json()
        print(f"   Initial count: {data['product_count']}")
    else:
        print(f"   Error: {response.status_code} - {response.text}")
        return

    # 2. Track some activities
    print("\n2. Tracking session activities...")
    activities = [
        (8, "view"),
        (7, "view"),
        (6, "add_to_cart"),
        (8, "add_to_cart"),
        (7, "remove_from_cart")
    ]

    for product_id, activity_type in activities:
        response = requests.post(
            f"{BASE_URL}/session/{session_id}/track-activity",
            params={"product_id": product_id, "activity_type": activity_type}
        )
        if response.status_code == 200:
            print(f"   ✓ Tracked {activity_type} for product {product_id}")
        else:
            print(f"   ✗ Failed to track {activity_type} for product {product_id}: {response.status_code}")

    # 3. Get updated product count
    print("\n3. Getting updated product count...")
    response = requests.get(f"{BASE_URL}/session/{session_id}/product-count")
    if response.status_code == 200:
        data = response.json()
        print(f"   Updated count: {data['product_count']}")
    else:
        print(f"   Error: {response.status_code} - {response.text}")

    # 4. Get session statistics
    print("\n4. Getting session statistics...")
    response = requests.get(f"{BASE_URL}/session/{session_id}/statistics")
    if response.status_code == 200:
        data = response.json()
        print("   Session statistics:")
        for key, value in data.items():
            print(f"     {key}: {value}")
    else:
        print(f"   Error: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_session_tracking()