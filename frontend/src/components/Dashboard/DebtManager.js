import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import './DebtManager.css';

const API_BASE = process.env.REACT_APP_API_URL + '/api/debts';

const inputStyle = {
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #333',
  backgroundColor: '#2c2c3a',
  color: '#fff',
  flex: '1 1 200px',
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'background 0.3s',
  flex: '1 1 100px',
};

const buttonStyles = {
  edit: {
    background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 700,
    margin: '0 6px 6px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    minWidth: 80,
    padding: '10px 0',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
  },
  delete: {
    background: 'linear-gradient(135deg, #e53935 0%, #ff5252 100%)',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 700,
    margin: '0 6px 6px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    minWidth: 80,
    padding: '10px 0',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
  },
  whatsapp: {
    background: 'linear-gradient(135deg, #43d854 0%, #00c853 100%)',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 700,
    margin: '0 6px 6px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    minWidth: 80,
    padding: '10px 0',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
  },
  settle: {
    background: 'linear-gradient(135deg, #00bcd4 0%, #18ffff 100%)',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 700,
    margin: '0 6px 6px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    minWidth: 80,
    padding: '10px 0',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
  }
};

const isMobile = window.innerWidth <= 700;

const smallButton = {
  fontSize: '12px',
  minWidth: 60,
  padding: '6px 0',
};

const DebtManager = () => {
  const [debts, setDebts] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', date: '', note: '', amount: '' });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDebts = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('لم يتم تسجيل الدخول.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(API_BASE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data.success) {
        setDebts(data.debts);
      } else {
        setError(data.message || 'فشل في تحميل الديون.');
      }
    } catch (err) {
      console.error('Error fetching debts:', err);
      setError('حدث خطأ أثناء جلب الديون.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        fetchDebts();
        setForm({ name: '', phone: '', date: '', note: '', amount: '' });
        setEditingId(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error saving debt:', error);
      alert('حدث خطأ أثناء حفظ الدين.');
    }
  };

  const handleEdit = (debt) => {
    setForm({
      ...debt,
      date: debt.date ? debt.date.substring(0, 10) : '',
    });
    setEditingId(debt._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا الدين؟')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setDebts(debts.filter(d => d._id !== id));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting debt:', error);
      alert('حدث خطأ أثناء حذف الدين.');
    }
  };

  const sendWhatsApp = (debt) => {
    const name = debt.name || '';
    const date = debt.date ? new Date(debt.date).toLocaleDateString() : '';
    const amount = debt.amount || '';
    const formattedNote = (debt.note || '').replace(/\\n|\n/g, '\n');
    let phone = debt.phone.replace(/[^0-9]/g, '');
    if (!phone.startsWith('961')) phone = '961' + phone;

    const message = `فاتورة دين:\n` +
      `الاسم: ${name}\n` +
      `رقم الهاتف: ${debt.phone}\n` +
      `التاريخ: ${date}\n` +
      `المبلغ: ${amount}\n` +
      `${formattedNote}\n\n` +
      `يرجى تسديد المبلغ في أقرب وقت ممكن. شكراً لك!`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSettle = (debt) => {
    const name = debt.name || '';
    const amount = debt.amount || '';
    const message = `تم تسديد المبلغ ${amount}، شكراً لك ${name}`;
    let phone = debt.phone.replace(/[^0-9]/g, '');
    if (!phone.startsWith('961')) phone = '961' + phone;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');

    setTimeout(() => {
      const confirmDelete = window.confirm('هل تريد حذف هذا الدين بعد التسديد؟');
      if (confirmDelete) {
        handleDelete(debt._id);
      }
    }, 100);

    setForm({ name: '', phone: '', date: '', note: '', amount: '' });
  };

  const filteredDebts = debts.filter(
    (debt) =>
      debt.name.toLowerCase().includes(search.toLowerCase()) ||
      debt.phone.includes(search)
  );

  if (loading) return <div style={{ color: '#fff', padding: '20px' }}>جاري تحميل البيانات...</div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>خطأ: {error}</div>;

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
      <Navbar />
      <h2 style={{ color: '#f0f0f0', marginBottom: '20px', textAlign: 'center' }}>إدارة الديون</h2>

      <input
        type="text"
        placeholder="ابحث بالاسم أو رقم الهاتف..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #444',
          backgroundColor: '#2c2c3a',
          color: '#fff',
          fontSize: '15px',
          marginBottom: '20px',
        }}
      />

      <div
        className="add-product"
        style={{
          backgroundColor: '#1e1e2f',
          padding: '20px',
          marginBottom: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(255, 255, 255, 0.05)',
          color: '#fff',
        }}
      >
        <h3 style={{ textAlign: 'center' }}>{editingId ? 'تعديل الدين' : 'إضافة دين جديد'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          <input type="text" name="name" placeholder="الاسم" value={form.name} onChange={handleChange} required style={inputStyle} />
          <input type="text" name="phone" placeholder="رقم الهاتف" value={form.phone} onChange={handleChange} required style={inputStyle} />
          <input type="date" name="date" value={form.date ? form.date.substring(0, 10) : ''} onChange={handleChange} style={inputStyle} />
          <input type="number" name="amount" placeholder="المبلغ" value={form.amount} onChange={handleChange} required style={inputStyle} />
          <input type="text" name="note" placeholder="رسالة" value={form.note} onChange={handleChange} style={inputStyle} />
          <button type="submit" style={buttonStyle}>
            {editingId ? 'تعديل الدين' : 'إضافة الدين'}
          </button>
        </form>
      </div>

      <hr style={{ margin: '30px 0', borderColor: '#444' }} />

      {/* عرض الديون ككروت عمودية */}
      <div className="debts-list" style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
        {filteredDebts.length > 0 ? (
          filteredDebts.map((debt, idx) => (
            <div key={debt._id} className="debt-card" style={{ background: '#23233a', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', padding: '18px 16px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontWeight: 700, fontSize: '18px', color: '#4fc3f7' }}>
                  {idx + 1}. {debt.name}
                </div>
                <div style={{ color: '#bbb', fontSize: '14px' }}>{debt.date ? new Date(debt.date).toLocaleDateString() : ''}</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center', marginTop: '4px' }}>
                <div style={{ minWidth: 120 }}><span style={{ color: '#aaa' }}>الهاتف:</span> {debt.phone}</div>
                <div style={{ minWidth: 120 }}><span style={{ color: '#aaa' }}>المبلغ:</span> <span style={{ color: 'red', fontWeight: 'bold' }}>{debt.amount}</span></div>
                <div style={{ minWidth: 120 }}><span style={{ color: '#aaa' }}>رسالة:</span> {debt.note ? debt.note.split(/\\n|\n/).map((line, i) => <div key={i}>{line}</div>) : '-'}</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                <button style={{ ...buttonStyles.edit, ...(isMobile ? smallButton : {}) }} onClick={() => handleEdit(debt)}>تعديل</button>
                <button style={{ ...buttonStyles.delete, ...(isMobile ? smallButton : {}) }} onClick={() => handleDelete(debt._id)}>حذف</button>
                <button style={{ ...buttonStyles.whatsapp, ...(isMobile ? smallButton : {}) }} onClick={() => sendWhatsApp(debt)}>واتساب</button>
                <button style={{ ...buttonStyles.settle, ...(isMobile ? smallButton : {}) }} onClick={() => handleSettle(debt)}>تسديد</button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#bbb', background: '#23233a', borderRadius: '12px' }}>لا توجد نتائج للبحث.</div>
        )}
      </div>
    </div>
  );
};

export default DebtManager;
