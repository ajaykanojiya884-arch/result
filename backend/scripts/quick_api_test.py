import requests
import json

BASE = 'http://127.0.0.1:5000'

s = requests.Session()
print('Logging in as admin...')
r = s.post(BASE + '/auth/login', json={'userid': 'admin', 'password': 'admin123'})
print('Login status', r.status_code, r.text)
if r.status_code != 200:
    raise SystemExit('login failed')

tok = r.json().get('token')
s.headers.update({'Authorization': f'Bearer {tok}'})

# Add student
print('\nAdd student:')
student = {'roll_no': '900', 'name': 'Test Student', 'division': 'A'}
r = s.post(BASE + '/admin/students', json=student)
print('POST /admin/students', r.status_code, r.text)

# Add teacher
print('\nAdd teacher:')
teacher = {'name': 'Test Teacher', 'userid': 'test_teacher', 'password': 'pass1234', 'email': 'test@example.com'}
r = s.post(BASE + '/admin/teachers', json=teacher)
print('POST /admin/teachers', r.status_code, r.text)

# List teachers
r = s.get(BASE + '/admin/teachers')
print('GET /admin/teachers', r.status_code, r.text)

# Update teacher (if exists)
if r.status_code == 200 and isinstance(r.json(), list) and r.json():
    t = r.json()[-1]
    tid = t.get('teacher_id')
    print('\nUpdate teacher id', tid)
    r2 = s.put(BASE + f'/admin/teachers/{tid}', json={'name': 'Updated Name'})
    print('PUT /admin/teachers/{tid}', r2.status_code, r2.text)

    # Delete teacher
    print('\nDelete teacher id', tid)
    r3 = s.delete(BASE + f'/admin/teachers/{tid}')
    print('DELETE /admin/teachers/{tid}', r3.status_code, r3.text)

print('\nDone')