import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Formik, Form, Field } from 'formik';
import { updateProfile, changePassword } from '../services/apiService';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('details'); // details, edit, password

  if (!user) return null;

  const handleProfileUpdate = async (values, { setSubmitting }) => {
    try {
      await updateProfile(values);
      toast.success('Profile updated successfully! Please re-login to see changes immediately.');
      setActiveTab('details');
    } catch (error) {
      toast.error('Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error("Passwords don't match!");
      setSubmitting(false);
      return;
    }
    try {
      await changePassword({ current_password: values.currentPassword, new_password: values.newPassword });
      toast.success('Password changed successfully!');
      resetForm();
      setActiveTab('details');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFieldValue('profile_pic', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 24px;
        }
        @media (max-width: 900px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }
        .profile-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          overflow: hidden;
        }
        .profile-header {
          background-color: var(--color-primary);
          padding: 40px 20px 20px;
          text-align: center;
          position: relative;
        }
        .btn-toggle {
          position: absolute;
          top: 16px;
          right: 16px;
          background-color: var(--color-surface);
          color: var(--color-text);
          border: none;
          padding: 6px 12px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .avatar {
          width: 80px;
          height: 80px;
          background-color: var(--color-surface);
          color: var(--color-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
          margin: 0 auto 16px;
          overflow: hidden;
          font-family: var(--font-display);
        }
        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-info {
          padding: 24px;
          text-align: center;
        }
        .profile-info h4 {
          margin-bottom: 4px;
          color: var(--color-text);
        }
        .profile-info p {
          color: var(--color-text-muted);
          font-size: 14px;
        }
        .content-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          padding: 32px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 600px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
        .info-box {
          background-color: var(--color-bg);
          padding: 16px;
          border-radius: var(--radius);
          border-left: 4px solid var(--color-secondary);
        }
        .info-label {
          font-size: 12px;
          color: var(--color-text-muted);
          font-weight: 600;
          margin-bottom: 4px;
        }
        .info-value {
          font-weight: 500;
          color: var(--color-text);
        }
        .form-group {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-label {
          font-size: 14px;
          font-weight: 600;
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
        .btn-secondary:hover {
          background-color: var(--color-bg);
          color: var(--color-primary);
        }
      `}</style>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-header">
            <button 
              className="btn-toggle"
              onClick={() => setActiveTab(activeTab === 'edit' ? 'details' : 'edit')}
            >
              {activeTab === 'edit' ? 'Cancel' : 'Edit'}
            </button>
            <div className="avatar">
              {user.profile_pic ? (
                <img src={user.profile_pic} alt="Profile" />
              ) : (
                user.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
          </div>
          <div className="profile-info">
            <h4>{user.name}</h4>
            <p>{user.email}</p>
          </div>
        </div>
        
        <div className="content-card">
          {activeTab === 'details' && (
            <div>
              <h3 style={{ marginBottom: '24px', color: 'var(--color-primary)' }}>Personal Information</h3>
              <div className="info-grid">
                <div className="info-box">
                  <div className="info-label">Full Name</div>
                  <div className="info-value">{user.name}</div>
                </div>
                <div className="info-box">
                  <div className="info-label">Email Address</div>
                  <div className="info-value">{user.email}</div>
                </div>
                <div className="info-box">
                  <div className="info-label">Phone Number</div>
                  <div className="info-value">{user.phone || 'Not provided'}</div>
                </div>
                <div className="info-box">
                  <div className="info-label">Address & Location</div>
                  <div className="info-value">
                    {user.address_line ? <div style={{ marginBottom: '4px' }}>{user.address_line}</div> : null}
                    {user.district || user.state ? `${user.district ? user.district + ', ' : ''}${user.state || ''}` : 'Not provided'}
                  </div>
                </div>
                <div className="info-box">
                  <div className="info-label">Farm Size (Acres)</div>
                  <div className="info-value data">{user.farm_size || 'Not provided'}</div>
                </div>
                <div className="info-box">
                  <div className="info-label">Farming Experience (Years)</div>
                  <div className="info-value data">{user.farming_experience || 'Not provided'}</div>
                </div>
                <div className="info-box" style={{ gridColumn: '1 / -1' }}>
                  <div className="info-label">Preferred Crops</div>
                  <div className="info-value">{user.preferred_crops || 'Not provided'}</div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'edit' && (
            <div>
              <h3 style={{ marginBottom: '24px', color: 'var(--color-primary)' }}>Edit Profile</h3>
              <Formik
                initialValues={{ 
                  name: user.name || '', 
                  phone: user.phone || '', 
                  address_line: user.address_line || '',
                  state: user.state || '', 
                  district: user.district || '',
                  farm_size: user.farm_size || '',
                  farming_experience: user.farming_experience || '',
                  preferred_crops: user.preferred_crops || '',
                  profile_pic: user.profile_pic || ''
                }}
                onSubmit={handleProfileUpdate}
              >
                {({ isSubmitting, setFieldValue, values }) => (
                  <Form>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Profile Picture</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          {values.profile_pic && (
                            <img src={values.profile_pic} alt="Preview" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                          )}
                          <input type="file" accept="image/*" className="form-input" onChange={(e) => handleImageUpload(e, setFieldValue)} style={{ flex: 1 }} />
                        </div>
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Full Name</label>
                        <Field type="text" name="name" className="form-input" />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Phone Number</label>
                        <Field type="text" name="phone" className="form-input" />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Address Line</label>
                        <Field type="text" name="address_line" placeholder="Street, village, or farm address" className="form-input" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State</label>
                        <Field type="text" name="state" className="form-input" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">District</label>
                        <Field type="text" name="district" className="form-input" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Farm Size (Acres)</label>
                        <Field type="number" step="0.1" name="farm_size" className="form-input data" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Farming Exp. (Years)</label>
                        <Field type="number" name="farming_experience" className="form-input data" />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Preferred Crops</label>
                        <Field type="text" name="preferred_crops" placeholder="e.g., Rice, Wheat, Sugarcane" className="form-input" />
                      </div>
                      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setActiveTab('details')}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>

              <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />

              <h3 style={{ marginBottom: '24px', color: 'var(--color-primary)' }}>Change Password</h3>
              <Formik
                initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
                onSubmit={handlePasswordChange}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <Field type="password" name="currentPassword" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <Field type="password" name="newPassword" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <Field type="password" name="confirmPassword" className="form-input" required />
                    </div>
                    <div style={{ marginTop: '24px' }}>
                      <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
