import React, { useState, useEffect } from 'react';
import { AdminLayout } from './components/AdminLayout';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminReservations } from './pages/AdminReservations';
import { AdminTables } from './pages/AdminTables';
import { AdminMenu } from './pages/AdminMenu';
import { AdminSettings } from './pages/AdminSettings';
import { AdminAnalytics } from './pages/AdminAnalytics';

type AdminPage = 'login' | 'dashboard' | 'reservations' | 'tables' | 'menu' | 'settings' | 'analytics';

export const AdminRouter: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AdminPage>('login');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = sessionStorage.getItem('adminUser');
    const storedToken = sessionStorage.getItem('adminToken');

    if (storedUser && storedToken) {
      setAdminUser(JSON.parse(storedUser));
      setAdminToken(storedToken);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLoginSuccess = (user: any, token: string) => {
    setAdminUser(user);
    setAdminToken(token);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminToken');
    setAdminUser(null);
    setAdminToken(null);
    setCurrentPage('login');
  };

  const handleNavigation = (page: AdminPage) => {
    setCurrentPage(page);
  };

  if (currentPage === 'login' || !adminUser) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AdminLayout onLogout={handleLogout} adminUser={adminUser}>
      {currentPage === 'dashboard' && <AdminDashboard />}
      {currentPage === 'reservations' && <AdminReservations />}
      {currentPage === 'tables' && <AdminTables />}
      {currentPage === 'menu' && <AdminMenu />}
      {currentPage === 'settings' && <AdminSettings />}
      {currentPage === 'analytics' && <AdminAnalytics />}

      {/* Navigation Script - Updates page based on URL hash */}
      {typeof window !== 'undefined' && (
        <script>
          {`
            const currentHash = window.location.hash;
            if (currentHash.includes('admin')) {
              const page = currentHash.split('/')[2] || 'dashboard';
              window.dispatchEvent(new CustomEvent('adminPageChange', { detail: page }));
            }
          `}
        </script>
      )}
    </AdminLayout>
  );
};
