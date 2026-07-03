import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await apiService.get('/alerts/');
        setAlerts(response.data.data);
      } catch (error) {
        toast.error('Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'high': return { bg: 'var(--color-danger)', text: 'var(--color-surface)' };
      case 'medium': return { bg: 'var(--color-accent)', text: 'var(--color-surface)' };
      case 'low': return { bg: 'var(--color-primary)', text: 'var(--color-surface)' };
      default: return { bg: 'var(--color-text)', text: 'var(--color-surface)' };
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '8px' }}>Risk Alerts System</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>Real-time alerts for pests, weather conditions, frost, and drought risks in your region.</p>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          Loading...
        </div>
      ) : alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--color-bg)' }}>
          <p style={{ fontSize: '18px', margin: 0 }}>No active alerts for your region.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {alerts.map(alert => {
            const style = getSeverityStyle(alert.severity);
            return (
              <div key={alert.id || Math.random()} style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderLeft: `4px solid ${style.bg}`,
                borderRadius: 'var(--radius)',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h5 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Alert
                  </h5>
                  <span style={{
                    backgroundColor: style.bg,
                    color: style.text,
                    padding: '4px 12px',
                    borderRadius: '99px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {alert.severity} RISK
                  </span>
                </div>
                <p style={{ marginBottom: '8px', color: 'var(--color-text)' }}>{alert.message}</p>
                {alert.created_at && (
                  <small style={{ color: 'var(--color-text-muted)' }}>Issued: {new Date(alert.created_at).toLocaleString()}</small>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
