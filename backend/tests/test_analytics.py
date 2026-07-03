def get_auth_token(client, email):
    client.post('/api/auth/register', json={
        'name': 'Analytics User',
        'email': email,
        'password': 'password123'
    })
    res = client.post('/api/auth/login', json={
        'email': email,
        'password': 'password123'
    })
    return res.json['access_token']

def test_analytics_no_data(client):
    token = get_auth_token(client, 'a1@example.com')
    headers = {'Authorization': f'Bearer {token}'}
    # No predictions made yet
    res = client.get('/api/analytics/summary', headers=headers)
    assert res.status_code == 200
    assert 'total_predictions' in res.json
    assert res.json['total_predictions'] == 0

def test_analytics_with_data(client):
    token = get_auth_token(client, 'a2@example.com')
    headers = {'Authorization': f'Bearer {token}'}
    
    # Create a prediction
    payload = {
        "crop_type": "wheat", "nitrogen": 50, "phosphorus": 50, "potassium": 50,
        "soil_ph": 6.5, "soil_type": "loamy", "temperature": 25.0, "humidity": 60.0,
        "rainfall": 150.0, "irrigation_type": "drip", "season": "rabi",
        "fertilizer_used": 100, "area_hectares": 2.0
    }
    client.post('/api/predict/yield', json=payload, headers=headers)
    
    # Fetch analytics
    res = client.get('/api/analytics/summary', headers=headers)
    assert res.status_code == 200
    assert 'total_predictions' in res.json
    assert res.json['total_predictions'] > 0

def test_analytics_unauthorized(client):
    res = client.get('/api/analytics/summary')
    assert res.status_code == 401
