import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from '../services/apiService';

describe('apiService Axios Interceptor', () => {
  beforeEach(() => {
    // Clear local storage and interceptors logic if needed
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should attach Authorization header when token exists', async () => {
    localStorage.setItem('token', 'test_token_123');
    
    // Simulate what the interceptor does directly to verify its logic
    // We can just test the interceptor function registered on the axios instance
    const interceptor = api.interceptors.request.handlers[0].fulfilled;
    const config = { headers: {} };
    
    const resultConfig = interceptor(config);
    expect(resultConfig.headers.Authorization).toBe('Bearer test_token_123');
  });

  it('should omit Authorization header when token does not exist', async () => {
    const interceptor = api.interceptors.request.handlers[0].fulfilled;
    const config = { headers: {} };
    
    const resultConfig = interceptor(config);
    expect(resultConfig.headers.Authorization).toBeUndefined();
  });
});
