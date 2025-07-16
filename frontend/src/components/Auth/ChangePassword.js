import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword.length < 6) {
      setError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقتين');
      return;
    }
    setLoading(true);
    try {
      // تحتاج endpoint في الباكند مثل /api/change-password
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/change-password`, {
        oldPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('تم تغيير كلمة المرور بنجاح!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #a18cd1 0%, #fbc2eb 100%)' }}>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`
        .change-password-card {
          background: rgba(255,255,255,0.95);
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(120, 80, 180, 0.18), 0 2px 8px rgba(120,80,180,0.10);
          padding: 40px 30px 30px 30px;
          width: 100%;
          max-width: 410px;
          text-align: center;
          border: 1.5px solid #e0c3fc;
        }
        .change-password-card h2 {
          color: #7b2ff2;
          margin-bottom: 20px;
          font-size: 2.1rem;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .change-password-form {
          margin-top: 10px;
        }
        .change-password-form .form-group {
          margin-bottom: 22px;
          text-align: left;
        }
        .change-password-form label {
          display: block;
          margin-bottom: 7px;
          color: #5a189a;
          font-weight: 600;
          font-size: 1rem;
        }
        .change-password-form input {
          width: 100%;
          padding: 13px;
          border: 1.5px solid #e0c3fc;
          border-radius: 9px;
          font-size: 1.05rem;
          background: #f8f6ff;
          color: #3c096c;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .change-password-form input:focus {
          outline: none;
          border-color: #a18cd1;
          box-shadow: 0 0 0 2px #a18cd133;
        }
        .change-password-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(90deg, #7b2ff2 0%, #f357a8 100%);
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 1.15rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 10px;
          box-shadow: 0 2px 8px rgba(123,47,242,0.08);
          transition: background 0.2s, transform 0.2s;
        }
        .change-password-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .change-password-btn:hover:not(:disabled) {
          background: linear-gradient(90deg, #f357a8 0%, #7b2ff2 100%);
          transform: translateY(-2px) scale(1.03);
        }
        .change-password-error {
          background: #ffe0e6;
          color: #b00020;
          padding: 11px;
          border-radius: 7px;
          margin-bottom: 20px;
          border: 1px solid #fbc2eb;
          font-size: 1rem;
          font-weight: 500;
        }
        .change-password-success {
          background: #e0ffe6;
          color: #1b5e20;
          padding: 11px;
          border-radius: 7px;
          margin-bottom: 20px;
          border: 1px solid #a3f7bf;
          font-size: 1rem;
          font-weight: 500;
        }
        @media (max-width: 500px) {
          .change-password-card {
            padding: 18px 5px 18px 5px;
            max-width: 98vw;
          }
          .change-password-card h2 {
            font-size: 1.3rem;
          }
        }
      `}</style>
      <div className="change-password-card">
        <h2>تغيير كلمة المرور</h2>
        {error && <div className="change-password-error">{error}</div>}
        {success && <div className="change-password-success">{success}</div>}
        <form className="change-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>كلمة المرور الحالية</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>كلمة المرور الجديدة</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label>تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <button
            type="submit"
            className="change-password-btn"
            disabled={loading}
          >
            {loading ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};

export default ChangePassword; 