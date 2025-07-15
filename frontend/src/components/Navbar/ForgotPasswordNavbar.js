import React, { useState } from 'react';
import './ForgotPasswordNavbar.css';
import { Link, useNavigate } from 'react-router-dom';

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

const ForgotPasswordNavbar = () => {
  const [open, setOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const navigate = useNavigate();

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
              <li>
                <Link 
                  to="/login" 
                  onClick={() => setOpen(false)}
                >
                  <span role="img" aria-label="login">🔙</span> العودة إلى تسجيل الدخول
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/+96103845568"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                >
                  <span role="img" aria-label="whatsapp">🟢</span> اتصل بنا
                </a>
              </li>
              <li>
                <Link
                  to="/simple-admin-login"
                  onClick={() => setOpen(false)}
                >
                  <span role="img" aria-label="admin">👨‍💼</span> أدمن
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

export default ForgotPasswordNavbar; 