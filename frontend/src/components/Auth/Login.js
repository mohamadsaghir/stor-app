import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

 // We'll create this CSS file

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', formData); // للـ debugging
      const API_URL = process.env.REACT_APP_API_URL?.replace(/\/$/, "");
      const loginUrl = `${API_URL}/api/login`;
      console.log('Login URL:', loginUrl); // Debugging
      const res = await axios.post(loginUrl, formData);
      console.log('Login response:', res.data); // للـ debugging
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      
      console.log('Token saved:', res.data.token); // للـ debugging
      console.log('User ID saved:', res.data.userId); // للـ debugging
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error.response?.data); // للـ debugging
      setError(error.response?.data?.message || 'فشل في تسجيل الدخول. يرجى التحقق من بياناتك.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div style={{textAlign: 'center', fontSize: '2.5rem', color: '#6366f1', marginBottom: '10px'}}>
          <span role="img" aria-label="قفل">🔒</span>
        </div>
        <div className="login-header">
          <h2 style={{fontWeight: 900, fontSize: '2.2rem', letterSpacing: '1px'}}>Login</h2>
          <p>أدخل بياناتك لتسجيل الدخول</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Username"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'block',
                fontSize: 18,
                padding: '14px 18px',
                minHeight: 40,
                borderRadius: 10,
                boxSizing: 'border-box',
                marginBottom: 16,
                border: '1.5px solid #444a',
                background: 'rgba(41,43,44,0.95)',
                color: '#fff',
                outline: 'none',
                transition: 'border 0.2s',
                fontWeight: 500,
                letterSpacing: 0.3,
                boxShadow: '0 2px 8px rgba(102,102,234,0.08)'
              }}
            />
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              style={{
                width: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'block',
                fontSize: 18,
                padding: '14px 18px',
                minHeight: 40,
                borderRadius: 10,
                boxSizing: 'border-box',
                marginBottom: 16,
                border: '1.5px solid #444a',
                background: 'rgba(41,43,44,0.95)',
                color: '#fff',
                outline: 'none',
                transition: 'border 0.2s',
                fontWeight: 500,
                letterSpacing: 0.3,
                boxShadow: '0 2px 8px rgba(102,102,234,0.08)'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute',
                top: '50%',
                left: 18,
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 20,
                color: '#aaa',
                padding: 0,
                margin: 0,
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                // Eye Off SVG
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5 0-9.27-3.11-11-7.5a12.32 12.32 0 0 1 2.06-3.28"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c1.93 0 3.5-1.57 3.5-3.5a3.5 3.5 0 0 0-5.97-2.47"/></svg>
              ) : (
                // Eye SVG
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3.5"/></svg>
              )}
            </button>
          </div>
          <div className="login-row">
            <label>
              <input type="checkbox" style={{marginLeft: '6px'}} /> Remember me
            </label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button 
            type="submit" 
            style={{
              width: '100%',
              boxSizing: 'border-box',
              fontSize: 18,
              padding: '14px 0',
              borderRadius: 10,
              fontWeight: 'bold',
              letterSpacing: 1,
              boxShadow: '0 2px 8px #0072ff33',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.1s',
              marginTop: 2,
              background: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)',
              color: '#fff',
              border: 'none',
              margin: '0 auto',
              display: 'block',
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;