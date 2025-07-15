import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../Navbar/Navbar';
import Loader from '../Loader';
import { useNavigate } from 'react-router-dom';

const cashOutStyles = `
.cashout-content {
  padding: 40px 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 80vh;
  background: var(--bg-primary, #181824);
}
.cashout-card-main {
  background: var(--bg-card, #232336);
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(60,60,90,0.18);
  padding: 36px 30px 28px 30px;
  max-width: 440px;
  width: 100%;
  margin: 0 auto;
  border: 1.5px solid var(--border-color, #2d2d3a);
  position: relative;
  z-index: 10;
  direction: rtl;
  transition: box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cashout-card-main:hover {
  box-shadow: 0 12px 40px 0 rgba(139,92,246,0.13);
}
.cashout-title {
  text-align: center;
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--primary-color, #8b5cf6);
  margin-bottom: 28px;
  letter-spacing: 1px;
}
.search-input {
  width: 90%;
  max-width: 350px;
  margin-left: auto;
  margin-right: auto;
  padding: 14px 15px;
  border: 1.5px solid var(--border-input, #3a3a4d);
  border-radius: 11px;
  font-size: 1.09rem;
  margin-bottom: 12px;
  background: var(--bg-input, #232336);
  color: var(--text-primary, #e0e0e0);
  transition: border 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 4px rgba(139,92,246,0.04);
}
.search-input:focus {
  border-color: var(--primary-color, #8b5cf6);
  outline: none;
  box-shadow: 0 0 0 2px #8b5cf655;
}
.cashout-search-dropdown {
  background: var(--bg-input, #232336);
  border: 1.5px solid var(--border-input, #3a3a4d);
  border-radius: 12px;
  margin-bottom: 14px;
  box-shadow: 0 2px 12px rgba(139,92,246,0.08);
  max-height: 180px;
  overflow-y: auto;
}
.cashout-search-item {
  padding: 13px 20px;
  cursor: pointer;
  color: var(--text-primary, #e0e0e0);
  transition: background 0.18s, color 0.18s;
  font-size: 1.09rem;
  border-radius: 8px;
}
.cashout-search-item:hover {
  background: var(--primary-color, #8b5cf6);
  color: #fff;
}
.cashout-bill-list {
  margin-bottom: 20px;
  margin-top: 12px;
}
.cashout-bill-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 7px;
  margin-bottom: 10px;
}
.cashout-bill-table th, .cashout-bill-table td {
  text-align: center;
  padding: 9px 4px;
  font-size: 1.04rem;
}
.cashout-bill-table th {
  color: var(--primary-color, #8b5cf6);
  font-weight: 800;
  background: var(--bg-primary, #181824);
  border-bottom: 2px solid var(--border-color, #2d2d3a);
  letter-spacing: 1px;
}
.cashout-bill-table td {
  background: var(--bg-input, #232336);
  border-radius: 8px;
  color: var(--text-primary, #e0e0e0);
  box-shadow: 0 1px 4px rgba(139,92,246,0.04);
}
.cashout-bill-qty {
  width: 52px;
  border-radius: 8px;
  border: 1.5px solid var(--border-input, #3a3a4d);
  padding: 5px 7px;
  background: var(--bg-input, #232336);
  color: var(--text-primary, #e0e0e0);
  text-align: center;
  font-size: 1.04rem;
  transition: border 0.2s, box-shadow 0.2s;
}
.cashout-bill-qty:focus {
  border-color: var(--primary-color, #8b5cf6);
  outline: none;
  box-shadow: 0 0 0 2px #8b5cf655;
}
.cashout-bill-remove {
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 5px 14px;
  font-size: 1.01rem;
  cursor: pointer;
  transition: background 0.18s;
  font-weight: 600;
}
.cashout-bill-remove:hover {
  background: #b71c1c;
}
.cashout-total {
  margin-bottom: 18px;
  font-size: 1.18rem;
  color: var(--primary-color, #8b5cf6);
  font-weight: 800;
  text-align: center;
  letter-spacing: 1px;
}
.cashout-total > div {
  font-size: 1.05rem;
  color: #25D366;
  margin-top: 4px;
  font-weight: 700;
}
.cashout-wa-btn {
  margin-left: auto;
  margin-right: auto;
  display: block;
  width: 100%;
  background: #25D366;
  color: #fff;
  text-align: center;
  padding: 15px 0;
  border-radius: 12px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.15rem;
  margin-top: 12px;
  margin-bottom: 0;
  box-shadow: 0 2px 8px rgba(37,211,102,0.10);
  transition: background 0.18s, box-shadow 0.18s;
  letter-spacing: 1px;
  border: none;
}
.cashout-wa-btn:hover {
  background: #128C7E;
  box-shadow: 0 4px 16px rgba(37,211,102,0.18);
}
.cashout-empty {
  color: #888;
  font-size: 1.01rem;
  margin: 8px 0 0 0;
  text-align: center;
}
@media (max-width: 600px) {
  .cashout-card-main {
    padding: 14px 2px 10px 2px;
    max-width: 99vw;
  }
  .cashout-title {
    font-size: 1.1rem;
  }
}
`;

