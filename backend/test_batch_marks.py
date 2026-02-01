#!/usr/bin/env python3
"""
Test script for batch marks endpoint
Tests the /teacher/marks/batch POST endpoint with sample data
"""
import requests
import json
import time

base_url = 'http://127.0.0.1:5000'

def test_batch_marks():
    """Test batch marks upload"""
    session = requests.Session()
    
    # Login as teacher
    print("1. Testing login...")
    login_resp = session.post(
        f'{base_url}/auth/login',
        json={'userid': 'Teacher1', 'password': 'pass1234'},
        timeout=5
    )
    
    if login_resp.status_code != 200:
        print(f"❌ Login failed: {login_resp.status_code}")
        print(login_resp.text)
        return False
    
    token = login_resp.json().get('token')
    session.headers.update({'Authorization': f'Bearer {token}'})
    print(f"✓ Login successful, token: {token[:200]}...")
    
    # Test batch marks
    print("\n2. Testing batch marks POST...")
    batch_data = {
        "entries": [
            {
                "roll_no": "B-01",
                "division": "B",
                "subject_id": 1,  # ENG
                "unit1": 20.0,
                "unit2": 22.0,
                "term": 40.0,
                "annual": 80.0,
                "internal": 0.0
            },
            {
                "roll_no": "B-02",
                "division": "B",
                "subject_id": 1,  # ENG
                "unit1": 19.0,
                "unit2": 21.0,
                "term": 38.0,
                "annual": 82.0,
                "internal": 0.0
            }
        ]
    }
    
    resp = session.post(
        f'{base_url}/teacher/marks/batch',
        json=batch_data,
        timeout=5
    )
    
    print(f"Response Status: {resp.status_code}")
    print(f"Response Body: {json.dumps(resp.json(), indent=2)}")
    
    if resp.status_code == 200:
        print("✓ Batch marks endpoint returned 200 OK")
        result = resp.json()
        saved = result.get('saved') or []
        warnings = result.get('validation_warnings') or []
        if len(saved) == 1 and len(warnings) == 1:
            print(f"✓ Saved {len(saved)} mark and {len(warnings)} validation warning")
            return True
        else:
            print("❌ Unexpected save/warning counts")
            return False
    else:
        print(f"❌ Batch marks endpoint returned {resp.status_code}")
        return False

if __name__ == '__main__':
    try:
        success = test_batch_marks()
        exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Test error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
