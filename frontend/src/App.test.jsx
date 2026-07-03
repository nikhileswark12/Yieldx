import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PredictPage from './pages/PredictPage';
import DashboardPage from './pages/DashboardPage';
import { AuthContext } from './context/AuthContext';
import * as apiService from './services/apiService';
import { vi } from 'vitest';

// Mock chart.js to prevent canvas errors
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-chart">Chart</div>,
  Doughnut: () => <div data-testid="mock-chart">Chart</div>,
  Bar: () => <div data-testid="mock-chart">Chart</div>
}));

// Mock CountUp to render instantly in tests
vi.mock('./components/CountUp', () => ({
  default: ({ to }) => <span>{to}</span>
}));

// Mock BlurText, Aurora, AnimatedList to simple divs
vi.mock('./components/BlurText', () => ({
  default: ({ text }) => <div>{text}</div>
}));
vi.mock('./components/Aurora', () => ({
  default: () => <div data-testid="aurora" />
}));
vi.mock('./components/AnimatedList', () => ({
  default: ({ children, as: Component = 'div' }) => <Component>{children}</Component>
}));

describe('Smoke Tests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('LoginPage renders and submits', async () => {
    const mockLogin = vi.fn().mockResolvedValue();
    vi.spyOn(apiService, 'loginUser').mockResolvedValue({
      data: { user: { name: 'test' }, access_token: '123' }
    });
    
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ login: mockLogin }}>
          <LoginPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Login to your account')).toBeInTheDocument();

    const emailInput = screen.getByRole('textbox'); // type="email" is a textbox
    const passInput = document.querySelector('input[type="password"]');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });

    const submitBtn = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ name: 'test' }, '123');
    });
  });

  test('PredictPage wizard advances through its 3 steps', async () => {
    render(
      <MemoryRouter>
        <PredictPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Step 1: Soil Parameters/i)).toBeInTheDocument();

    // Step 1 -> 2
    const nextBtn1 = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn1);
    
    expect(await screen.findByText(/Step 2: Location & Weather/i)).toBeInTheDocument();

    // Step 2 -> 3
    const nextBtn2 = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn2);

    expect(await screen.findByText(/Step 3: Crop & Agronomy/i)).toBeInTheDocument();
  });

  test('DashboardPage renders metric cards without crashing given mock API data', async () => {
    // Mock API responses
    vi.spyOn(apiService, 'getSummaryStats').mockResolvedValue({
      data: { total_predictions: 10, top_crop: 'wheat', avg_yield: 2500.5 }
    });
    vi.spyOn(apiService, 'getPredictionHistory').mockResolvedValue({
      data: { data: [{ id: 1, crop_type: 'wheat', predicted_yield: 2500, created_at: '2026-07-02T00:00:00' }] }
    });

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: { name: 'Test User' } }}>
          <DashboardPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Initial loading
    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();

    // Wait for data
    await waitFor(() => {
      expect(screen.queryByText(/loading dashboard/i)).not.toBeInTheDocument();
    });

    // Check metric cards
    expect(screen.getByText('Total Predictions')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    
    expect(screen.getByText('Top Crop')).toBeInTheDocument();
    expect(screen.getAllByText('wheat').length).toBeGreaterThan(0);
    
    expect(screen.getByText('Avg Yield (kg/acre)')).toBeInTheDocument();
    expect(screen.getByText('2501')).toBeInTheDocument(); // Math.round(2500.5)

    // Chart mock should render
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
  });
});
