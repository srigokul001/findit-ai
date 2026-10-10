import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  PlusCircle,
  Bell,
  Sparkles,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Check,
  ChevronDown,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, login } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const notifRef = useRef(null);
  const userRef = useRef(null);
  const demoRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifDropdownOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropdownOpen(false);
      if (demoRef.current && !demoRef.current.contains(e.target)) setDemoMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications if logged in
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifs = async () => {
        try {
          const res = await notificationAPI.getNotifications();
          if (res.data.success) {
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unreadCount || 0);
          }
        } catch (e) {
          // ignore
        }
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 25000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      // ignore
    }
  };

  const handleQuickDemoLogin = async (email, password, roleLabel) => {
    try {
      await login(email, password);
      toast.success(`Logged in as ${roleLabel}!`);
      setDemoMenuOpen(false);
    } catch (err) {
      toast.error('Quick demo login failed');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-all shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-sky-400 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                  FindIt AI
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Campus
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide font-medium -mt-0.5">
                Smart Lost &amp; Found
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isActive('/') ? 'text-cyan-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </Link>
            <Link
              to="/browse"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isActive('/browse') ? 'text-cyan-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Browse Items
            </Link>
            <Link
              to="/matches"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isActive('/matches') ? 'text-cyan-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Smart Matches
            </Link>

            {/* Reporting Action Buttons */}
            <div className="h-4 w-px bg-slate-700 mx-1.5" />

            <Link
              to="/report/lost"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Report Lost
            </Link>

            <Link
              to="/report/found"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Report Found
            </Link>
          </nav>

          {/* Right Controls: Notifications, Demo Switcher, User Menu */}
          <div className="flex items-center gap-2">
            {/* Demo Quick Accounts Switcher */}
            <div className="relative" ref={demoRef}>
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-750 border border-slate-700 transition"
                title="Switch demo accounts quickly"
              >
                <span>Demo Accounts</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 text-xs z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700/60 mb-1">
                    Instant Demo Login
                  </div>
                  <button
                    onClick={() => handleQuickDemoLogin('admin@campus.edu', 'admin123', 'Campus Admin (Staff)')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-700 text-slate-200 flex items-center justify-between transition"
                  >
                    <div>
                      <span className="font-semibold block text-cyan-400">Campus Admin</span>
                      <span className="text-[10px] text-slate-400">admin@campus.edu</span>
                    </div>
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                  <button
                    onClick={() => handleQuickDemoLogin('alex@campus.edu', 'student123', 'Alex Johnson (Student)')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-700 text-slate-200 flex items-center justify-between transition"
                  >
                    <div>
                      <span className="font-semibold block text-slate-100">Alex Johnson</span>
                      <span className="text-[10px] text-slate-400">Lost iPhone 14 &amp; Wallet</span>
                    </div>
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleQuickDemoLogin('sarah@campus.edu', 'student123', 'Sarah Miller (Student)')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-700 text-slate-200 flex items-center justify-between transition"
                  >
                    <div>
                      <span className="font-semibold block text-slate-100">Sarah Miller</span>
                      <span className="text-[10px] text-slate-400">Found iPhone 14</span>
                    </div>
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-900 text-[10px] font-extrabold flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-xs text-white">Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 transition"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            className={`p-3 text-xs transition ${
                              notif.read ? 'bg-slate-900 text-slate-400' : 'bg-slate-800/40 text-slate-200'
                            }`}
                          >
                            <div className="font-semibold text-white mb-0.5">{notif.title}</div>
                            <p className="text-[11px] leading-relaxed text-slate-300 mb-1.5">{notif.message}</p>
                            {notif.link && (
                              <Link
                                to={notif.link}
                                onClick={() => setNotifDropdownOpen(false)}
                                className="inline-block text-[11px] font-medium text-cyan-400 hover:underline"
                              >
                                View Details &rarr;
                              </Link>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Authenticated User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold text-xs flex items-center justify-center">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-semibold block text-slate-200 leading-tight">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-cyan-400 capitalize font-medium">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 text-xs z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-800 mb-1">
                      <p className="font-bold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <Layers className="w-4 h-4 text-cyan-400" />
                      Student Dashboard
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-amber-300 hover:text-amber-200 hover:bg-slate-800 transition"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        Admin Panel
                      </Link>
                    )}

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        toast.info('Logged out safely');
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Browse Items
          </Link>
          <Link
            to="/matches"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-cyan-400 hover:bg-slate-800"
          >
            Smart Matches
          </Link>
          <Link
            to="/report/lost"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-rose-300 bg-rose-500/10"
          >
            Report Lost Item
          </Link>
          <Link
            to="/report/found"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-cyan-300 bg-cyan-500/10"
          >
            Report Found Item
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-amber-400 hover:bg-slate-800"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
