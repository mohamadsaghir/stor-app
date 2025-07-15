import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import './NetProfit.css';

// دالة لتنسيق التاريخ بالشكل المطلوب (مثال: 2/2/2025)
function formatDate(dateString) {
  const d = new Date(dateString);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const NetProfit = () => {
  const [netProfit, setNetProfit] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changeHistory, setChangeHistory] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_URL}/api/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(res.data.products || []);
        // حساب مجموع الربح الصافي
        const totalNetProfit = (res.data.products || []).reduce(
          (sum, p) => sum + (p.netProfit || 0),
          0
        );
        setNetProfit(totalNetProfit);
      } catch (err) {
        setNetProfit(0);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // مراقبة التغييرات في المنتجات
  useEffect(() => {
    // تأكد من أن المنتجات تم تحميلها قبل جلب التغييرات
    if (products.length === 0) return;
    
    const token = localStorage.getItem('token');
    const fetchChangeHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/product-changes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // فلترة التغييرات - إخفاء عمليات الحذف والإضافة
        const filteredChanges = (res.data.changes || []).filter(change => 
          change.type !== 'delete' && change.type !== 'add'
        );
        
        // فلترة إضافية - إظهار فقط التعديلات التي فيها نقصان في الكمية
        const decreaseChanges = filteredChanges.filter(change => 
          change.oldQuantity > change.newQuantity
        );
        
        // دمج التغييرات المتعددة لنفس المنتج - إظهار آخر تحديث فقط
        const mergedChanges = decreaseChanges.reduce((acc, change) => {
          const existingIndex = acc.findIndex(item => item.productName === change.productName);
          
          if (existingIndex === -1) {
            // منتج جديد - أضفه
            acc.push(change);
          } else {
            // منتج موجود - استبدله بالتحديث الأحدث
            if (new Date(change.timestamp) > new Date(acc[existingIndex].timestamp)) {
              acc[existingIndex] = change;
            }
          }
          
          return acc;
        }, []);
        
        // ترتيب التغييرات - المنتجات ذات الكمية 0 في الأعلى
        const sortedChanges = mergedChanges.sort((a, b) => {
          const aIsZero = a.newQuantity === 0;
          const bIsZero = b.newQuantity === 0;
          
          if (aIsZero && !bIsZero) return -1; // a في الأعلى
          if (!aIsZero && bIsZero) return 1;  // b في الأعلى
          return 0; // نفس الترتيب
        });
        
        // إنشاء قائمة بالمنتجات الحالية مع كمياتها الحالية
        const currentProductsWithChanges = products.map(product => {
          // البحث عن آخر تغيير لهذا المنتج
          const lastChange = sortedChanges.find(change => change.productName === product.name);
          
          if (lastChange) {
            return {
              _id: lastChange._id,
              productName: product.name,
              newQuantity: product.quantity, // الكمية الحالية من قاعدة البيانات
              oldQuantity: lastChange.oldQuantity,
              netProfit: product.netProfit,
              timestamp: lastChange.timestamp,
              type: lastChange.type
            };
          }
          return null;
        }).filter(item => item !== null);
        
        // فلترة - إظهار فقط المنتجات التي لديها تغييرات
        const filteredByCurrentProducts = currentProductsWithChanges.filter(change => 
          change.oldQuantity > change.newQuantity // فقط المنتجات التي نقصت كميتها
        );
        
        setChangeHistory(filteredByCurrentProducts);
      } catch (err) {
        console.error('Error fetching change history:', err);
      }
    };
    fetchChangeHistory();
  }, [products]); // أضفت products كdependency

  const handleDeleteChange = async (changeId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التسجيل؟')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`${API_URL}/api/product-changes/${changeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // إعادة تحميل البيانات بعد الحذف
        const res = await axios.get(`${API_URL}/api/product-changes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const filteredChanges = (res.data.changes || []).filter(change => 
          change.type !== 'delete' && change.type !== 'add'
        );
        const decreaseChanges = filteredChanges.filter(change => 
          change.oldQuantity > change.newQuantity
        );
        const mergedChanges = decreaseChanges.reduce((acc, change) => {
          const existingIndex = acc.findIndex(item => item.productName === change.productName);
          if (existingIndex === -1) {
            acc.push(change);
          } else {
            if (new Date(change.timestamp) > new Date(acc[existingIndex].timestamp)) {
              acc[existingIndex] = change;
            }
          }
          return acc;
        }, []);
        
        // ترتيب التغييرات - المنتجات ذات الكمية 0 في الأعلى
        const sortedChanges = mergedChanges.sort((a, b) => {
          const aIsZero = a.newQuantity === 0;
          const bIsZero = b.newQuantity === 0;
          
          if (aIsZero && !bIsZero) return -1; // a في الأعلى
          if (!aIsZero && bIsZero) return 1;  // b في الأعلى
          return 0; // نفس الترتيب
        });
        // تأكد من أن المنتجات تم تحميلها قبل الفلترة
        if (products.length > 0) {
          // إنشاء قائمة بالمنتجات الحالية مع كمياتها الحالية
          const currentProductsWithChanges = products.map(product => {
            // البحث عن آخر تغيير لهذا المنتج
            const lastChange = sortedChanges.find(change => change.productName === product.name);
            
            if (lastChange) {
              return {
                _id: lastChange._id,
                productName: product.name,
                newQuantity: product.quantity, // الكمية الحالية من قاعدة البيانات
                oldQuantity: lastChange.oldQuantity,
                netProfit: product.netProfit,
                timestamp: lastChange.timestamp,
                type: lastChange.type
              };
            }
            return null;
          }).filter(item => item !== null);
          
          // فلترة - إظهار فقط المنتجات التي لديها تغييرات
          const filteredByCurrentProducts = currentProductsWithChanges.filter(change => 
            change.oldQuantity > change.newQuantity // فقط المنتجات التي نقصت كميتها
          );
          
          setChangeHistory(filteredByCurrentProducts);
        }
      } catch (err) {
        console.error('Error deleting change:', err);
        alert('حدث خطأ أثناء حذف التسجيل');
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="net-profit-container">
        <h2><span role="img" aria-label="net-profit">💸</span> الربح الصافي</h2>
        
        {loading ? (
          <div className="loading">جاري التحميل...</div>
        ) : (
          <>
            <div className="net-profit-value">
              {netProfit.toLocaleString()} $
            </div>

            <div className="products-summary">
              <h3>ملخص المنتجات</h3>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">عدد المنتجات:</span>
                  <span className="stat-value">{products.length}</span>
                </div>
              </div>
            </div>

            {/* جدول تتبع التغييرات - يظهر فقط إذا كان هناك منتجات */}
            {products.length > 0 && (
              <div className="changes-table-section">
                <div className="table-header">
                  <h3>📊 تتبع المنتجات الناقصة <span className="pin-note">(📌 = مثبتة)</span></h3>
                  <button 
                    className="refresh-btn"
                    onClick={() => {
                      const fetchProducts = async () => {
                        const token = localStorage.getItem('token');
                        try {
                          const res = await axios.get(`${API_URL}/api/products`, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          setProducts(res.data.products || []);
                          const totalNetProfit = (res.data.products || []).reduce(
                            (sum, p) => sum + (p.netProfit || 0),
                            0
                          );
                          setNetProfit(totalNetProfit);
                        } catch (err) {
                          console.error('Error refreshing data:', err);
                        }
                      };
                      fetchProducts();
                    }}
                  >
                    🔄 تحديث
                  </button>
                </div>
                <div className="changes-table-container">
                  <table className="changes-table">
                    <thead>
                      <tr>
                        <th>الإجراءات</th>
                        <th>الوقت</th>
                        <th>الربح الصافي</th>
                        <th>النقص في الكمية</th>
                        <th>الكمية الجديدة</th>
                        <th>اسم المنتج</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changeHistory.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="no-data">
                            لا توجد تغييرات مسجلة
                          </td>
                        </tr>
                      ) : (
                        changeHistory.map((change, index) => (
                          <tr 
                            key={change._id || index}
                            className={change.newQuantity === 0 ? 'zero-quantity' : ''}
                          >
                            <td>
                              <button 
                                className="delete-btn"
                                onClick={() => handleDeleteChange(change._id)}
                              >
                                🗑️ حذف
                              </button>
                            </td>
                            <td>{formatDate(change.timestamp)}</td>
                            <td>{change.netProfit ? change.netProfit.toLocaleString() + ' $' : '-'}</td>
                            <td>{change.oldQuantity - change.newQuantity}</td>
                            <td>{change.newQuantity || '-'}</td>
                            <td>
                              {change.productName}
                              {change.newQuantity === 0 && (
                                <span className="pin-icon" title="منتج مثبت - كمية 0">📌</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default NetProfit; 