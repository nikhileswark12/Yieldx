import React, { useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { loginUser } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Aurora from '../components/Aurora';
import '../styles/auth.css';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const response = await loginUser(values);
      login(response.data.user, response.data.access_token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Aurora />
      <div className="auth-card">
        <h2 className="auth-title">YieldX</h2>
        <h5 className="auth-subtitle">Login to your account</h5>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="auth-form-group">
                <label className="auth-label">Email</label>
                <Field type="email" name="email" className="auth-input" />
                <ErrorMessage name="email" component="div" className="auth-error" />
              </div>
              <div className="auth-form-group" style={{ marginBottom: '24px' }}>
                <label className="auth-label">Password</label>
                <Field type="password" name="password" className="auth-input" />
                <ErrorMessage name="password" component="div" className="auth-error" />
              </div>
              <button type="submit" className="auth-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </Form>
          )}
        </Formik>
        <div className="auth-link-text">
          <p>Don't have an account? <Link to="/register" className="auth-link">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
