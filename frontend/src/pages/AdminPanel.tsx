import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useStore } from '@/app/store';

const AdminPanel: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024); // Open by default on desktop
  const location = useLocation();
  const { user, logout, theme, toggleTheme } = useStore();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Inventory', href: '/admin/inventory', icon: BarChart3 },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Full-width Header */}
      <div className={`sticky top-0 z-30 border-b transition-colors duration-300 ${isDark ? 'bg-slate-900/95 border-slate-800 backdrop-blur-sm' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`lg:hidden transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            aria-label="Open sidebar menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 lg:flex items-center justify-between">
            <div className="hidden lg:block">
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {navigation.find(nav => nav.href === location.pathname)?.name || 'Dashboard'}
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Manage your store efficiently</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search..."
                  className={`hidden lg:block w-64 pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                />
                <Settings className={`hidden lg:block absolute left-3 top-2.5 h-5 w-5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              </div>
              <div className="flex items-center space-x-2">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                  aria-label="Toggle theme"
                  title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg lg:hidden">
                  <span className="text-sm font-bold text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content area with sidebar below header */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-all duration-300 ease-in-out flex flex-col border-r lg:relative lg:translate-x-0 ${isDark
            ? 'bg-slate-900 border-slate-800 text-slate-300'
            : 'bg-white border-gray-200 text-gray-600'
          }`}>
          {/* Sidebar Header (Logo) */}
          <div className={`flex items-center justify-center h-20 px-6 border-b flex-shrink-0 ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
              </div>
              <div>
                <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Neatify</h1>
                <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 px-4 flex-1">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden ${isActive
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30 transform scale-[1.02]'
                        : isDark
                          ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    onClick={() => {
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-600/20 animate-pulse"></div>
                    )}
                    <Icon className={`mr-4 h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110 text-white' : 'group-hover:scale-110'
                      }`} />
                    <span className="font-semibold">{item.name}</span>
                    {isActive && (
                      <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User info and logout */}
          <div className={`p-4 border-t ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className={`flex items-center mb-4 p-3 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700/30' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <span className="text-sm font-bold text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.username || 'Admin User'}</p>
                <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{user?.email || 'admin@neatify.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-4 py-3 text-sm rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md hover:transform hover:scale-[1.02] ${isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-red-600 hover:text-white'
                  : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-100'
                }`}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className={`flex-1 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
