import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminUserManagementNavbar from '../Navbar/AdminUserManagementNavbar';
import './AdminUserManagement.css';

// مكون النافذة المنبثقة لتفاصيل المستخدم
const UserDetailModal = ({ user, isOpen, onClose, onDelete, onPasswordChange, onSuspendAccount }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async () => {
    if (passwords.password.length < 6) {
      setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (passwords.password !== passwords.confirm) {
      setPasswordError('كلمتا المرور غير متطابقتين');
      return;
    }
    
    try {
      await onPasswordChange(user._id, passwords.password);
      setPasswordSuccess('تم تغيير كلمة المرور بنجاح');
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess('');
        setPasswords({ password: '', confirm: '' });
      }, 1500);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'فشل في تغيير كلمة المرور');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>تفاصيل المستخدم</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="user-info">
            <div className="info-item">
              <span className="info-label">اسم المستخدم:</span>
              <span className="info-value">{user.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">البريد الإلكتروني:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">تاريخ إنشاء الحساب:</span>
              <span className="info-value">
                {user.createdAt ? 
                  new Date(user.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric'
                  }) : 
                  'غير متوفر'
                }
              </span>
            </div>
          </div>
          
          <div className="modal-actions">
            <button 
              className="action-btn password-btn"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              🔒 تغيير كلمة المرور
            </button>
            
            <button 
              className="action-btn delete-btn"
              onClick={() => {
                if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المستخدم؟')) {
                  onDelete(user._id);
                  onClose();
                }
              }}
            >
              🗑️ حذف الحساب
            </button>
          </div>
          
          {showPasswordForm && (
            <div className="password-form">
              <h3>تغيير كلمة المرور</h3>
              <input
                type="password"
                name="password"
                placeholder="كلمة المرور الجديدة"
                value={passwords.password}
                onChange={handlePasswordChange}
              />
              <input
                type="password"
                name="confirm"
                placeholder="تأكيد كلمة المرور"
                value={passwords.confirm}
                onChange={handlePasswordChange}
              />
              <div className="password-form-actions">
                <button onClick={handlePasswordSubmit}>
                  حفظ
                </button>
                <button onClick={() => setShowPasswordForm(false)}>
                  إلغاء
                </button>
              </div>
              {passwordError && <div className="password-error">{passwordError}</div>}
              {passwordSuccess && <div className="password-success">{passwordSuccess}</div>}
            </div>
          )}
          
          <div className="modal-footer">
            {user.suspended ? (
              <button 
                className="suspend-account-btn"
                onClick={() => {
                  if (window.confirm('هل تريد إلغاء إيقاف هذا الحساب؟')) {
                    onSuspendAccount(user._id, false);
                    onClose();
                  }
                }}
              >
                ▶️ إلغاء إيقاف الحساب
              </button>
            ) : (
              <button 
                className="suspend-account-btn"
                onClick={() => {
                  if (window.confirm('هل أنت متأكد أنك تريد إيقاف هذا الحساب مؤقتاً؟')) {
                    onSuspendAccount(user._id, true);
                    onClose();
                  }
                }}
              >
                ⏸️ إيقاف الحساب مؤقتاً
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // للـ debugging
      
      if (!token) {
        setError('❌ لا يوجد توكن. يرجى تسجيل الدخول مرة أخرى.');
        setLoading(false);
        return;
      }
      
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Users response:', res.data); // للـ debugging
      setUsers(res.data.users || []);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      console.error('Error response:', err.response?.data); // للـ debugging
      if (err.response?.status === 403) {
        setError('❌ ليس لديك صلاحية للوصول لصفحة إدارة المستخدمين. يجب أن تكون أدمن.');
      } else if (err.response?.status === 401) {
        setError('❌ غير مصرح. يرجى تسجيل الدخول مرة أخرى.');
      } else {
        setError(
          err.response?.data?.message ||
          '❌ فشل في جلب المستخدمين.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'فشل في حذف المستخدم');
    }
  };

  const handlePasswordChange = async (userId, newPassword) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/password`, 
        { password: newPassword },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
    } catch (err) {
      throw err;
    }
  };

  const handleSuspendAccount = async (userId, suspend) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/suspend`, 
        { suspended: suspend },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      // تحديث حالة المستخدم في القائمة
      setUsers(users.map(u => 
        u._id === userId ? { ...u, suspended: suspend } : u
      ));
      alert(suspend ? 'تم إيقاف الحساب مؤقتاً بنجاح' : 'تم تفعيل الحساب بنجاح');
    } catch (err) {
      alert(err.response?.data?.message || 'فشل في إيقاف الحساب');
    }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchUsers();
    // Fetch current user data
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(err => console.error('Error fetching user:', err));
    }
  }, []);

  if (loading) {
    return (
      <div className="admin-user-management">
        <AdminUserManagementNavbar />
        <div className="admin-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">جاري تحميل البيانات...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-user-management">
        <AdminUserManagementNavbar />
        <div className="admin-content">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-management">
      <AdminUserManagementNavbar />
      <div className="admin-content">
        <div className="admin-header">
          <h2>إدارة المستخدمين</h2>
        </div>
        
        <div className="admin-container">
          {!users || users.length === 0 ? (
            <div className="no-users">
              لا توجد مستخدمين لعرضهم حالياً.
            </div>
          ) : (
            <div className="users-list">
              {users.map(userItem => (
                <div key={userItem._id} className="user-card">
                  <div className="user-header">
                    <h3 className="user-name">
                      {userItem.username}
                    </h3>
                  </div>
                  <div className="user-details">
                    <div className="user-detail">
                      <span className="user-detail-label">البريد الإلكتروني:</span>
                      <span className="user-detail-value">{userItem.email}</span>
                    </div>
                    <div className="user-detail">
                      <span className="user-detail-label">تاريخ إنشاء الحساب:</span>
                      <span className="user-detail-value">
                        {userItem.createdAt ? 
                          new Date(userItem.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric'
                          }) : 
                          'غير متوفر'
                        }
                      </span>
                    </div>
                  </div>
                      <div className="user-actions">
                        <button 
                      className="more-btn"
                      onClick={() => openUserModal(userItem)}
                        >
                      المزيد ⚙️
                        </button>
                      </div>
                </div>
              ))}
                        </div>
                      )}
        </div>
      </div>
      
      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={closeUserModal}
        onDelete={handleDelete}
        onPasswordChange={handlePasswordChange}
        onSuspendAccount={handleSuspendAccount}
      />
    </div>
  );
};

export default AdminUserManagement;
