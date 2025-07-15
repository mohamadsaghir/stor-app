import React, { useState } from 'react';
import './Navbar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// نافذة منبثقة بسيطة لعرض معلومات عن البرنامج
const AboutModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="about-modal-overlay" onClick={onClose}>
      <div className="about-modal" onClick={e => e.stopPropagation()}>
        <h2 style={{ color: '#7511ee', marginBottom: 12 }}>عن البرنامج</h2>
        <p style={{ color: '#222', fontWeight: 500, marginBottom: 10 }}>
          هذا البرنامج مخصص لإدارة المنتجات والديون للمحلات الصغيرة والمتوسطة. يمكنك من خلاله إضافة وتعديل المنتجات، إدارة الديون، إرسال تذكير عبر واتساب، والمزيد بسهولة وفعالية.
        </p>
        <div style={{ color: '#444', marginBottom: 8 }}>
          <b>رقم الهاتف:</b> <a href="tel:+96103845568" style={{ color: '#7511ee', textDecoration: 'none' }}>+961 03845568</a>
        </div>
        <div style={{ color: '#444', marginBottom: 8 }}>
          <b>الإيميل:</b> <a href="mailto:sitsaghir@gmail.com" style={{ color: '#7511ee', textDecoration: 'none' }}>sitsaghir@gmail.com</a>
        </div>
        <button onClick={onClose} style={{ marginTop: 10, background: '#7511ee', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer' }}>إغلاق</button>
      </div>
    </div>
  );
};

const Navbar = ({ hideMainLinks, showLoginLink, hideChangePassword, user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // تحقق من وجود التوكن
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  // دالة تسجيل الخروج
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
    setOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <button 
        onClick={() => {
          if (!open) {
            setOpen(true);
            setTimeout(() => setShowSidebar(true), 50);
          } else {
            setShowSidebar(false);
            setOpen(false);
          }
        }} 
        className="hamburger-btn"
      >
        ☰
      </button>

      {/* القائمة الجانبية تظهر فقط إذا كان open=true */}
      {open && (
        <>
          <div className={`sidebar open${showSidebar ? ' sidebar-animate' : ''}`}>
            <button 
              onClick={() => {
                setShowSidebar(false);
                setOpen(false);
              }} 
              className="close-btn"
            >
              ×
            </button>
            
            <div className="navbar-logo">
              إدارة التطبيق
            </div>
            
            <ul className="navbar-links">
              {!hideMainLinks && (
                <>
                  <li>
                    <Link 
                      to="/dashboard" 
                      className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                      onClick={() => setOpen(false)}
                    >
                      <span role="img" aria-label="home">🏠</span> الرئيسية
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/cash-out" 
                      className={`nav-link ${isActive('/cash-out') ? 'active' : ''}`}
                      onClick={() => setOpen(false)}
                    >
                      <span role="img" aria-label="cash-out">💵</span> صرف نقدي
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/products" 
                      className={`nav-link ${isActive('/products') ? 'active' : ''}`}
                      onClick={() => setOpen(false)}
                    >
                      <span role="img" aria-label="products">📦</span> المنتجات
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/DebtManager" 
                      className={`nav-link ${isActive('/DebtManager') || isActive('/debt-manager') ? 'active' : ''}`}
                      onClick={() => setOpen(false)}
                    >
                      <span role="img" aria-label="debt">💰</span> إدارة الديون
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/net-profit" 
                      className={`nav-link ${isActive('/net-profit') ? 'active' : ''}`}
                      onClick={() => setOpen(false)}
                    >
                      <span role="img" aria-label="net-profit">💸</span> الربح الصافي
                    </Link>
                  </li>
                </>
              )}
              {showLoginLink && (
                <>
                  <li>
                    <Link 
                      to="/login" 
                      className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                      onClick={() => setOpen(false)}
                    >
                      العودة إلى تسجيل الدخول
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://wa.me/+96103845568?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A5%D9%86%D8%B4%D8%A7%D8%A1%20%D8%AD%D8%B3%D8%A8"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                    >
                      إنشاء حساب
                    </a>
                  </li>
                </>
              )}
              {/* إظهار اتصل بنا وأدمن فقط إذا لم يكن المستخدم مسجلاً الدخول */}
              {!isLoggedIn && (
                <>
                  <li>
                    <a
                      href="https://wa.me/+96103845568"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="navbar-link whatsapp-link"
                      onClick={() => setOpen(false)}
                    >
                      <span role="img" aria-label="whatsapp">🟢</span> اتصل بنا
                    </a>
                  </li>
                  <li>
                    <a
                      href="/simple-admin-login"
                      onClick={() => setOpen(false)}
                      className="navbar-link admin-link"
                    >
                      أدمن
                    </a>
                  </li>
                </>
              )}
              {isLoggedIn && !hideChangePassword && (
                <li>
                  <Link 
                    to="/change-password" 
                    className={`nav-link ${isActive('/change-password') ? 'active' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    <span role="img" aria-label="password">🔑</span> تغيير كلمة المرور
                  </Link>
                </li>
              )}
              {isLoggedIn && (
                <li>
                  <button
                    className="nav-link"
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, textAlign: 'right' }}
                    onClick={handleLogout}
                  >
                    <span role="img" aria-label="logout">🚪</span> تسجيل الخروج
                  </button>
                </li>
              )}
              <li>
                <button
                  className="nav-link"
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, textAlign: 'right' }}
                  onClick={() => setAboutOpen(true)}
                >
                  <span role="img" aria-label="about">ℹ️</span> عن البرنامج
                </button>
              </li>
            </ul>
          </div>
          <div 
            onClick={() => {
              setShowSidebar(false);
              setOpen(false);
            }}
            className="overlay show"
          />
        </>
      )}

      {/* نافذة عن البرنامج */}
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
};

export default Navbar;