export default function CashOut() {
  const [search, setSearch] = useState('');
  const [billProducts, setBillProducts] = useState([]);
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [debtProcessing, setDebtProcessing] = useState(false);
  const [debtMsg, setDebtMsg] = useState('');
  const navigate = useNavigate();
  const printRef = useRef();

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch('http://localhost:5000/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Add product to bill
  const addProduct = (product) => {
    const exists = billProducts.find(p => p._id === product._id);
    const availableQty = product.quantity;
    if (exists) {
      if (exists.qty + 1 > availableQty) {
        setErrorMsg(`لا يمكن إضافة أكثر من الكمية المتوفرة (${availableQty}) للمنتج: ${product.name}`);
        return;
      }
      setBillProducts(billProducts.map(p => p._id === product._id ? { ...p, qty: p.qty + 1 } : p));
    } else {
      if (availableQty < 1) {
        setErrorMsg(`المنتج ${product.name} غير متوفر في المخزن.`);
        return;
      }
      setBillProducts([...billProducts, { ...product, qty: 1 }]);
    }
    setErrorMsg('');
    setSearch('');
  };

  // Calculate total (sum of displayed prices)
  const total = billProducts.reduce((sum, p) => sum + ((p.total || 0) * p.qty), 0);

  // Format date
  const today = new Date();
  const formattedDate = today.toLocaleDateString();
  // WhatsApp message (DebtManager style)
  const waMessage = `فاتورة دين:\nالاسم: ${customer}\nرقم الهاتف: ${phone}\nالتاريخ: ${formattedDate}\nالمبلغ: ${total}\n${billProducts.length ? `المنتجات:\n${billProducts.map(p => `- ${p.name} × ${p.qty} : ${(p.total * p.qty).toFixed(2)}$`).join('\n')}` : ''}\n\nيرجى تسديد المبلغ في أقرب وقت ممكن. شكراً لك!`;
  const waLink = `https://wa.me/${phone ? `+961${phone}` : ''}?text=${encodeURIComponent(waMessage)}`;

  // Decrement quantities after sending
  const handleSend = async (e) => {
    if (processing) return;
    setProcessing(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/products/decrement-quantity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          products: billProducts.map(p => ({ productId: p._id, qty: p.qty }))
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('تم تحديث الكميات بنجاح');
        setBillProducts([]);
        window.location.reload();
      } else {
        setErrorMsg(data.message || 'حدث خطأ أثناء تحديث الكميات');
      }
    } catch (err) {
      setErrorMsg('حدث خطأ في الاتصال بالخادم');
    } finally {
      setProcessing(false);
    }
  };

  // Add to debts
  const handleAddDebt = async () => {
    if (debtProcessing) return;
    setDebtProcessing(true);
    setDebtMsg('');
    // Compose note with product details (DebtManager style)
    const note = billProducts.length
      ? `المنتجات:\n${billProducts.map(p => `- ${p.name} × ${p.qty} : ${(p.total * p.qty).toFixed(2)}$`).join('\n')}`
      : '';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/debts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: customer,
          phone: phone,
          amount: total,
          date: today.toISOString(),
          note
        })
      });
      const data = await res.json();
      if (res.ok) {
        setDebtMsg('تمت إضافة الدين بنجاح');
        setTimeout(() => navigate('/debt-manager'), 700);
      } else {
        setDebtMsg(data.message || 'حدث خطأ أثناء إضافة الدين');
      }
    } catch (err) {
      setDebtMsg('حدث خطأ في الاتصال بالخادم');
    } finally {
      setDebtProcessing(false);
    }
  };

  // دالة الطباعة الحرارية
  const handleThermalPrint = () => {
    // نص الفاتورة بشكل مبسط للطابعة الحرارية
    let receipt = '';
    receipt += '--- إيصال صرف نقدي ---\n';
    receipt += `التاريخ: ${formattedDate}\n`;
    receipt += `اسم الزبون: ${customer}\n`;
    receipt += `رقم الهاتف: ${phone}\n`;
    receipt += '--------------------------\n';
    billProducts.forEach(p => {
      receipt += `${p.name}\n`;
      receipt += `  الكمية: ${p.qty}  السعر: ${(p.total * p.qty).toFixed(2)}$\n`;
    });
    receipt += '--------------------------\n';
    receipt += `المجموع الكلي: ${total.toFixed(2)} $\n`;
    receipt += '--------------------------\n';
    receipt += 'شكرًا لتعاملكم معنا!';

    const win = window.open('', '', 'width=350,height=600');
    win.document.write(`
      <html>
        <head>
          <title>إيصال حراري</title>
          <style>
            body { font-family: monospace, Tahoma, Arial; direction: rtl; text-align: right; font-size: 14px; width: 260px; margin: 0 auto; }
            pre { white-space: pre-wrap; word-break: break-all; }
          </style>
        </head>
        <body>
          <pre>${receipt}</pre>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  if (loading) return (<><Navbar /><Loader /></>);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cashOutStyles }} />
      <Navbar />
      <div className="cashout-content">
        <div className="cashout-card-main">
          <h2 className="cashout-title">صرف نقدي</h2>
          <input
            type="text"
            className="search-input"
            placeholder="ابحث عن المنتج"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <div className="cashout-search-dropdown">
              {filteredProducts.length ? filteredProducts.map(p => (
                <div key={p._id} className="cashout-search-item" onClick={() => addProduct(p)}>
                  {p.name}
                </div>
              )) : <div className="cashout-search-item">لا يوجد منتجات</div>}
            </div>
          )}
          {/* جدول قابل للتعديل داخل الصفحة */}
          <div className="cashout-bill-list">
            <strong>المنتجات المضافة:</strong>
            {billProducts.length === 0 && <div className="cashout-empty">لم يتم إضافة منتجات</div>}
            {billProducts.length > 0 && (
              <table className="cashout-bill-table">
                <thead>
                  <tr>
                    <th>المنتج</th>
                    <th>الكمية</th>
                    <th>السعر</th>
                    <th>حذف</th>
                  </tr>
                </thead>
                <tbody>
                  {billProducts.map(p => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          max={(() => {
                            const prod = products.find(pr => pr._id === p._id);
                            return prod ? prod.quantity : 9999;
                          })()}
                          value={p.qty}
                          onChange={e => {
                            const qty = parseInt(e.target.value) || 1;
                            const prod = products.find(pr => pr._id === p._id);
                            const availableQty = prod ? prod.quantity : 9999;
                            if (qty > availableQty) {
                              setErrorMsg(`لا يمكن تحديد كمية أكبر من المتوفر (${availableQty}) للمنتج: ${p.name}`);
                              return;
                            }
                            setBillProducts(billProducts.map(prod => prod._id === p._id ? { ...prod, qty } : prod));
                            setErrorMsg('');
                          }}
                          className="cashout-bill-qty"
                        />
                      </td>
                      <td>{(p.total * p.qty).toFixed(2)} $</td>
                      <td>
                        <button
                          onClick={() => setBillProducts(billProducts.filter(prod => prod._id !== p._id))}
                          className="cashout-bill-remove"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* جدول مبسط للطباعة فقط */}
          <div ref={printRef} style={{ display: 'none' }}>
            <div className="cashout-bill-list">
              <strong>المنتجات المضافة:</strong>
              {billProducts.length > 0 && (
                <table className="cashout-bill-table">
                  <thead>
                    <tr>
                      <th>المنتج</th>
                      <th>الكمية</th>
                      <th>السعر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billProducts.map(p => (
                      <tr key={p._id}>
                        <td>{p.name}</td>
                        <td>{p.qty}</td>
                        <td>{(p.total * p.qty).toFixed(2)} $</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="cashout-total">
              <strong>المجموع الكلي: {total.toFixed(2)} $</strong>
            </div>
            <div style={{margin: '10px 0'}}>
              <div>اسم الزبون: {customer}</div>
              <div>رقم الهاتف: {phone}</div>
              <div>التاريخ: {formattedDate}</div>
            </div>
          </div>
          {billProducts.length > 0 && (
            <button className="cashout-wa-btn" style={{ background: '#222', marginBottom: 10 }} onClick={handleThermalPrint}>
              🖨️ طباعة على طابعة حرارية
            </button>
          )}
          <input
            type="text"
            className="search-input"
            placeholder="اسم الزبون"
            value={customer}
            onChange={e => setCustomer(e.target.value)}
          />
          <input
            type="tel"
            className="search-input"
            placeholder="رقم الزبون (بدون +961)"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={8}
            style={{ direction: 'ltr', textAlign: 'left', marginBottom: 10 }}
          />
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="cashout-wa-btn"
            onClick={handleSend}
            style={{ pointerEvents: (processing || (errorMsg && errorMsg.includes('Insufficient quantity'))) ? 'none' : 'auto', opacity: (processing || (errorMsg && errorMsg.includes('Insufficient quantity'))) ? 0.7 : 1 }}
          >
            {processing
              ? '... جارٍ الإرسال'
              : (errorMsg && errorMsg.includes('Insufficient quantity')
                ? 'الكمية غير كافية للمنتج: ' + errorMsg.replace('Insufficient quantity for product: ', '')
                : 'إرسال عبر واتساب')}
          </a>
          <button
            className="cashout-wa-btn"
            style={{ background: '#8b5cf6', marginTop: 10, marginBottom: 0, opacity: debtProcessing ? 0.7 : 1, cursor: debtProcessing ? 'not-allowed' : 'pointer' }}
            onClick={handleAddDebt}
            disabled={debtProcessing}
          >
            {debtProcessing ? '... جارٍ الإضافة' : 'أضف إلى الديون'}
          </button>
          {debtMsg && <div style={{ color: debtMsg.includes('نجاح') ? '#25D366' : '#e53935', textAlign: 'center', marginTop: 8 }}>{debtMsg}</div>}
          {successMsg && <div style={{ color: '#25D366', textAlign: 'center', marginTop: 8 }}>{successMsg}</div>}
          {errorMsg && (
            <div style={{ color: '#e53935', textAlign: 'center', marginTop: 8 }}>
              {errorMsg.startsWith('Insufficient quantity for product: ')
                ? `الكمية غير كافية للمنتج: ${errorMsg.replace('Insufficient quantity for product: ', '')}`
                : errorMsg}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 