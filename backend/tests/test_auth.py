def test_successful_registration(client):
    response = client.post('/api/auth/register', json={
        'name': 'Test User',
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert response.status_code == 201
    assert 'message' in response.json

def test_duplicate_registration(client):
    client.post('/api/auth/register', json={
        'name': 'Test User',
        'email': 'test2@example.com',
        'password': 'password123'
    })
    response = client.post('/api/auth/register', json={
        'name': 'Test User 2',
        'email': 'test2@example.com',
        'password': 'password123'
    })
    assert response.status_code == 400

def test_missing_fields_registration(client):
    response = client.post('/api/auth/register', json={
        'name': 'Test User',
        'email': 'test3@example.com'
    })
    assert response.status_code == 400

def test_successful_login(client):
    client.post('/api/auth/register', json={
        'name': 'Test User',
        'email': 'test_login@example.com',
        'password': 'password123'
    })
    response = client.post('/api/auth/login', json={
        'email': 'test_login@example.com',
        'password': 'password123'
    })
    assert response.status_code == 200
    assert 'access_token' in response.json

def test_login_wrong_password(client):
    client.post('/api/auth/register', json={
        'name': 'Test User',
        'email': 'test_wrong@example.com',
        'password': 'password123'
    })
    response = client.post('/api/auth/login', json={
        'email': 'test_wrong@example.com',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401

def test_auth_rate_limiting(client):
    client.post('/api/auth/register', json={
        'name': 'Test User',
        'email': 'test_rl@example.com',
        'password': 'password123'
    })
    
    # 5 allowed attempts
    for _ in range(5):
        res = client.post('/api/auth/login', json={
            'email': 'test_rl@example.com',
            'password': 'wrongpassword'
        })
        assert res.status_code == 401

    # 6th attempt should be 429
    res = client.post('/api/auth/login', json={
        'email': 'test_rl@example.com',
        'password': 'wrongpassword'
    })
    assert res.status_code == 429

def test_cors_origin(client):
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    }, headers={'Origin': 'http://evil.com'})
    # CORS usually allows preflight or processes request but doesn't return Allow-Origin for evil.com
    # Werkzeug test client might not simulate CORS fully unless flask-cors is strict on request
    # If the response goes through but doesn't have the CORS headers, it's valid test.
    # We will just verify it does not return Access-Control-Allow-Origin: http://evil.com
    assert response.headers.get('Access-Control-Allow-Origin') != 'http://evil.com'
