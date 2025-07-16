import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddProduct.css';

const AddProduct = ({ onAdd, onUpdate, editingProduct, cancelEdit, searchTerm, onSearchChange }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    profit: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        price: editingProduct.price,
        quantity: editingProduct.quantity,
        profit: editingProduct.profit,
      });
      setMessage('');
    } else {
      setFormData({ name: '', price: '', quantity: '', profit: '' });
      setMessage('');
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'name') {
      if (value.trim() === '') {
        setMessage('اسم المنتج لا يمكن أن يحتوي فقط على فراغات');
      } else {
        setMessage('');
      }
      if (/^\s/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const token = localStorage.getItem('token');

    // أولاً نشيل فراغات أول وآخر النص (trim)
    let trimmedName = formData.name.trim();

    if (!trimmedName) {
      setMessage('اسم المنتج لا يمكن أن يكون فارغًا أو يحتوي فقط على فراغات');
      setLoading(false);
      return;
    }

    // هان استبدل كل المسافات بين الكلمات برمز -
    trimmedName = trimmedName.replace(/\s+/g, '-');

    // نعدل الاسم في formData قبل الإرسال
    const dataToSend = {
      ...formData,
      name: trimmedName,
    };

    try {
      const API_URL = process.env.REACT_APP_API_URL;
      if (editingProduct) {
        const response = await axios.put(
          `${API_URL}/api/products/${editingProduct._id}`,
          dataToSend,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        onUpdate(response.data.product);
        setMessage('تم تحديث المنتج بنجاح');
      } else {
        const response = await axios.post(
          `${API_URL}/api/products`,
          dataToSend,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        onAdd(response.data.product);
        setMessage('تمت إضافة المنتج بنجاح');
      }

      setFormData({ name: '', price: '', quantity: '', profit: '' });
    } catch (error) {
      setMessage('حدث خطأ أثناء العملية');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h3 className="add-product-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1.5em', color: '#6366f1' }}>🛒</span>
        {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
      </h3>
      <form className="search-form" style={{ display: 'flex', gap: '10px', marginBottom: '18px', justifyContent: 'center', alignItems: 'center' }} onSubmit={e => e.preventDefault()}>
        <input
          type="text"
          className="search-input"
          placeholder="ابحث عن منتج بالاسم..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          style={{ flex: 1, minWidth: 200, maxWidth: 300 }}
        />
      </form>
      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="add-product-inputs">
          <div className="add-product-row">
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="name" style={{ color: '#8b5cf6', fontWeight: 600, marginBottom: 2, textAlign: 'right' }}>اسم المنتج</label>
              <input 
                type="text" 
                name="name" 
                id="name"
                placeholder="اسم المنتج (مثال: شوكولاتة مارس)" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="form-input"
                onKeyDown={e => { 
                  if (e.key === ' ' && formData.name.trim() === '') { 
                    e.preventDefault(); 
                    setMessage('لا يمكنك بدء الاسم بفراغ'); 
                  } 
                }} 
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="price" style={{ color: '#8b5cf6', fontWeight: 600, marginBottom: 2, textAlign: 'right' }}>السعر</label>
              <input 
                type="number" 
                name="price" 
                id="price"
                placeholder="السعر (مثال: 10 $)" 
                value={formData.price} 
                onChange={handleChange} 
                required 
                className="form-input"
              />
            </div>
          </div>
          <div className="add-product-row">
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="profit" style={{ color: '#8b5cf6', fontWeight: 600, marginBottom: 2, textAlign: 'right' }}>الربح</label>
              <input 
                type="number" 
                name="profit" 
                id="profit"
                placeholder="الربح (مثال: 2 $)" 
                value={formData.profit} 
                onChange={handleChange} 
                required 
                className="form-input"
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="quantity" style={{ color: '#8b5cf6', fontWeight: 600, marginBottom: 2, textAlign: 'right' }}>الكمية</label>
              <input 
                type="number" 
                name="quantity" 
                id="quantity"
                placeholder="الكمية (مثال: 5)" 
                value={formData.quantity} 
                onChange={handleChange} 
                required 
                className="form-input"
              />
            </div>
          </div>
        </div>
        <div className="button-group">
          <button 
            type="submit" 
            disabled={loading} 
            className="submit-btn"
            style={{ fontWeight: 800, letterSpacing: '1px', fontSize: '1.15rem' }}
          >
            {loading ? (editingProduct ? 'جاري التحديث...' : 'جاري الإضافة...') : (editingProduct ? 'تحديث المنتج' : 'إضافة المنتج')}
          </button>
          {editingProduct && (
            <button 
              type="button" 
              onClick={cancelEdit} 
              className="cancel-btn"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>
      {message && (
        <div className="message">
          {message}
        </div>
      )}
    </div>
  );
};

export default AddProduct;
