import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ErrorBoundary from '../common/ErrorBoundary';

export const AppLayout: React.FC = () => {
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
