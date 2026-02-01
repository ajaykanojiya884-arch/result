#!/usr/bin/env python3
"""Test script: create a batch, switch to it, and print registry/active files.

Runs against a local backend (http://127.0.0.1:5000). Requires the dev
server to be running.
"""
import json
import urllib.request

BASE = 'http://127.0.0.1:5000'


def post(path, data, token=None):
    url = BASE + path
    b = json.dumps(data).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, data=b, headers=headers, method='POST')
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)


def login(userid, password):
    return post('/auth/login', {'userid': userid, 'password': password})


def main():
    print('Logging in as admin...')
    resp = login('admin', 'admin123')
    print('Login response keys:', list(resp.keys()))
    token = resp.get('token')
    if not token:
        print('Failed to obtain token')
        return

    print('Creating batch 2025...')
    try:
        cr = post('/admin/batches/create', {'batch_id': '2025', 'description': 'Test batch 2025'}, token=token)
        print('Create response:', cr)
    except Exception as e:
        print('Create failed:', e)

    print('Switching active batch to 2025...')
    try:
        sw = post('/admin/batches/switch', {'batch_id': '2025'}, token=token)
        print('Switch response:', sw)
    except Exception as e:
        print('Switch failed:', e)

    # Print registry and active batch file contents
    import os
    base_dir = os.path.dirname(os.path.dirname(__file__))
    reg_path = os.path.join(base_dir, 'registry.json')
    active_path = os.path.join(base_dir, 'active_batch.json')

    print('\nregistry.json:')
    try:
        with open(reg_path, 'r', encoding='utf-8') as f:
            print(json.dumps(json.load(f), indent=2))
    except Exception as e:
        print('Could not read registry.json:', e)

    print('\nactive_batch.json:')
    try:
        with open(active_path, 'r', encoding='utf-8') as f:
            print(json.dumps(json.load(f), indent=2))
    except Exception as e:
        print('Could not read active_batch.json:', e)


if __name__ == '__main__':
    main()
