import React from 'react';
import './Products.css';

const ProductsTable = ({ products, onDelete, onEdit, searchTerm, onSearchChange }) => {
  const handleDelete = (productId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      onDelete(productId);
    }
  };

  // فلترة المنتجات بناءً على مصطلح البحث
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!products || !products.length) {
    return (
      <div className="no-products">
        لا توجد منتجات لعرضها حالياً.
      </div>
    );
  }

  return (
    <div>
      {filteredProducts.length === 0 && searchTerm && (
        <div className="no-products" style={{ textAlign: 'center', padding: '20px', color: '#fff' }}>
          لا توجد منتجات تطابق البحث: "{searchTerm}"
        </div>
      )}
      <div className="products-list">
        {filteredProducts.map((product, idx) => {
          const netProfit = product.netProfit || 0;
          return (
            <div key={product._id || product.id} className="product-card">
              <div className="product-header">
                <h3 className="product-name">
                  {product.name}
                </h3>
              </div>
              <div className="product-details">
                <div className="product-detail">
                  <span className="product-detail-label">السعر:</span>
                  <span className="product-detail-value">{Number(product.price).toFixed(2)} $</span>
                </div>
                <div className="product-detail">
                  <span className="product-detail-label">الربح:</span>
                  <span className="product-detail-value">{Number(product.profit).toFixed(2)} $</span>
                </div>
                <div className="product-detail">
                  <span className="product-detail-label">الكمية:</span>
                  <span className="product-detail-value">{product.quantity}</span>
                </div>
                <div className="product-detail">
                  <span className="product-detail-label">صافي الربح:</span>
                  <span className="product-detail-value">{netProfit.toFixed(2)} $</span>
                </div>
                <div className="product-detail">
                  <span className="product-detail-label">المجموع:</span>
                  <span className="product-detail-value">{Number(product.total).toFixed(2)} $</span>
                </div>
              </div>
              <div className="product-actions">
                <button 
                  className="edit"
                  onClick={() => onEdit(product)}
                >
                  ✏️ تعديل
                </button>
                <button 
                  className="delete"
                  onClick={() => handleDelete(product._id || product.id)}
                >
                  🗑️ حذف
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsTable;
