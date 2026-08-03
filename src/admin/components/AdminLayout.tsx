import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Menu, X, LogOut, Home, Calendar, UtensilsCrossed, Settings, BarChart3, Clock } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  adminUser?: any;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onLogout, adminUser }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/admin/dashboard' },
    { id: 'reservations', label: 'Reservations', icon: Calendar, href: '/admin/reservations' },
    { id: 'tables', label: 'Tables', icon: UtensilsCrossed, href: '/admin/tables' },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed, href: '/admin/menu' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-charcoal text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gold/20">
          <div className="flex items-center gap-3">
            {isSidebarOpen && (
              <h2 className="text-xl font-bold text-gold">Sutra Admin</h2>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gold/10 transition-colors group"
            >
              <item.icon className="w-5 h-5 text-gold group-hover:text-gold/80" />
              {isSidebarOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </a>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-gold/20 p-4">
          {isSidebarOpen && (
            <div className="mb-4 p-3 bg-gold/10 rounded-lg">
              <p className="text-xs text-gold/60">Logged in as</p>
              <p className="text-sm font-semibold text-white truncate">
                {adminUser?.full_name || adminUser?.email || 'Admin'}
              </p>
            </div>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute right-0 top-20 -right-4 bg-gold text-charcoal rounded-full p-2 hover:bg-gold/90 transition-colors"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-charcoal">Sutra Lounge Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
