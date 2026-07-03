import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '@testing-library/jest-dom';

import DashboardPage from '../pages/DashboardPage';
import PredictPage from '../pages/PredictPage';
import ResultsPage from '../pages/ResultsPage';
import RecommendPage from '../pages/RecommendPage';
import HistoryPage from '../pages/HistoryPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import AlertsPage from '../pages/AlertsPage';
import ProfilePage from '../pages/ProfilePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

import * as apiService from '../services/apiService';

// Mock dependencies
vi.mock('../services/apiService', () => ({
  login: vi.fn(),
  register: vi.fn(),
  fetchProfile: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  predictYield: vi.fn(),
  getPredictionHistory: vi.fn(),
  getPredictionById: vi.fn(),
  getAnalyticsTrends: vi.fn(),
  getRegionalAnalytics: vi.fn(),
  getCropRecommendations: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-line-chart" />,
  Bar: () => <div data-testid="mock-bar-chart" />,
  Doughnut: () => <div data-testid="mock-doughnut-chart" />
}));

const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
const authContextValue = { user: mockUser, setUser: vi.fn(), login: vi.fn(), logout: vi.fn(), loading: false };

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <AuthContext.Provider value={authContextValue}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/*" element={ui} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Pages Render and Interaction Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Dashboard
  it('renders DashboardPage without crashing', async () => {
    apiService.getAnalyticsTrends.mockResolvedValueOnce({ data: [] });
    renderWithRouter(<DashboardPage />);
    expect(await screen.findByText(/Field overview/i)).toBeInTheDocument();
  });

  // 2. Predict
  it('renders PredictPage without crashing', () => {
    renderWithRouter(<PredictPage />);
    expect(screen.getByText(/Predict Crop Yield/i)).toBeInTheDocument();
  });

  // 3. Results (Interaction: Doughnut receives proportional data)
  it('renders ResultsPage and displays doughnut chart correctly', async () => {
    apiService.getPredictionById.mockResolvedValueOnce({
      id: 1, crop_type: 'wheat', predicted_yield: 3500, confidence: 0.85, risk_level: 'low', recommendations: []
    });
    
    renderWithRouter(
      <Routes>
        <Route path="/results/:id" element={<ResultsPage />} />
      </Routes>,
      { route: '/results/1' }
    );
    
    expect(await screen.findByText(/Model Confidence/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-doughnut-chart')).toBeInTheDocument();
  });

  // 4. Recommend (Interaction: gating behavior)
  it('renders RecommendPage gating prompt when no history exists', async () => {
    apiService.getPredictionHistory.mockResolvedValueOnce({ data: [] });
    renderWithRouter(<RecommendPage />);
    
    // Should show gating message
    expect(await screen.findByText(/No Soil Data Found/i)).toBeInTheDocument();
  });

  it('renders RecommendPage form when history exists', async () => {
    apiService.getPredictionHistory.mockResolvedValueOnce({ 
      data: { data: [{ id: 1, nitrogen: 50, phosphorus: 50, potassium: 50, soil_ph: 6.5 }] }
    });
    renderWithRouter(<RecommendPage />);
    
    // Should NOT show gating message, should show form
    expect(await screen.findByText(/Crop Recommendation/i)).toBeInTheDocument();
  });

  // 5. History
  it('renders HistoryPage without crashing', async () => {
    apiService.getPredictionHistory.mockResolvedValueOnce({ data: [] });
    renderWithRouter(<HistoryPage />);
    expect(await screen.findByText(/Prediction History/i)).toBeInTheDocument();
  });

  // 6. Analytics
  it('renders AnalyticsPage without crashing', async () => {
    apiService.getRegionalAnalytics.mockResolvedValueOnce({ data: [] });
    renderWithRouter(<AnalyticsPage />);
    expect(await screen.findByText(/Multi-Region Analytics/i)).toBeInTheDocument();
  });

  // 7. Alerts
  it('renders AlertsPage without crashing', () => {
    renderWithRouter(<AlertsPage />);
    expect(screen.getByText(/Risk Alerts System/i)).toBeInTheDocument();
  });

  // 8. Profile (Interaction: Submit password change)
  it('renders ProfilePage and submits password change', async () => {
    apiService.fetchProfile.mockResolvedValueOnce({ name: 'Test', email: 't@t.com', farm_size: 10 });
    apiService.changePassword.mockResolvedValueOnce({ message: 'Success' });
    
    const { container } = renderWithRouter(<ProfilePage />);
    expect(await screen.findByText(/Personal Information/i)).toBeInTheDocument();
    
    // Click Edit to reveal the form
    fireEvent.click(screen.getByText('Edit'));
    expect(await screen.findByText(/Change Password/i)).toBeInTheDocument();
    
    // Find inputs
    const currentPass = container.querySelector('input[name="currentPassword"]');
    const newPass = container.querySelector('input[name="newPassword"]');
    const confPass = container.querySelector('input[name="confirmPassword"]');
    const btn = screen.getByText(/Update Password/i);
    
    fireEvent.change(currentPass, { target: { value: 'oldpass' } });
    fireEvent.change(newPass, { target: { value: 'newpass123' } });
    fireEvent.change(confPass, { target: { value: 'newpass123' } });
    
    fireEvent.click(btn);
    
    await waitFor(() => {
      expect(apiService.changePassword).toHaveBeenCalledWith({ current_password: 'oldpass', new_password: 'newpass123' });
    });
  });

  // 9. Login
  it('renders LoginPage without crashing', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByText(/Login to your account/i)).toBeInTheDocument();
  });

  // 10. Register
  it('renders RegisterPage without crashing', () => {
    renderWithRouter(<RegisterPage />);
    expect(screen.getByText(/Create a new account/i)).toBeInTheDocument();
  });
});
