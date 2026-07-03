import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { kgHaToKgAcre } from '../utils/unitConversion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const [regionData, setRegionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState({});

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setColors({
      primary: style.getPropertyValue('--color-primary').trim(),
      secondary: style.getPropertyValue('--color-secondary').trim(),
      border: style.getPropertyValue('--color-border').trim(),
      text: style.getPropertyValue('--color-text').trim(),
      textMuted: style.getPropertyValue('--color-text-muted').trim()
    });
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiService.get('/analytics/region');
        setRegionData(response.data.data);
      } catch (error) {
        toast.error('Failed to load regional analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const chartData = {
    labels: regionData.map(d => d.crop_type.charAt(0).toUpperCase() + d.crop_type.slice(1)),
    datasets: [
      {
        label: 'Average Predicted Yield (kg/acre)',
        data: regionData.map(d => kgHaToKgAcre(d.avg_yield)),
        backgroundColor: colors.secondary,
        borderColor: colors.primary,
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    animation: {
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 800,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: { 
        position: 'top',
        labels: { color: colors.text }
      },
      title: { 
        display: true, 
        text: 'Average Yield by Crop in Your State/District',
        color: colors.text
      },
      tooltip: {
        bodyFont: { family: '"IBM Plex Mono", monospace' }
      }
    },
    scales: {
      x: {
        grid: { color: colors.border },
        ticks: { color: colors.textMuted }
      },
      y: { 
        beginAtZero: true,
        grid: { color: colors.border },
        ticks: { color: colors.textMuted, font: { family: '"IBM Plex Mono", monospace' } }
      }
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '8px' }}>Multi-Region Analytics</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>Compare predicted crop yields across different crops in your region.</p>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          Loading...
        </div>
      ) : regionData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--color-bg)' }}>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>Not enough prediction data in your region to generate analytics.</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Make some predictions to see analytics here.</p>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '40px' }}>
            <Bar data={chartData} options={options} />
          </div>
          
          <h4 style={{ marginBottom: '16px' }}>Detailed Data</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--color-border)' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Crop</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Average Yield (kg/acre)</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>State</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>District</th>
                </tr>
              </thead>
              <tbody>
                {regionData.map((d, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>{d.crop_type}</td>
                    <td className="data" style={{ padding: '12px' }}>{kgHaToKgAcre(d.avg_yield).toFixed(2)}</td>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>{d.state || 'N/A'}</td>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>{d.district || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
