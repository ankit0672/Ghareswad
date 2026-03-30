import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import CustomerPage from './pages/CustomerPage';
import ChefPage from './pages/ChefPage';
import OrdersPage from './pages/OrdersPage';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading Ghareswad...</p></div>;
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'chef' ? '/chef' : '/customer'} replace />;
  return children;
};

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading GhorerSwad...</p>
      </div>
    );
  }

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={user ? <Navigate to={user.role === 'chef' ? '/chef' : '/customer'} replace /> : <LoginPage />} />
        <Route path="/customer" element={<ProtectedRoute role="customer"><CustomerPage /></ProtectedRoute>} />
        <Route path="/customer/orders" element={<ProtectedRoute role="customer"><OrdersPage /></ProtectedRoute>} />
        <Route path="/chef" element={<ProtectedRoute role="chef"><ChefPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
