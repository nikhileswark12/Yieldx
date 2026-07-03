def get_auth_token(client, email='predict@example.com'):
    client.post('/api/auth/register', json={
        'name': 'Predict User',
        'email': email,
        'password': 'password123'
    })
    res = client.post('/api/auth/login', json={
        'email': email,
        'password': 'password123'
    })
    return res.json['access_token']

def test_predict_yield_success(client):
    token = get_auth_token(client, 'p1@example.com')
    payload = {
        "crop_type": "wheat",
        "nitrogen": 50,
        "phosphorus": 50,
        "potassium": 50,
        "soil_ph": 6.5,
        "soil_type": "loamy",
        "temperature": 25.0,
        "humidity": 60.0,
        "rainfall": 150.0,
        "irrigation_type": "drip",
        "season": "rabi",
        "fertilizer_used": 100,
        "area_hectares": 2.0
    }
    headers = {'Authorization': f'Bearer {token}'}
    res = client.post('/api/predict/yield', json=payload, headers=headers)
    assert res.status_code == 200
    assert 'predicted_yield' in res.json

def test_predict_yield_no_token(client):
    payload = {"crop_type": "wheat"}
    res = client.post('/api/predict/yield', json=payload)
    assert res.status_code == 401

def test_predict_yield_missing_fields(client):
    token = get_auth_token(client, 'p2@example.com')
    # Missing multiple required fields (e.g. nitrogen)
    payload = {
        "crop_type": "wheat",
        "phosphorus": 50,
        "potassium": 50
    }
    headers = {'Authorization': f'Bearer {token}'}
    res = client.post('/api/predict/yield', json=payload, headers=headers)
    assert res.status_code == 400

def test_predict_yield_non_numeric(client):
    token = get_auth_token(client, 'p3@example.com')
    payload = {
        "crop_type": "wheat",
        "nitrogen": "fifty",  # Invalid type
        "phosphorus": 50,
        "potassium": 50,
        "soil_ph": 6.5,
        "soil_type": "loamy",
        "temperature": 25.0,
        "humidity": 60.0,
        "rainfall": 150.0,
        "irrigation_type": "drip",
        "season": "rabi",
        "fertilizer_used": 100,
        "area_hectares": 2.0
    }
    headers = {'Authorization': f'Bearer {token}'}
    res = client.post('/api/predict/yield', json=payload, headers=headers)
    assert res.status_code == 400

def test_predict_idor_and_not_found(client):
    token1 = get_auth_token(client, 'user1@example.com')
    token2 = get_auth_token(client, 'user2@example.com')
    
    # User 1 creates a prediction
    payload = {
        "crop_type": "wheat", "nitrogen": 50, "phosphorus": 50, "potassium": 50,
        "soil_ph": 6.5, "soil_type": "loamy", "temperature": 25.0, "humidity": 60.0,
        "rainfall": 150.0, "irrigation_type": "drip", "season": "rabi",
        "fertilizer_used": 100, "area_hectares": 2.0
    }
    res1 = client.post('/api/predict/yield', json=payload, headers={'Authorization': f'Bearer {token1}'})
    assert res1.status_code == 200
    pred_id = res1.json['prediction_id']
    
    # User 1 fetches their own prediction
    res_fetch1 = client.get(f'/api/predict/{pred_id}', headers={'Authorization': f'Bearer {token1}'})
    assert res_fetch1.status_code == 200
    
    # User 2 tries to fetch User 1's prediction (IDOR check)
    res_fetch2 = client.get(f'/api/predict/{pred_id}', headers={'Authorization': f'Bearer {token2}'})
    assert res_fetch2.status_code in [403, 404]
    
    # User 1 requests a non-existent prediction
    res_fetch_none = client.get('/api/predict/999999', headers={'Authorization': f'Bearer {token1}'})
    assert res_fetch_none.status_code == 404

def test_rate_limiting(client):
    token = get_auth_token(client, 'p_limit@example.com')
    payload = {
        "crop_type": "wheat", "nitrogen": 50, "phosphorus": 50, "potassium": 50,
        "soil_ph": 6.5, "soil_type": "loamy", "temperature": 25.0, "humidity": 60.0,
        "rainfall": 150.0, "irrigation_type": "drip", "season": "rabi",
        "fertilizer_used": 100, "area_hectares": 2.0
    }
    headers = {'Authorization': f'Bearer {token}'}
    
    # Assuming limit is 10/min, 11th should fail.
    for _ in range(10):
        client.post('/api/predict/yield', json=payload, headers=headers)
        
    res = client.post('/api/predict/yield', json=payload, headers=headers)
    assert res.status_code == 429
