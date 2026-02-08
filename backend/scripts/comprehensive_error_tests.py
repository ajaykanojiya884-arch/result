"""
Comprehensive test suite for operation error handling.
Tests all add/update/delete scenarios with detailed error validation.
"""

import requests
import json
import sys

BASE = 'http://127.0.0.1:5000'

def test_suite():
    """Run comprehensive error handling tests"""
    s = requests.Session()
    
    # Login
    print("Authenticating...")
    r = s.post(BASE + '/auth/login', json={'userid': 'admin', 'password': 'admin123'})
    if r.status_code != 200:
        print("❌ Login failed")
        return False
    
    tok = r.json().get('token')
    s.headers.update({'Authorization': f'Bearer {tok}'})
    print("✅ Authenticated\n")
    
    results = []
    
    # TEST 1: Add Valid Student
    print("TEST 1: Add Valid Student")
    r = s.post(BASE + '/admin/students', json={
        'roll_no': 'TEST-001',
        'name': 'Test Student',
        'division': 'A'
    })
    results.append(('Add valid student', r.status_code == 201))
    print(f"  Status: {r.status_code} - {'✅' if r.status_code == 201 else '❌'}")
    if r.status_code != 201:
        print(f"  Error: {r.json()}")
    
    # TEST 2: Add Duplicate Student
    print("\nTEST 2: Add Duplicate Student (same roll_no, division)")
    r = s.post(BASE + '/admin/students', json={
        'roll_no': 'TEST-001',
        'name': 'Another Student',
        'division': 'A'
    })
    has_detail = 'already exists' in r.json().get('error', '')
    results.append(('Duplicate student error detail', r.status_code == 409 and has_detail))
    print(f"  Status: {r.status_code} - {'✅' if r.status_code == 409 else '❌'}")
    print(f"  Error msg: {r.json().get('error')}")
    
    # TEST 3: Add Valid Teacher
    print("\nTEST 3: Add Valid Teacher")
    r = s.post(BASE + '/admin/teachers', json={
        'name': 'New Teacher',
        'userid': 'newtchr_' + str(int(1000 * __import__('time').time()) % 10000),
        'password': 'securepass123'
    })
    teacher_id = r.json().get('teacher_id')
    results.append(('Add valid teacher', r.status_code == 201 and teacher_id))
    print(f"  Status: {r.status_code} - {'✅' if r.status_code == 201 else '❌'}")
    print(f"  Teacher ID: {teacher_id}")
    
    # TEST 4: Add Duplicate Teacher (userid)
    print("\nTEST 4: Add Duplicate Teacher (same userid)")
    userid_duplicate = 'duptest_' + str(int(1000 * __import__('time').time()) % 10000)
    r1 = s.post(BASE + '/admin/teachers', json={
        'name': 'Teacher A',
        'userid': userid_duplicate,
        'password': 'pass123'
    })
    r2 = s.post(BASE + '/admin/teachers', json={
        'name': 'Teacher B',
        'userid': userid_duplicate,
        'password': 'pass456'
    })
    has_detail = 'already exists' in r2.json().get('error', '') or 'UserID' in r2.json().get('error', '')
    results.append(('Duplicate teacher error detail', r2.status_code == 409 and has_detail))
    print(f"  Second attempt status: {r2.status_code} - {'✅' if r2.status_code == 409 else '❌'}")
    print(f"  Error msg: {r2.json().get('error')}")
    
    # TEST 5: Missing Required Fields
    print("\nTEST 5: Missing Required Fields (name only)")
    r = s.post(BASE + '/admin/teachers', json={'name': 'Incomplete'})
    has_detail = 'required' in r.json().get('error', '').lower()
    results.append(('Missing fields error detail', r.status_code == 400 and has_detail))
    print(f"  Status: {r.status_code} - {'✅' if r.status_code == 400 else '❌'}")
    print(f"  Error msg: {r.json().get('error')}")
    
    # TEST 6: Update Valid Teacher
    if teacher_id:
        print(f"\nTEST 6: Update Valid Teacher (ID: {teacher_id})")
        r = s.put(BASE + f'/admin/teachers/{teacher_id}', json={
            'name': 'Updated Name'
        })
        results.append(('Update valid teacher', r.status_code == 200))
        print(f"  Status: {r.status_code} - {'✅' if r.status_code == 200 else '❌'}")
    
    # TEST 7: Update Non-existent Teacher
    print("\nTEST 7: Update Non-existent Teacher (ID: 99999)")
    r = s.put(BASE + '/admin/teachers/99999', json={'name': 'Ghost'})
    results.append(('Update non-existent error', r.status_code == 404))
    print(f"  Status: {r.status_code} - {'✅' if r.status_code == 404 else '❌'}")
    print(f"  Error msg: {r.json().get('error')}")
    
    # TEST 8: Delete Valid Teacher (if we have one)
    if teacher_id:
        print(f"\nTEST 8: Delete Valid Teacher (ID: {teacher_id})")
        r = s.delete(BASE + f'/admin/teachers/{teacher_id}')
        results.append(('Delete valid teacher', r.status_code == 200))
        print(f"  Status: {r.status_code} - {'✅' if r.status_code == 200 else '❌'}")
        print(f"  Message: {r.json().get('message')}")
    
    # TEST 9: Delete Non-existent Teacher
    print("\nTEST 9: Delete Non-existent Teacher (ID: 99999)")
    r = s.delete(BASE + '/admin/teachers/99999')
    results.append(('Delete non-existent error', r.status_code == 404))
    print(f"  Status: {r.status_code} - {'✅' if r.status_code == 404 else '❌'}")
    print(f"  Error msg: {r.json().get('error')}")
    
    # TEST 10: Alphanumeric Roll Numbers
    print("\nTEST 10: Alphanumeric Roll Numbers (e.g., A-01)")
    r = s.post(BASE + '/admin/students', json={
        'roll_no': 'A-01',
        'name': 'Student with alphanumeric roll',
        'division': 'A'
    })
    results.append(('Alphanumeric roll_no', r.status_code in [201, 409]))  # 409 if duplicate
    print(f"  Status: {r.status_code} - {'✅' if r.status_code in [201, 409] else '❌'}")
    if r.status_code != 201:
        print(f"  Note: {r.json().get('error', 'Duplicate or validation issue')}")
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status:10} | {test_name}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    print(f"\nTotal: {passed}/{total} tests passed")
    
    return passed == total

if __name__ == '__main__':
    try:
        success = test_suite()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Test suite error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
