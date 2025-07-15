import { Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import ChangePassword from './components/Auth/ChangePassword';
import Dashboard from './components/Dashboard/Dashboard';
import Products from './components/Dashboard/Products';
import DebtManager from './components/Dashboard/DebtManager';
import AdminUserManagement from './components/Dashboard/AdminUserManagement';
import SimpleAdminLogin from './components/Auth/SimpleAdminLogin';
import NetProfit from './components/Dashboard/NetProfit';
import CashOut from './components/Dashboard/CashOut';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/simple-admin-login" element={<SimpleAdminLogin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/DebtManager" element={<DebtManager />} />
        <Route path="/debt-manager" element={<DebtManager />} />
        <Route path="/AdminUserManagement" element={<AdminUserManagement />} />
        <Route path="/net-profit" element={<NetProfit />} />
        <Route path="/cash-out" element={<CashOut />} />
      </Routes>
    </div>
  );
}

export default App;
