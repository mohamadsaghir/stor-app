import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SimpleAdminLogin.css';

const SimpleAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
      setError('');

    try {
      console.log('Attempting admin login with:', { email, password }); // للـ debugging
      const res = await axios.post(`${API_URL}/api/login`, { email, password });
      console.log('Admin login response:', res.data); // للـ debugging
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      
      console.log('Admin token saved:', res.data.token); // للـ debugging
      console.log('Admin user ID saved:', res.data.userId); // للـ debugging
      
      navigate('/AdminUserManagement');
    } catch (error) {
      console.error('Admin login error:', error.response?.data); // للـ debugging
      setError(error.response?.data?.message || 'فشل في تسجيل الدخول. يرجى التحقق من بياناتك.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simple-admin-login-bg">
      <div className="simple-admin-login-card">
        <div className="simple-admin-login-avatar">
          <span className="simple-admin-login-avatar-icon">A</span>
        </div>
        <div className="simple-admin-login-title-row" style={{ marginBottom: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2 className="simple-admin-login-title">
            <span className="simple-admin-login-admin-icon">👤</span>
            تسجيل دخول الأدمن
          </h2>
        </div>
        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
            }}
          />
          <div style={{ position: 'relative', width: '100%', margin: '0 auto 16px auto' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="كلمة المرور"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                display: 'block',
                fontSize: 18,
                padding: '14px 18px',
                minHeight: 40,
                borderRadius: 10,
                boxSizing: 'border-box',
                border: '1.5px solid #444a',
                background: 'rgba(41,43,44,0.95)',
                color: '#fff',
                outline: 'none',
                transition: 'border 0.2s',
                fontWeight: 500,
                letterSpacing: 0.3,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute',
                top: '50%',
                right: 18,
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 22,
                color: '#aaa',
                padding: 0,
                margin: 0,
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              tabIndex={-1}
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              {showPassword ? (
                // Eye Off SVG
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5 0-9.27-3.11-11-7.5a12.32 12.32 0 0 1 2.06-3.28"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c1.93 0 3.5-1.57 3.5-3.5a3.5 3.5 0 0 0-5.97-2.47"/></svg>
              ) : (
                // Eye SVG
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3.5"/></svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              fontSize: 18,
              padding: '14px 0',
              margin: '0 auto',
              display: 'block',
              background: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 'bold',
              letterSpacing: 1,
              boxShadow: '0 2px 8px #0072ff33',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s, transform 0.1s',
              marginTop: 2,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> جاري تسجيل الدخول...
              </>
            ) : (
              'دخول'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              fontSize: 16,
              padding: '12px 0',
              margin: '16px auto 0 auto',
              display: 'block',
              background: 'transparent',
              color: '#00c6ff',
              border: '2px solid #00c6ff',
              borderRadius: 10,
              fontWeight: 'bold',
              letterSpacing: 1,
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseOver={e => {
              e.target.style.background = '#00c6ff';
              e.target.style.color = '#fff';
            }}
            onMouseOut={e => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#00c6ff';
            }}
          >
            العودة إلى تسجيل الدخول
          </button>
          {error && <div className="simple-admin-login-error">{error}</div>}
        </form>
        <div className="simple-admin-login-footer">
          &copy; {new Date().getFullYear()} إدارة المنتجات
        </div>
      </div>
    </div>
  );
};

export default SimpleAdminLogin; 