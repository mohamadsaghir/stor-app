import React from 'react';
import './Loader.css';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader">
        <div className="spinner"></div>
        <p>جاري تحميل البيانات...</p>
      </div>
    </div>
  );
};

export default Loader; 