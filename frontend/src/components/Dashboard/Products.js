import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductsTable from './ProductsTable';
import AddProduct from './AddProduct';
import Loader from '../Loader';
import Navbar from '../Navbar/Navbar';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const addProductRef = useRef(null);

  const fetchUserData = useCallback(async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  const fetchProducts = useCallback(async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserData(token);
    fetchProducts(token);
  }, [navigate, fetchUserData, fetchProducts]);

  const handleDelete = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProducts(products.filter(product => product._id !== productId));
      } else {
        console.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    if (addProductRef.current) {
      addProductRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAddProduct = (newProduct) => {
    if (editingProduct) {
      // Update existing product
      setProducts(products.map(product => 
        product._id === editingProduct._id ? newProduct : product
      ));
      setEditingProduct(null);
    } else {
      // Add new product
      setProducts([...products, newProduct]);
    }
    setShowAddForm(false);
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts(products.map(product => 
      product._id === editingProduct._id ? updatedProduct : product
    ));
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Search input handler for AddProduct
  const onSearchChange = (value) => {
    setSearchTerm(value);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="products-page">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="products-content">
        <div className="products-header">
          <h1>إدارة المنتجات</h1>
        </div>
        <div ref={addProductRef}></div>
        <AddProduct 
          onAdd={handleAddProduct}
          onUpdate={handleUpdateProduct}
          onCancel={handleCancelEdit}
          cancelEdit={handleCancelEdit}
          editingProduct={editingProduct}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
        <div className="products-container">
          <ProductsTable 
            products={products} 
            onDelete={handleDelete} 
            onEdit={handleEdit}
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Products; 