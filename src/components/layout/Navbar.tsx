import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { db } from '@/services/mockDb';
import { 
  ShoppingBag, ShoppingCart, Heart, Bell, Sun, Moon, Search, 
  User as UserIcon, LogOut, ChevronDown, Store, Check, CheckCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RoleMenus from './RoleMenus';
import SearchBar from '@/components/common/SearchBar';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const { wishlist } = useWishlistStore();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const bellDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(db.getNotifications());
    
    // Close dropdowns on outside click
    const handleOutsideClick = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
      if (bellDropdownRef.current && !bellDropdownRef.current.contains(e.target as Node)) {
        setShowBellDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleLogout = () => {
    logout();
    toast('Logged out successfully', 'info');
    navigate('/login');
  };

  const markAllAsRead = () => {
    notifications.forEach(n => db.markNotificationRead(n.id));
    setNotifications(db.getNotifications());
    toast('All notifications marked as read', 'success');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const computeDisplayRole = () => {
    if (!user) return 'Customer';
    const raw = user.roles || [];
    const roles = raw.map((r: any) => (typeof r === 'string' ? r : r.role_name || r.role || r.name || String(r)));
    if (roles.includes('Admin')) return 'Admin';
    if (roles.includes('Seller')) return 'Seller';
    return roles[0] || 'Customer';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
            <ShoppingBag className="w-5.5 h-5.5" />
          </div>
          <span className="hidden sm:inline bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            Lumina
          </span>
        </Link>

        {/* SEARCH BAR */}
        <div className="flex-1">
          {/* use a dedicated SearchBar component with autocomplete */}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <SearchBar initial={searchQuery} />
        </div>

        {/* NAV UTILITIES */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* WISHLIST */}
          <Link
            to="/wishlist"
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 h-4 min-w-[16px] px-1 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* NOTIFICATIONS DROPDOWN */}
          <div className="relative" ref={bellDropdownRef}>
            <button
              onClick={() => {
                setShowBellDropdown(!showBellDropdown);
                setShowUserDropdown(false);
              }}
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 min-w-[16px] px-1 bg-amber-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showBellDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50 origin-top-right"
                >
                  <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">No notifications yet.</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${!n.is_read ? 'bg-primary-light/30 dark:bg-primary/5' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{n.title}</span>
                            {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1" />}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{n.content}</p>
                          <span className="text-[9px] text-slate-400 mt-2 block">{new Date(n.created_at).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CART */}
          <Link
            to="/cart"
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute top-0 right-0 h-4 min-w-[16px] px-1 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </Link>

          {/* USER MENU */}
          <div className="relative" ref={userDropdownRef}>
            {user ? (
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowBellDropdown(false);
                }}
                className="flex items-center gap-1 cursor-pointer focus:outline-none"
              >
                <div className="relative h-8 w-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100">
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                    alt={user.full_name}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Role badge */}
                <span className="ml-2 hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  {computeDisplayRole()}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:inline-flex py-2 px-3 text-xs font-semibold text-slate-700 hover:text-primary dark:text-slate-300 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="py-2 px-4 rounded-xl bg-primary text-white hover:bg-primary-dark text-xs font-bold shadow-md shadow-primary/10 transition-all active:scale-[0.98]"
                >
                  Register
                </Link>
              </div>
            )}

            <AnimatePresence>
              {showUserDropdown && user && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50 origin-top-right p-1.5"
                >
                  <div className="p-3 border-b border-slate-50 dark:border-slate-800 mb-1">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.full_name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                  </div>

                  <div className="px-2 py-2">
                    <RoleMenus user={user} onClose={() => setShowUserDropdown(false)} />
                  </div>

                  <hr className="border-slate-50 dark:border-slate-800 my-1" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </header>
  );
};
export default Navbar;
