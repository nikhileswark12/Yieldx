import React, { useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { registerUser } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Aurora from '../components/Aurora';
import '../styles/auth.css';

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too Short!').required('Required'),
});

const RegisterPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      const response = await registerUser(values);
      login(response.data.user, response.data.access_token);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Aurora />
      <div className="auth-card">
        <h2 className="auth-title">YieldX</h2>
        <h5 className="auth-subtitle">Create a new account</h5>
        <Formik
          initialValues={{ name: '', email: '', password: '' }}
          validationSchema={RegisterSchema}
          onSubmit={handleRegister}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="auth-form-group">
                <label className="auth-label">Full Name</label>
                <Field type="text" name="name" className="auth-input" />
                <ErrorMessage name="name" component="div" className="auth-error" />
              </div>
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
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </Form>
          )}
        </Formik>
        <div className="auth-link-text">
          <p>Already have an account? <Link to="/login" className="auth-link">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
