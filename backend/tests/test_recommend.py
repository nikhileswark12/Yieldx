def get_auth_token(client, email):
    client.post('/api/auth/register', json={
        'name': 'Recommend User',
        'email': email,
        'password': 'password123'
    })
    res = client.post('/api/auth/login', json={
        'email': email,
        'password': 'password123'
    })
    return res.json['access_token']

def test_recommend_success(client):
    token = get_auth_token(client, 'r1@example.com')
    payload = {
        "nitrogen": 50,
        "phosphorus": 50,
        "potassium": 50,
        "soil_ph": 6.5,
        "temperature": 25.0,
        "humidity": 60.0,
        "rainfall": 150.0
    }
    headers = {'Authorization': f'Bearer {token}'}
    res = client.post('/api/predict/crop', json=payload, headers=headers)
    assert res.status_code == 200
    assert 'recommendations' in res.json
    assert isinstance(res.json['recommendations'], list)

def test_recommend_missing_fields(client):
    token = get_auth_token(client, 'r2@example.com')
    # Missing temperature, rainfall, etc
    payload = {
        "nitrogen": 50,
        "phosphorus": 50
    }
    headers = {'Authorization': f'Bearer {token}'}
    res = client.post('/api/predict/crop', json=payload, headers=headers)
    assert res.status_code == 400
    assert 'error' in res.json

def test_recommend_unauthorized(client):
    res = client.post('/api/predict/crop', json={"nitrogen": 50})
    assert res.status_code == 401
