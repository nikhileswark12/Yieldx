import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { predictYield } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SoilStrip from '../components/SoilStrip';
import Tooltip from '../components/Tooltip';
import { acresToHectares } from '../utils/unitConversion';

const PredictSchema = Yup.object().shape({
  nitrogen: Yup.number().min(0).max(140).required('Required'),
  phosphorus: Yup.number().min(5).max(145).required('Required'),
  potassium: Yup.number().min(5).max(205).required('Required'),
  soil_ph: Yup.number().min(3.5).max(9.0).required('Required'),
  soil_type: Yup.string().required('Required'),
  location: Yup.string().required('Required'),
  crop_type: Yup.string().required('Required'),
  season: Yup.string().required('Required'),
  irrigation_type: Yup.string().required('Required'),
  fertilizer_used: Yup.number().min(0).required('Required'),
  area_acres: Yup.number().min(0.1).required('Required'),
});

const PredictPage = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = { ...values, area_hectares: acresToHectares(values.area_acres) };
      delete payload.area_acres;
      const res = await predictYield(payload);
      toast.success('Prediction successful!');
      navigate(`/results/${res.data.prediction_id || 'latest'}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Prediction failed');
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercentage = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Predict Crop Yield</h2>
        <SoilStrip type="progress" progress={progressPercentage} />
      </div>

      <style>{`
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
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
        .error-message {
          color: var(--color-danger);
          font-size: 12px;
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
        .btn-secondary {
          background-color: transparent;
          color: var(--color-text);
          border: 1px solid var(--color-border);
          padding: 10px 24px;
          border-radius: var(--radius);
          font-weight: 600;
          cursor: pointer;
          transition: all 120ms ease;
        }
        .btn-secondary:hover:not(:disabled) {
          background-color: var(--color-bg);
          color: var(--color-primary);
        }
        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: transparent;
          color: var(--color-text);
        }
        .step-title {
          color: var(--color-primary);
          margin-bottom: 20px;
        }
        .step-viewport {
          overflow: hidden;
          width: 100%;
          position: relative;
        }
        .step-track {
          display: flex;
          width: 300%;
          transition: transform 250ms ease-out;
        }
        .step-panel {
          width: 33.333%;
          padding: 20px 0;
          flex-shrink: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .step-track {
            transition: opacity 200ms ease-out;
            opacity: 1; /* Note: since transform is instantaneous without transition, crossfade is not strictly possible if transform jumps immediately, but we can rely on instant snap */
          }
        }
      `}</style>

      <Formik
        initialValues={{
          nitrogen: '', phosphorus: '', potassium: '', soil_ph: '', soil_type: '',
          location: '',
          crop_type: '', season: '', irrigation_type: '', fertilizer_used: '', area_acres: ''
        }}
        validationSchema={PredictSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            {isSubmitting && <SoilStrip type="progress" loading={true} />}
            <div className="step-viewport" style={{ opacity: isSubmitting ? 0.5 : 1, pointerEvents: isSubmitting ? 'none' : 'auto' }}>
              <div className="step-track" style={{ transform: `translateX(-${(step - 1) * (100 / 3)}%)` }}>
                
                {/* STEP 1 */}
                <div className="step-panel" aria-hidden={step !== 1} tabIndex={step === 1 ? 0 : -1}>
                  <h4 className="step-title">Step 1: Soil Parameters</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label" style={{ display: "flex", alignItems: "center" }}>Nitrogen (N) kg/acre<Tooltip text="Nitrogen supports leaf and stem growth. Typical range: 40-120 kg/acre depending on crop. Too little slows growth; too much can delay flowering." /></label>
                      <Field type="number" name="nitrogen" className="form-input data" tabIndex={step === 1 ? 0 : -1} />
                      <ErrorMessage name="nitrogen" component="div" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ display: "flex", alignItems: "center" }}>Phosphorus (P) kg/acre<Tooltip text="Phosphorus is essential for root development and flowering. Typical range: 20-60 kg/acre." /></label>
                      <Field type="number" name="phosphorus" className="form-input data" tabIndex={step === 1 ? 0 : -1} />
                      <ErrorMessage name="phosphorus" component="div" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ display: "flex", alignItems: "center" }}>Potassium (K) kg/acre<Tooltip text="Potassium improves disease resistance and overall plant health. Typical range: 10-40 kg/acre." /></label>
                      <Field type="number" name="potassium" className="form-input data" tabIndex={step === 1 ? 0 : -1} />
                      <ErrorMessage name="potassium" component="div" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ display: "flex", alignItems: "center" }}>Soil pH<Tooltip text="Measures how acidic or alkaline your soil is, on a 0-14 scale. Most crops grow best between 6.0-7.5. Get this from a soil testing kit or local agriculture office." /></label>
                      <Field type="number" step="0.1" name="soil_ph" className="form-input data" tabIndex={step === 1 ? 0 : -1} />
                      <ErrorMessage name="soil_ph" component="div" className="error-message" />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Soil Type</label>
                      <Field as="select" name="soil_type" className="form-input" tabIndex={step === 1 ? 0 : -1}>
                        <option value="">Select...</option>
                        <option value="sandy">Sandy</option>
                        <option value="loamy">Loamy</option>
                        <option value="clay">Clay</option>
                        <option value="silt">Silt</option>
                        <option value="alluvial">Alluvial</option>
                        <option value="black">Black</option>
                      </Field>
                      <ErrorMessage name="soil_type" component="div" className="error-message" />
                    </div>
                  </div>
                </div>

                {/* STEP 2 */}
                <div className="step-panel" aria-hidden={step !== 2} tabIndex={step === 2 ? 0 : -1}>
                  <h4 className="step-title">Step 2: Location & Weather</h4>
                  <div className="form-group">
                    <label className="form-label">Farm Location (City, State)</label>
                    <Field type="text" name="location" className="form-input" placeholder="e.g. Pune, Maharashtra" tabIndex={step === 2 ? 0 : -1} />
                    <ErrorMessage name="location" component="div" className="error-message" />
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Weather data (temperature, humidity, rainfall) will be fetched automatically.
                    </div>
                  </div>
                </div>

                {/* STEP 3 */}
                <div className="step-panel" aria-hidden={step !== 3} tabIndex={step === 3 ? 0 : -1}>
                  <h4 className="step-title">Step 3: Crop & Agronomy</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Crop Type</label>
                      <Field as="select" name="crop_type" className="form-input" tabIndex={step === 3 ? 0 : -1}>
                        <option value="">Select...</option>
                        <option value="wheat">Wheat</option>
                        <option value="rice">Rice</option>
                        <option value="sugarcane">Sugarcane</option>
                        <option value="cotton">Cotton</option>
                        <option value="maize">Maize</option>
                      </Field>
                      <ErrorMessage name="crop_type" component="div" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Season</label>
                      <Field as="select" name="season" className="form-input" tabIndex={step === 3 ? 0 : -1}>
                        <option value="">Select...</option>
                        <option value="kharif">Kharif</option>
                        <option value="rabi">Rabi</option>
                        <option value="zaid">Zaid</option>
                      </Field>
                      <ErrorMessage name="season" component="div" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Irrigation Type</label>
                      <Field as="select" name="irrigation_type" className="form-input" tabIndex={step === 3 ? 0 : -1}>
                        <option value="">Select...</option>
                        <option value="drip">Drip</option>
                        <option value="flood">Flood</option>
                        <option value="sprinkler">Sprinkler</option>
                        <option value="rainfed">Rainfed</option>
                      </Field>
                      <ErrorMessage name="irrigation_type" component="div" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ display: "flex", alignItems: "center" }}>Fertilizer Used (kg)<Tooltip text="Total amount of fertilizer applied to the area. Affects nutrient availability." /></label>
                      <Field type="number" name="fertilizer_used" className="form-input data" tabIndex={step === 3 ? 0 : -1} />
                      <ErrorMessage name="fertilizer_used" component="div" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ display: "flex", alignItems: "center" }}>Area (Acres)<Tooltip text="The total size of the field being planted, measured in acres." /></label>
                      <Field type="number" step="0.1" name="area_acres" className="form-input data" tabIndex={step === 3 ? 0 : -1} />
                      <ErrorMessage name="area_acres" component="div" className="error-message" />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
              <button type="button" className="btn-secondary" onClick={handlePrev} disabled={step === 1 || isSubmitting}>Back</button>
              {step < 3 ? (
                <button type="button" className="btn-primary" onClick={handleNext} disabled={isSubmitting}>Next</button>
              ) : (
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Predicting...' : 'Predict Yield'}
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PredictPage;
