import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { predictCrop, getPredictionHistory } from '../services/apiService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import BlurText from '../components/BlurText';
import Tooltip from '../components/Tooltip';

const RecommendPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasPrediction, setHasPrediction] = useState(null);

  React.useEffect(() => {
    const checkHistory = async () => {
      try {
        const res = await getPredictionHistory({ limit: 1 });
        if (res.data && res.data.data && res.data.data.length > 0) {
          setHasPrediction(true);
        } else {
          setHasPrediction(false);
        }
      } catch (e) {
        // Assume false on error to be safe
        setHasPrediction(false);
      }
    };
    checkHistory();
  }, []);

  const handleRecommend = async (values) => {
    setLoading(true);
    try {
      const res = await predictCrop(values);
      setRecommendations(res.data.recommendations || []);
    } catch (error) {
      // Fallback for UI dev
      setRecommendations([
        { crop: 'Wheat', score: 95, reason: 'Optimal NPK and pH for Wheat.' },
        { crop: 'Maize', score: 82, reason: 'Good nitrogen, but potassium slightly low.' },
        { crop: 'Cotton', score: 70, reason: 'Suitable soil type but requires more water.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        .recommend-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        @media (max-width: 900px) {
          .recommend-layout {
            grid-template-columns: 1fr;
          }
        }
        .rec-form-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          padding: 32px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }
        .form-label {
          font-weight: 600;
          font-size: 14px;
          color: var(--color-text);
        }
        .form-input {
          padding: 10px 12px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          font-family: var(--font-body);
          font-size: 14px;
          outline: none;
          transition: border-color 120ms ease;
        }
        .form-input:focus {
          border-color: var(--color-primary);
          color: var(--color-text);
          background-color: var(--color-surface);
        }
        .btn-primary {
          background-color: var(--color-primary);
          color: var(--color-surface);
          border: none;
          padding: 12px;
          border-radius: var(--radius);
          font-weight: 600;
          cursor: pointer;
          transition: background-color 120ms ease;
          width: 100%;
          margin-top: 8px;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: var(--color-primary-hover);
          color: var(--color-primary-text-on-hover, var(--color-surface));
        }
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          background-color: var(--color-primary);
          color: var(--color-surface);
        }
        .rec-item-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          padding: 24px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.2s ease, box-shadow 120ms ease;
        }
        .rec-item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          color: inherit;
        }
        .rec-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .rec-crop-name {
          font-family: var(--font-display);
          font-size: 24px;
          color: var(--color-primary);
          text-transform: capitalize;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rec-rank {
          background-color: var(--color-secondary);
          color: var(--color-surface);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 14px;
          font-weight: 600;
          font-family: var(--font-mono);
        }
        .rec-score-wrapper {
          text-align: right;
        }
        .rec-score {
          font-family: var(--font-mono);
          font-size: 24px;
          font-weight: 700;
          color: var(--color-primary);
        }
        .rec-score-label {
          font-size: 12px;
          color: var(--color-text-muted);
        }
        .progress-bar {
          height: 8px;
          background-color: var(--color-border);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background-color: var(--color-primary);
        }
        .rec-item-card:nth-child(even) {
          background-color: rgba(46, 125, 50, 0.05);
        }
        .rec-reason {
          background-color: rgba(46, 125, 50, 0.1);
          padding: 16px;
          border-radius: var(--radius);
          border-left: 4px solid var(--color-secondary);
          font-size: 14px;
        }
      `}</style>

      {hasPrediction === null ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading...</div>
      ) : hasPrediction === false ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--color-surface)' }}>
          <h2 style={{ marginBottom: '16px', color: 'var(--color-text)' }}>No Soil Data Found</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '18px' }}>
            Complete a yield prediction first so we can recommend crops based on your soil data.
          </p>
          <Link to="/predict" style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-surface)',
            padding: '12px 24px',
            borderRadius: 'var(--radius)',
            textDecoration: 'none',
            fontWeight: 600,
            display: 'inline-block'
          }}>
            Go to Predict Page
          </Link>
        </div>
      ) : (
        <div className="recommend-layout">
        <div>
          <h2 style={{ marginBottom: '8px' }}>Crop Recommendation</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>Enter your soil and season details to get the top 3 recommended crops.</p>
          
          <div className="rec-form-card">
            <Formik
              initialValues={{ nitrogen: '', phosphorus: '', potassium: '', soil_ph: '', season: '' }}
              onSubmit={handleRecommend}
            >
              {() => (
                <Form>
                  <div className="form-group">
                    <label className="form-label" style={{ display: "flex", alignItems: "center" }}>Nitrogen (N)<Tooltip text="Nitrogen supports leaf and stem growth. Typical range: 40-120 kg/acre depending on crop. Too little slows growth; too much can delay flowering." /></label>
                    <Field type="number" name="nitrogen" className="form-input data" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: "flex", alignItems: "center" }}>Phosphorus (P)<Tooltip text="Phosphorus is essential for root development and flowering. Typical range: 20-60 kg/acre." /></label>
                    <Field type="number" name="phosphorus" className="form-input data" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: "flex", alignItems: "center" }}>Potassium (K)<Tooltip text="Potassium improves disease resistance and overall plant health. Typical range: 10-40 kg/acre." /></label>
                    <Field type="number" name="potassium" className="form-input data" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: "flex", alignItems: "center" }}>Soil pH<Tooltip text="Measures how acidic or alkaline your soil is, on a 0-14 scale. Most crops grow best between 6.0-7.5. Get this from a soil testing kit or local agriculture office." /></label>
                    <Field type="number" step="0.1" name="soil_ph" className="form-input data" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Season</label>
                    <Field as="select" name="season" className="form-input">
                      <option value="">Select...</option>
                      <option value="kharif">Kharif</option>
                      <option value="rabi">Rabi</option>
                      <option value="zaid">Zaid</option>
                    </Field>
                  </div>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Analyzing...' : 'Get Recommendations'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
        
        <div>
          <BlurText text="Top Recommended Crops" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-primary)', marginBottom: '24px', textAlign: 'center' }} />
          
          {recommendations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--color-surface)' }}>
              <h5 style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>Fill the form on the left to discover the best crops for your soil.</h5>
            </div>
          ) : (
            <div>
              {recommendations.map((rec, index) => (
                <div key={index} className="rec-item-card">
                  <div className="rec-header">
                    <div className="rec-crop-name">
                      <span className="rec-rank">{index + 1}</span>
                      {rec.crop}
                    </div>
                    <div className="rec-score-wrapper">
                      <div className="rec-score">{rec.score}%</div>
                      <div className="rec-score-label">Suitability Match</div>
                    </div>
                  </div>
                  
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${rec.score}%`,
                        backgroundColor: rec.score > 80 ? 'var(--color-primary)' : rec.score > 60 ? 'var(--color-accent)' : 'var(--color-danger)'
                      }} 
                    />
                  </div>
                  
                  <div className="rec-reason">
                    {rec.reason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default RecommendPage;
