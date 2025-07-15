import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // التحقق من صحة التوكن عند تحميل الصفحة
    const checkTokenValidity = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reset-password/verify/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setIsValidToken(true);
        } else {
          setError('رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية');
        }
      } catch (err) {
        setError('حدث خطأ في التحقق من صحة الرابط');
      } finally {
        setIsCheckingToken(false);
      }
    };
    checkTokenValidity();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'تم إعادة تعيين كلمة المرور بنجاح');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>جاري التحقق من صحة الرابط...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h2>رابط غير صالح</h2>
          <div className="error-message">{error}</div>
          <div className="back-to-login">
            <a href="/login">العودة إلى تسجيل الدخول</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>إعادة تعيين كلمة المرور</h2>
        <p className="reset-password-description">
          أدخل كلمة المرور الجديدة
        </p>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="password">كلمة المرور الجديدة</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الجديدة"
              required
              className="form-input"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد إدخال كلمة المرور"
              required
              className="form-input"
              minLength="6"
            />
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'جاري الحفظ...' : 'إعادة تعيين كلمة المرور'}
          </button>
        </form>

        <div className="back-to-login">
          <a href="/login">العودة إلى تسجيل الدخول</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 