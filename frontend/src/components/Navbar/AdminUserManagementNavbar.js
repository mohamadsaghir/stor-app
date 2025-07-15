import React, { useState } from 'react';
import './AdminUserManagementNavbar.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';

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

const AdminUserManagementNavbar = () => {
  const [open, setOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // التحقق من أننا في صفحة Register
  const isRegisterPage = location.pathname === '/register';

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
              {isRegisterPage && (
                <li>
                  <Link 
                    to="/AdminUserManagement" 
                    onClick={() => setOpen(false)}
                  >
                    <span role="img" aria-label="admin">👨‍💼</span> العودة لصفحة الأدمن
                  </Link>
                </li>
              )}
              <li>
                <Link 
                  to="/login" 
                  onClick={() => setOpen(false)}
                >
                  <span role="img" aria-label="login">🔙</span> العودة لتسجيل الدخول
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                >
                  <span role="img" aria-label="create-account">📝</span> إنشاء حساب
                </Link>
              </li>
              <li>
                <Link 
                  to="#about" 
                  onClick={e => { e.preventDefault(); setAboutOpen(true); }}
                >
                  <span role="img" aria-label="about">ℹ️</span> عن البرنامج
                </Link>
              </li>
            </ul>
          </div>
          <div className="sidebar-overlay" onClick={() => {
            setShowSidebar(false);
            setOpen(false);
          }} />
        </>
      )}

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
};

export default AdminUserManagementNavbar; 