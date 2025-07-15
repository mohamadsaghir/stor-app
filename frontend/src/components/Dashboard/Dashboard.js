import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../Loader';
import Navbar from '../Navbar/Navbar';
import './Dashboard.css';
// جلب المنتجات المثبتة (التي كميتها 0)
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pinnedProducts, setPinnedProducts] = useState([]);
  const [showNotifications, setShowNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchUserData = useCallback(async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        console.log('User data:', data.user); // للتحقق من البيانات
      } else {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user data
    fetchUserData(token);
  }, [navigate, fetchUserData]);

  // جلب المنتجات المثبتة (التي كميتها 0)
  useEffect(() => {
    const fetchPinned = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const zeroProducts = (res.data.products || []).filter(p => p.quantity === 0);
        setPinnedProducts(zeroProducts);
        // إشعارات منبثقة
        if (zeroProducts.length > 0) {
          setShowNotifications(zeroProducts.map(p => p._id));
        }
      } catch (err) {
        setPinnedProducts([]);
      }
    };
    fetchPinned();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="dashboard">
      <Navbar user={user} onLogout={handleLogout} />
      {/* إشعارات منبثقة للمنتجات المثبتة */}
      <div style={{ position: 'fixed', top: 24, left: 24, zIndex: 9999 }}>
        {pinnedProducts.map((p) => (
          showNotifications.includes(p._id) && (
            <div
              key={p._id}
              style={{
                background: '#f44336',
                color: '#fff',
                padding: '16px 22px',
                borderRadius: 12,
                marginBottom: 12,
                minWidth: 220,
                boxShadow: '0 2px 12px #f4433640',
                fontWeight: 'bold',
                fontSize: '1.08rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              onClick={() => setShowNotifications(showNotifications.filter(id => id !== p._id))}
            >
              <span style={{ fontSize: '1.3rem' }}>📌</span>
              <span>المنتج <b>{p.name}</b> نفذت كميته!</span>
            </div>
          )
        ))}
      </div>
      {/* إخفاء الإشعار تلقائياً بعد 6 ثوانٍ */}
      {showNotifications.length > 0 && (
        <>
          {showNotifications.forEach((id) => {
            setTimeout(() => {
              setShowNotifications((prev) => prev.filter((x) => x !== id));
            }, 6000);
          })}
        </>
      )}
      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>مرحباً بك في لوحة التحكم</h1>
          <p>مرحباً {user?.username || 'المستخدم'}</p>
        </div>
        
        <div className="dashboard-cards">
          <div className="card cashout-card" onClick={() => navigate('/cash-out')}>
            <div className="card-icon">💵</div>
            <h3>صرف نقدي</h3>
            <p>إنشاء فاتورة وارسالها عبر واتساب</p>
          </div>
          <div className="card products-card" onClick={() => navigate('/products')}>
            <div className="card-icon">📦</div>
            <h3>إدارة المنتجات</h3>
            <p>عرض وإدارة المنتجات</p>
          </div>
          <div className="card netprofit-card" onClick={() => navigate('/net-profit')}>
            <div className="card-icon">💸</div>
            <h3>الربح الصافي</h3>
            <p>عرض الربح الصافي لجميع المنتجات</p>
          </div>
          <div className="card debts-card" onClick={() => navigate('/DebtManager')}>
            <div className="card-icon">💰</div>
            <h3>إدارة الديون</h3>
            <p>إدارة الديون والمدفوعات</p>
          </div>
          {user?.isAdmin && (
            <div className="card users-card" onClick={() => navigate('/AdminUserManagement')}>
              <div className="card-icon">👥</div>
              <h3>إدارة المستخدمين</h3>
              <p>إدارة المستخدمين والصلاحيات</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 