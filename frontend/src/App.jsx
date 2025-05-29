import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './services/api';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import CarPage from './pages/CarPage';
import PackagePage from './pages/PackagePage';
import ServicePackagePage from './pages/ServicePackagePage';
import PaymentPage from './pages/PaymentPage';
import ReportPage from './pages/ReportPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking authentication status...');
      const response = await authAPI.checkAuth();
      console.log('Auth response:', response);
      if (response.isAuthenticated) {
        setUser(response.user);
        console.log('User authenticated:', response.user);
      } else {
        console.log('User not authenticated');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.success) {
        setUser(response.user);
        setError('');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-black">
        {user ? (
          <>
            <Navbar user={user} onLogout={handleLogout} />
            <main>
              <Routes>
                <Route path="/" element={<Navigate to="/cars" replace />} />
                <Route path="/cars" element={<CarPage />} />
                <Route path="/packages" element={<PackagePage />} />
                <Route path="/service-packages" element={<ServicePackagePage />} />
                <Route path="/payments" element={<PaymentPage />} />
                <Route path="/reports" element={<ReportPage />} />
                <Route path="/login" element={<Navigate to="/cars" replace />} />
                <Route path="*" element={<Navigate to="/cars" replace />} />
              </Routes>
            </main>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
