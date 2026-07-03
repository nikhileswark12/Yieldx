import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnimatedList from '../components/AnimatedList';
import { kgHaToKgAcre } from '../utils/unitConversion';
import { getPredictionHistory } from '../services/apiService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import SoilStrip from '../components/SoilStrip';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getPredictionHistory();
        setHistory(res.data.data || []);
      } catch (error) {
        // Fallback dummy data
        setHistory([
          { id: 101, crop_type: 'Wheat', predicted_yield: 3240.5, risk_level: 'low', created_at: '2026-05-20T10:00:00' },
          { id: 102, crop_type: 'Rice', predicted_yield: 2800.0, risk_level: 'medium', created_at: '2026-05-21T11:00:00' },
          { id: 103, crop_type: 'Cotton', predicted_yield: 1200.0, risk_level: 'high', created_at: '2026-05-22T08:00:00' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const riskBadge = (risk) => {
    let bg = 'var(--color-text)';
    let color = 'var(--color-surface)';
    if (risk === 'low') bg = 'var(--color-primary)';
    if (risk === 'medium') bg = 'var(--color-accent)';
    if (risk === 'high') bg = 'var(--color-danger)';
    
    return (
      <span style={{ 
        backgroundColor: bg, 
        color: color,
        padding: '4px 12px',
        borderRadius: '99px',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'capitalize'
      }}>
        {risk}
      </span>
    );
  };

  const exportPDF = () => {
    if (history.length === 0) {
      toast.info('No history to export.');
      return;
    }
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(31, 74, 61); // Primary Forest color approx
    doc.text('YieldX Prediction History Report', 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Prepare table data
    const tableColumn = ["ID", "Date", "Crop", "Predicted Yield (kg/acre)", "Risk Level"];
    const tableRows = [];
    
    history.forEach(item => {
      const rowData = [
        `#${item.id}`,
        new Date(item.created_at).toLocaleDateString(),
        item.crop_type.charAt(0).toUpperCase() + item.crop_type.slice(1),
        item.predicted_yield.toFixed(1),
        item.risk_level.toUpperCase()
      ];
      tableRows.push(rowData);
    });
    
    // Add auto-table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [31, 74, 61] },
      alternateRowStyles: { fillColor: [243, 245, 241] }
    });
    
    // Save PDF
    doc.save('yieldx_prediction_history.pdf');
    toast.success('PDF Exported Successfully!');
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Prediction History</h2>
        <button 
          onClick={exportPDF}
          disabled={loading || history.length === 0}
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-primary)',
            padding: '8px 16px',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontWeight: 600,
            opacity: loading || history.length === 0 ? 0.5 : 1
          }}
        >
          Export to PDF
        </button>
      </div>
      
      <div style={{ marginBottom: '32px' }}>
        <SoilStrip type="divider" />
      </div>

      <style>{`
        .history-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid var(--color-border);
        }
        .history-table th {
          background-color: var(--color-bg);
          text-align: left;
          padding: 12px 16px;
          color: var(--color-text-muted);
          font-weight: 600;
          font-size: 14px;
          border-bottom: 2px solid var(--color-border);
        }
        .history-table td {
          padding: 16px;
          border-bottom: 1px solid var(--color-border);
          vertical-align: middle;
        }
        .history-table tr:hover {
          background-color: rgba(0,0,0,0.02);
          color: inherit;
        }
        .btn-view {
          display: inline-block;
          padding: 6px 12px;
          border: 1px solid var(--color-primary);
          color: var(--color-primary);
          border-radius: var(--radius);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: background-color 120ms;
        }
        .btn-view:hover {
          background-color: rgba(46, 125, 50, 0.05);
          text-decoration: none;
          color: var(--color-primary);
        }
      `}</style>
      
      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Crop</th>
                  <th>Predicted Yield</th>
                  <th>Risk</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <AnimatedList as="tbody">
                {history.map(item => (
                  <tr key={item.id}>
                    <td className="data">#{item.id}</td>
                    <td className="data">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--color-primary)' }}>{item.crop_type}</td>
                    <td className="data">{kgHaToKgAcre(item.predicted_yield).toFixed(1)} kg/acre</td>
                    <td>{riskBadge(item.risk_level)}</td>
                    <td>
                      <Link to={`/results/${item.id}`} className="btn-view">View Details</Link>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No prediction history found.</td></tr>
                )}
              </AnimatedList>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
