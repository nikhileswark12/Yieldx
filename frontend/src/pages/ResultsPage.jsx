import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { kgHaToKgAcre } from '../utils/unitConversion';
import { getPredictionDetails, getWeather } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import SoilStrip from '../components/SoilStrip';
import CountUp from '../components/CountUp';
import AnimatedList from '../components/AnimatedList';

ChartJS.register(ArcElement, Tooltip, Legend);

const ResultsPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [result, setResult] = useState(null);
  const [liveWeather, setLiveWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRiskBadge, setShowRiskBadge] = useState(false);
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
    const fetchResult = async () => {
      try {
        const res = await getPredictionDetails(id);
        setResult(res.data);
        
        // Fetch live weather using API based on user's location
        const location = user?.district || user?.state;
        if (location) {
          try {
            const weatherRes = await getWeather(location);
            setLiveWeather(weatherRes.data);
          } catch (weatherError) {
            console.error("Could not fetch live weather, falling back to prediction history:", weatherError);
          }
        }
      } catch (error) {
        // Fallback dummy data for development
        setResult({
          predicted_yield: 3240.5,
          total_production: 16202.5,
          confidence: 0.92,
          risk_level: 'low',
          crop_type: 'wheat',
          recommendations: [
            "Maintain current nitrogen levels.",
            "Consider drip irrigation to save water."
          ],
          weather_summary: {
            temperature: 28,
            humidity: 60,
            rainfall: 15,
            description: "Clear sky"
          }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
    
    // Check reduced motion to skip sequencing
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShowRiskBadge(true);
    }
  }, [id, user]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading Results...</div>;
  if (!result) return <div style={{ textAlign: 'center', marginTop: '40px' }}>No result found.</div>;

  const confidenceData = {
    labels: ['Confidence', 'Uncertainty'],
    datasets: [
      {
        data: [result.confidence * 100, (1 - result.confidence) * 100],
        backgroundColor: [colors.primary || '#1F4A3D', colors.border || '#E0E4DE'],
        borderWidth: 0,
      },
    ],
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'low': return { bg: 'var(--color-primary)', text: 'var(--color-surface)' };
      case 'medium': return { bg: 'var(--color-accent)', text: 'var(--color-accent-text)' };
      case 'high': return { bg: 'var(--color-danger)', text: 'var(--color-surface)' };
      default: return { bg: 'var(--color-text)', text: 'var(--color-surface)' };
    }
  };

  const riskStyle = getRiskColor(result.risk_level);
  const displayWeather = liveWeather || result.weather_summary || {};

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Prediction Results</h2>
        <SoilStrip type="divider" />
      </div>

      <style>{`
        .results-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }
        @media (max-width: 900px) {
          .results-grid {
            grid-template-columns: 1fr;
          }
        }
        .result-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          padding: 32px;
          display: flex;
          flex-direction: column;
        }
        .result-title {
          font-size: 14px;
          text-transform: uppercase;
          color: var(--color-text-muted);
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .yield-value {
          font-family: var(--font-mono);
          font-size: 64px;
          color: var(--color-primary);
          font-weight: 700;
          line-height: 1.1;
        }
        .yield-unit {
          color: var(--color-text-muted);
          font-size: 18px;
          margin-bottom: 24px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--color-border);
          padding-top: 24px;
          margin-top: 24px;
        }
        .info-col p {
          color: var(--color-text-muted);
          font-size: 14px;
          margin-bottom: 4px;
        }
        .info-col h4 {
          font-family: var(--font-mono);
          font-size: 20px;
        }
        .risk-badge {
          padding: 6px 16px;
          border-radius: 99px;
          font-weight: 600;
          font-size: 14px;
          text-transform: capitalize;
          display: inline-block;
          opacity: 0;
          transform: scale(0.9);
          transition: opacity 200ms ease-out, transform 200ms ease-out;
        }
        .risk-badge.visible {
          opacity: 1;
          transform: scale(1);
        }
        @media (prefers-reduced-motion: reduce) {
          .risk-badge {
            transition: none;
            opacity: 1;
            transform: none;
          }
        }
        .recs-weather-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        @media (max-width: 900px) {
          .recs-weather-grid {
            grid-template-columns: 1fr;
          }
        }
        .rec-item {
          padding: 16px;
          border-bottom: 1px solid var(--color-border);
        }
        .rec-item:last-child {
          border-bottom: none;
        }
        .weather-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 16px;
        }
        .weather-box {
          background-color: var(--color-bg);
          border-radius: var(--radius);
          padding: 16px;
          text-align: center;
        }
        .weather-box h3 {
          font-family: var(--font-mono);
          color: var(--color-secondary);
          margin-bottom: 4px;
        }
        .weather-box small {
          color: var(--color-text-muted);
        }
        .btn-primary {
          background-color: var(--color-primary);
          color: var(--color-surface);
          border: none;
          padding: 10px 24px;
          border-radius: var(--radius);
          font-weight: 600;
          cursor: pointer;
          transition: background-color 120ms ease;
          text-decoration: none;
          display: inline-block;
        }
        .btn-primary:hover {
          background-color: var(--color-primary-hover);
          color: var(--color-primary-text-on-hover, var(--color-surface));
          text-decoration: none;
        }
        .btn-outline {
          background-color: transparent;
          color: var(--color-primary);
          border: 1px solid var(--color-primary);
          padding: 10px 24px;
          border-radius: var(--radius);
          font-weight: 600;
          cursor: pointer;
          transition: all 120ms ease;
          text-decoration: none;
          display: inline-block;
        }
        .btn-outline:hover {
          background-color: rgba(46, 125, 50, 0.05);
          text-decoration: none;
          color: var(--color-primary);
        }
      `}</style>

      <div className="results-grid">
        <div className="result-card" style={{ textAlign: 'center' }}>
          <div className="result-title">Predicted Yield for {result.crop_type}</div>
          <div className="yield-value data">
            <CountUp to={Math.round(kgHaToKgAcre(result.predicted_yield))} onComplete={() => setShowRiskBadge(true)} />
          </div>
          <div className="yield-unit">kg / acre</div>
          
          <div className="info-row" style={{ textAlign: 'left' }}>
            <div className="info-col">
              <p>Total Production (Estimated)</p>
              <h4 className="data">{result.total_production.toFixed(1)} kg</h4>
            </div>
            <div className="info-col" style={{ textAlign: 'right' }}>
              <p>Risk Level</p>
              <div 
                className={`risk-badge ${showRiskBadge ? 'visible' : ''}`} 
                style={{ backgroundColor: riskStyle.bg, color: riskStyle.text }}
              >
                {result.risk_level} Risk
              </div>
            </div>
          </div>
        </div>

        <div className="result-card" style={{ textAlign: 'center' }}>
          <h5 style={{ marginBottom: '24px' }}>Model Confidence</h5>
          <div style={{ width: '200px', margin: '0 auto' }}>
            <Doughnut data={confidenceData} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
          </div>
          <h2 className="data" style={{ marginTop: '24px' }}>
            {(result.confidence * 100).toFixed(0)}%
          </h2>
        </div>
      </div>
      
      <div className="recs-weather-grid">
        <div className="result-card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'rgba(46, 125, 50, 0.03)' }}>
            <h5 style={{ color: 'var(--color-primary)', margin: 0 }}>Actionable Recommendations</h5>
          </div>
          <div>
            {showRiskBadge && (
              <AnimatedList as="div">
                {result.recommendations?.map((rec, i) => (
                  <div key={i} className="rec-item">💡 {rec}</div>
                ))}
              </AnimatedList>
            )}
          </div>
        </div>

        <div className="result-card">
          <h5 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
            Weather Context
            {liveWeather && <span style={{ fontSize: '12px', backgroundColor: 'var(--color-secondary)', color: 'var(--color-surface)', padding: '2px 8px', borderRadius: '4px' }}>Live</span>}
          </h5>
          <div className="weather-grid">
            <div className="weather-box">
              <h3 className="data">{displayWeather.temperature !== undefined ? displayWeather.temperature : '--'}°C</h3>
              <small>Temperature</small>
            </div>
            <div className="weather-box">
              <h3 className="data">{displayWeather.humidity !== undefined ? displayWeather.humidity : '--'}%</h3>
              <small>Humidity</small>
            </div>
            <div className="weather-box" style={{ gridColumn: '1 / -1', textTransform: 'capitalize' }}>
              <div style={{ fontWeight: 600 }}>{displayWeather.description || 'N/A'}</div>
              {!liveWeather && <small>(At time of prediction)</small>}
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <Link to="/dashboard" className="btn-outline">Back to Dashboard</Link>
        <Link to="/predict" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 'var(--radius)', backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-text)', border: 'none', textDecoration: 'none', fontWeight: 600 }}>New Prediction</Link>
      </div>
    </div>
  );
};

export default ResultsPage;
