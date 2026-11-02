import sys
import json
from pathlib import Path

# Add project root
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from backend.app import create_app

def run_tests():
    app = create_app()
    app.config['TESTING'] = True
    client = app.test_client()

    print("=" * 60)
    print("RUNNING AUTOMATED VERIFICATION SUITE")
    print("=" * 60)

    # 1. Health check
    res = client.get('/api/health')
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    print("[PASS] 1. API Health Check -> 200 OK")

    # 2. Static route check
    res = client.get('/login.html')
    assert res.status_code == 200, f"login.html failed: {res.status_code}"
    print("[PASS] 2. Static Frontend Serving (login.html) -> 200 OK")

    # 3. Unauthenticated access check on protected routes
    res = client.get('/api/admin/dashboard/stats')
    assert res.status_code == 401, f"Expected 401 Unauthorized, got: {res.status_code}"
    print("[PASS] 3. Protected Route Security Guard -> 401 Unauthorized without session")

    # 4. Invalid Admin Login
    res = client.post('/api/admin/login', json={'email': 'admin@tezu.ac.in', 'password': 'WrongPassword!'})
    assert res.status_code == 401, f"Expected 401 for wrong password, got: {res.status_code}"
    print("[PASS] 4. Invalid Admin Login Rejection -> 401 Unauthorized")

    # 5. Valid Admin Login
    res = client.post('/api/admin/login', json={'email': 'admin@tezu.ac.in', 'password': 'AdminPassword123'})
    assert res.status_code == 200, f"Expected 200, got: {res.status_code}"
    data = res.get_json()
    assert data['success'] is True
    print(f"[PASS] 5. Valid Admin Login -> 200 OK (User: {data['user']['name']})")

    # 6. Verify Session /me
    res = client.get('/api/admin/me')
    assert res.status_code == 200
    me_data = res.get_json()
    assert me_data['authenticated'] is True
    print("[PASS] 6. Admin Session Verification (/api/admin/me) -> 200 OK")

    # 7. Dashboard Stats
    res = client.get('/api/admin/dashboard/stats')
    assert res.status_code == 200
    stats = res.get_json()['stats']
    print(f"[PASS] 7. Dashboard KPI Stats -> Total: {stats['total']}, Submitted: {stats['submitted']}, Under Review: {stats['under_review']}, In Progress: {stats['in_progress']}, Resolved: {stats['resolved']}")

    # 8. Dashboard Charts
    res = client.get('/api/admin/dashboard/charts')
    assert res.status_code == 200
    chart_data = res.get_json()
    assert 'category_chart' in chart_data and 'status_chart' in chart_data
    print(f"[PASS] 8. Dashboard Chart Data -> Categories: {len(chart_data['category_chart'])}, Statuses: {len(chart_data['status_chart'])}")

    # 9. Complaints List with Filter & Search
    res = client.get('/api/admin/complaints?search=Gate&status=all&sort=newest')
    assert res.status_code == 200
    search_data = res.get_json()
    assert search_data['count'] >= 1
    print(f"[PASS] 9. Complaints Search & Filter -> Found {search_data['count']} matching complaints")

    # 10. Complaint Locations for Leaflet Map
    res = client.get('/api/admin/complaints/locations')
    assert res.status_code == 200
    locs = res.get_json()['locations']
    assert len(locs) >= 1
    print(f"[PASS] 10. Leaflet Map Coordinates -> {len(locs)} geo-tagged locations retrieved")

    # 11. Complaint Details & Timeline
    res = client.get('/api/admin/complaints/1')
    assert res.status_code == 200
    detail = res.get_json()
    assert detail['complaint']['complaint_id'] == 1
    print(f"[PASS] 11. Complaint Detail & Timeline -> ID #1 has {len(detail['history'])} history events")

    # 12. Complaint Status Update with Admin Remark
    res = client.post('/api/admin/complaints/1/status', json={
        'status': 'Resolved',
        'remark': 'Verified on site. Road patch repair successfully executed by civil cell.'
    })
    assert res.status_code == 200
    assert res.get_json()['new_status'] == 'Resolved'
    print("[PASS] 12. Complaint Status Transition & History Logging -> Successfully transitioned to 'Resolved'")

    # Verify history entry was written
    res = client.get('/api/admin/complaints/1/history')
    hist_events = res.get_json()['history']
    latest_event = hist_events[-1]
    assert latest_event['new_status'] == 'Resolved'
    assert 'Road patch repair' in latest_event['admin_remark']
    print("[PASS] 13. Audit Trail Verification -> Latest history entry verified in database")

    # 14. Citizens Registry
    res = client.get('/api/admin/citizens')
    assert res.status_code == 200
    citizens = res.get_json()['citizens']
    assert len(citizens) >= 4
    # Ensure password hash is not leaked
    assert 'password_hash' not in citizens[0]
    print(f"[PASS] 14. Citizens Registry -> {len(citizens)} registered citizens listed (passwords protected)")

    # 15. Reports & CSV Export
    res = client.get('/api/admin/reports/stats')
    assert res.status_code == 200
    print(f"[PASS] 15. Reports Analytics Stats -> Resolution Rate: {res.get_json()['summary']['resolution_rate']}%")

    res = client.get('/api/admin/reports/export-csv')
    assert res.status_code == 200
    assert 'text/csv' in res.content_type
    assert b'Complaint ID,Status,Category' in res.data
    print("[PASS] 16. CSV Report Export -> Valid streaming CSV format verified")

    # 17. Future Flutter Citizen Endpoints
    res = client.get('/api/citizen/complaints/user/2')
    assert res.status_code == 200
    cit_comps = res.get_json()['complaints']
    print(f"[PASS] 17. Citizen Flutter Integration API -> Retrieved {len(cit_comps)} complaints for citizen #2")

    print("=" * 60)
    print("ALL 17 VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
