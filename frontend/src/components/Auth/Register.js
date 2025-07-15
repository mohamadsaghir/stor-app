import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminUserManagementNavbar from '../Navbar/AdminUserManagementNavbar';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('كلمتا المرور غير متطابقتين');
    }

    if (formData.password.length < 6) {
      return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    }

    try {
      setError('');
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/api/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      // تسجيل الدخول تلقائياً بعد التسجيل
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('accountName', formData.username);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <AdminUserManagementNavbar />
      <div className="register-container">
        <div className="register-header">
          <h2>إنشاء حساب جديد</h2>
          <p>انضم إلينا اليوم واستمتع بإدارة منتجاتك</p>
        </div>
        
        {error && <div className="register-error">{error}</div>}
        
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <span className="icon">👤</span>
              اسم المستخدم
            </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="أدخل اسم المستخدم"
                required
              className="form-input"
              />
          </div>
          
          <div className="form-group">
            <label>
              <span className="icon">📧</span>
              البريد الإلكتروني
            </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="أدخل بريدك الإلكتروني"
                required
              className="form-input"
              />
          </div>
          
          <div className="form-group">
            <label>
              <span className="icon">🔒</span>
              كلمة المرور
            </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                required
                minLength="6"
              className="form-input"
              />
          </div>
          
          <div className="form-group">
            <label>
              <span className="icon">🔒</span>
              تأكيد كلمة المرور
            </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="أعد إدخال كلمة المرور"
                required
              className="form-input"
              />
          </div>
          
          <button 
            type="submit" 
            className="register-btn"
            disabled={loading}
          >
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>
        
        <div className="register-footer">
          لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;