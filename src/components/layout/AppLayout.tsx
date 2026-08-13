import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ErrorBoundary from '../common/ErrorBoundary';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';

export const AppLayout: React.FC = () => {
  const { user } = useAuthStore();
  const { loadWishlist, clearWishlist } = useWishlistStore();

  useEffect(() => {
    if (user) {
      void loadWishlist(user.user_id);
    } else {
      clearWishlist();
    }
  }, [user, loadWishlist, clearWishlist]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
        
        {/* Navigation */}
        <Navbar />
        
        {/* Main Body */}
        <main className="flex-grow">
          <Outlet />
        </main>
        
        {/* Footer */}
        <Footer />
        
      </div>
    </ErrorBoundary>
  );
};
export default AppLayout;
