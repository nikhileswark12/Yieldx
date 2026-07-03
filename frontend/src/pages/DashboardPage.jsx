import React, { useState, useEffect, useContext } from 'react';
import { getSummaryStats, getPredictionHistory } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import BlurText from '../components/BlurText';
import CountUp from '../components/CountUp';
import AnimatedList from '../components/AnimatedList';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [colors, setColors] = useState({});

  useEffect(() => {
    // Read CSS variables at render time
    const style = getComputedStyle(document.documentElement);
    setColors({
      primary: style.getPropertyValue('--color-primary').trim(),
      secondary: style.getPropertyValue('--color-secondary').trim(),
      border: style.getPropertyValue('--color-border').trim(),
      text: style.getPropertyValue('--color-text').trim(),
      textMuted: style.getPropertyValue('--color-text-muted').trim(),
      // Add a few hardcoded fallback colors for distinct crops in case theme doesn't have enough
      palette: [
        style.getPropertyValue('--color-primary').trim(),
        style.getPropertyValue('--color-secondary').trim(),
        '#388E3C', // A bit darker green
        '#81C784', // Light green
        '#4CAF50'  // Standard green
      ]
    });
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        try {
          const statsRes = await getSummaryStats();
          setStats(statsRes.data);
        } catch (e) {
          toast.error("Failed to load dashboard statistics.");
          setStats(null);
        }
        
        try {
          const histRes = await getPredictionHistory({ limit: 5 });
          setHistory(histRes.data.data || []);
        } catch (e) {
          toast.error("Failed to load prediction history.");
          setHistory([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const distinctCrops = [...new Set(history.map(h => h.crop_type))];
  
  // Create datasets based on the filter
  const datasets = [];
  if (history.length > 0) {
    const cropsToRender = selectedCrop === 'all' ? distinctCrops : [selectedCrop];
    
    cropsToRender.forEach((crop, index) => {
      const cropHistory = history.filter(h => h.crop_type === crop).reverse();
      if (cropHistory.length > 0) {
        datasets.push({
          label: crop.charAt(0).toUpperCase() + crop.slice(1),
          data: history.map(h => {
            // Find if this date has a prediction for this crop
            const entry = cropHistory.find(ch => ch.created_at === h.created_at);
            return entry ? entry.predicted_yield : null;
          }).reverse(),
          borderColor: colors.palette ? colors.palette[index % colors.palette.length] : colors.primary,
          backgroundColor: colors.palette ? colors.palette[index % colors.palette.length] : colors.secondary,
          tension: 0.3,
          spanGaps: true // Important for disconnected lines
        });
      }
    });
  }

  const chartData = {
    labels: history.map(h => new Date(h.created_at).toLocaleDateString()).reverse(),
    datasets: datasets
  };

  const chartOptions = {
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
        text: 'Recent Yield Trends',
        color: colors.text
      }
    },
    scales: {
      x: {
        grid: { color: colors.border },
        ticks: { color: colors.textMuted }
      },
      y: {
        grid: { color: colors.border },
        ticks: { color: colors.textMuted }
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading Dashboard...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <BlurText text="Field overview" className="dashboard-heading" />
        <Link to="/predict" style={{ 
          backgroundColor: 'var(--color-accent)', 
          color: 'var(--color-accent-text)',
          padding: '8px 16px',
          borderRadius: 'var(--radius)',
          fontWeight: 600
        }}>+ New Prediction</Link>
      </div>

      <style>{`
        .dashboard-heading {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 600;
        }
        .metric-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        .metric-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .metric-label {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--color-text-muted);
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .metric-value {
          font-family: var(--font-mono);
          font-size: 26px;
          font-weight: 600;
          color: var(--color-text);
        }
        .dashboard-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--color-border);
        }
        .list-item:last-child {
          border-bottom: none;
        }
        .badge {
          background-color: var(--color-secondary);
          color: var(--color-surface);
          padding: 4px 12px;
          border-radius: 99px;
          font-family: var(--font-mono);
          font-size: 12px;
        }
      `}</style>

      {/* Summary Stats */}
      <div className="metric-cards">
        <div className="metric-card">
          <div className="metric-label">Total Predictions</div>
          <div className="metric-value data">
            <CountUp to={stats?.total_predictions || 0} />
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Top Crop</div>
          <div className="metric-value data" style={{ textTransform: 'capitalize' }}>
            {stats?.top_crop || 'N/A'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Yield (kg/acre)</div>
          <div className="metric-value data">
            <CountUp to={stats?.avg_yield ? Math.round(stats.avg_yield) : 0} />
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="page-container">
          {history.length > 0 && distinctCrops.length > 0 && (
            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Filter by Crop:</span>
              <select 
                value={selectedCrop} 
                onChange={e => setSelectedCrop(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)'
                }}
              >
                <option value="all">All crops</option>
                {distinctCrops.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          )}
          <Line options={chartOptions} data={chartData} />
        </div>
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column' }}>
          <h5 style={{ marginBottom: '16px' }}>Recent Predictions</h5>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>No predictions yet</div>
          ) : (
            <AnimatedList>
              {history.slice(0, 5).map(item => (
                <div key={item.id} className="list-item">
                  <div>
                    <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{item.crop_type}</div>
                    <small className="data" style={{ color: 'var(--color-text-muted)' }}>{new Date(item.created_at).toLocaleDateString()}</small>
                  </div>
                  <span className="badge data">{Math.round(item.predicted_yield * 0.404686)} kg/acre</span>
                </div>
              ))}
            </AnimatedList>
          )}
          {history.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '16px' }}>
              <Link to="/history" style={{ fontWeight: 600 }}>View All</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
