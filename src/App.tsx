import React, { useEffect, Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { useAuthStore } from '@/store/authStore';
import AppLayout from '@/components/layout/AppLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Lazy-loaded pages for code-splitting
const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })));
const ProductListing = lazy(() => import('@/pages/ProductListing').then(m => ({ default: m.ProductListing })));
const ProductDetail = lazy(() => import('@/pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Cart = lazy(() => import('@/pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import('@/pages/Checkout').then(m => ({ default: m.Checkout })));
const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })));
const Orders = lazy(() => import('@/pages/Orders').then(m => ({ default: m.Orders })));
const RegisterShop = lazy(() => import('@/pages/store/RegisterShop').then(m => ({ default: m.RegisterShop })));
const SellerDashboard = lazy(() => import('@/pages/store/SellerDashboard').then(m => ({ default: m.SellerDashboard })));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ManageUsers = lazy(() => import('@/pages/admin/ManageUsers').then(m => ({ default: m.default })));
const ManageProducts = lazy(() => import('@/pages/admin/ManageProducts').then(m => ({ default: m.default })));
const ManageOrdersAdmin = lazy(() => import('@/pages/admin/ManageOrders').then(m => ({ default: m.ManageOrders })));
const ManageReturnsAdmin = lazy(() => import('@/pages/admin/ManageReturns').then(m => ({ default: m.ManageReturns })));
const ManageShopsAdmin = lazy(() => import('@/pages/admin/ManageShops').then(m => ({ default: m.default })));
const ImportMockData = lazy(() => import('@/pages/admin/ImportMockData').then(m => ({ default: m.default })));
const Login = lazy(() => import('@/pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('@/pages/auth/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const Search = lazy(() => import('@/pages/Search').then(m => ({ default: m.Search })));
const Shop = lazy(() => import('@/pages/Shop').then(m => ({ default: m.Shop })));
const Promotions = lazy(() => import('@/pages/Promotions').then(m => ({ default: m.Promotions })));
const Chat = lazy(() => import('@/pages/Chat').then(m => ({ default: m.Chat })));
const Notifications = lazy(() => import('@/pages/Notifications').then(m => ({ default: m.Notifications })));
const ProductReviews = lazy(() => import('@/pages/ProductReviews').then(m => ({ default: m.ProductReviews })));
const Wishlist = lazy(() => import('@/pages/Wishlist').then(m => ({ default: m.Wishlist })));
const OrderDetail = lazy(() => import('@/pages/OrderDetail').then(m => ({ default: m.OrderDetail })));
const CheckoutSuccess = lazy(() => import('@/pages/CheckoutSuccess').then(m => ({ default: m.CheckoutSuccess })));
const SellerProductEditor = lazy(() => import('@/pages/store/ProductEditor').then(m => ({ default: m.ProductEditor })));
const SellerOrdersPage = lazy(() => import('@/pages/store/Orders').then(m => ({ default: m.Orders })));
const Vouchers = lazy(() => import('@/pages/store/Vouchers').then(m => ({ default: m.default })));
const SellerAnalytics = lazy(() => import('@/pages/store/Analytics').then(m => ({ default: m.default })));
const AdminReports = lazy(() => import('@/pages/admin/Reports').then(m => ({ default: m.Reports })));
const MyVouchers = lazy(() => import('@/pages/MyVouchers').then(m => ({ default: m.MyVouchers })));
const FlashSale = lazy(() => import('@/pages/FlashSale').then(m => ({ default: m.FlashSale })));
const HelpCenter = lazy(() => import('@/pages/HelpCenter').then(m => ({ default: m.HelpCenter })));
const Messages = lazy(() => import('@/pages/Messages').then(m => ({ default: m.Messages })));

const queryClient = new QueryClient();

// Guard for protected buyer routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Guard for seller routes
const SellerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!user.roles.includes('Seller')) {
    return <Navigate to="/store/register" replace />;
  }
  return <>{children}</>;
};

// Guard for admin routes
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!user.roles.includes('Admin')) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><Home /></Suspense> },
      { path: 'products', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><ProductListing /></Suspense> },
      { path: 'category/:categoryId', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><ProductListing /></Suspense> },
      { path: 'search', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><Search /></Suspense> },
      { path: 'product/:slug', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><ProductDetail /></Suspense> },
      { path: 'product/:slug/reviews', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><ProductReviews /></Suspense> },
      { path: 'cart', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><Cart /></Suspense> },
      { path: 'wishlist', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><Wishlist /></Suspense> },
      { 
        path: 'checkout', 
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><Checkout /></Suspense>
          </ProtectedRoute>
        ) 
      },
      { path: 'checkout/success', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><CheckoutSuccess /></Suspense> },
      { 
        path: 'profile', 
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><Profile /></Suspense>
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'orders', 
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><Orders /></Suspense>
          </ProtectedRoute>
        ) 
      },
      {
        path: 'orders/:orderId',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><OrderDetail /></Suspense>
          </ProtectedRoute>
        )
      },
      { 
        path: 'store/register', 
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><RegisterShop /></Suspense>
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'store', 
        element: (
          <SellerRoute>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><SellerDashboard /></Suspense>
          </SellerRoute>
        ) 
      },
      { path: 'store/vouchers', element: (
        <SellerRoute>
          <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><Vouchers /></Suspense>
        </SellerRoute>
      ) },
      { path: 'store/analytics', element: (
        <SellerRoute>
          <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><SellerAnalytics /></Suspense>
        </SellerRoute>
      ) },
      { path: 'store/product/new', element: (
        <SellerRoute>
          <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><SellerProductEditor /></Suspense>
        </SellerRoute>
      ) },
      { path: 'store/product/:productId/edit', element: (
        <SellerRoute>
          <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><SellerProductEditor /></Suspense>
        </SellerRoute>
      ) },
      { path: 'store/orders', element: (
        <SellerRoute>
          <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><SellerOrdersPage /></Suspense>
        </SellerRoute>
      ) },
      { path: 'shop/:shopId', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><Shop /></Suspense> },
      { path: 'promotions', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><Promotions /></Suspense> },
      { path: 'flash-sale', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><FlashSale /></Suspense> },
      { path: 'chat', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><Chat /></Suspense> },
      { path: 'notifications', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><Notifications /></Suspense> },
      { path: 'messages', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><Messages /></Suspense> },

      { path: 'help', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><HelpCenter /></Suspense> },
      { path: 'vouchers', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><MyVouchers /></Suspense> },
      { 
        path: 'admin', 
        element: (
          <AdminRoute>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><AdminDashboard /></Suspense>
          </AdminRoute>
        ) 
      },
      {
        path: 'admin/import-mock',
        element: (
          <AdminRoute>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><ImportMockData /></Suspense>
          </AdminRoute>
        )
      },
      {
        path: 'admin/users',
        element: (
          <AdminRoute>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><ManageUsers /></Suspense>
          </AdminRoute>
        )
      },
      {
        path: 'admin/products',
        element: (
          <AdminRoute>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><ManageProducts /></Suspense>
          </AdminRoute>
        )
      }
      ,{
        path: 'admin/orders',
        element: (
          <AdminRoute>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><ManageOrdersAdmin /></Suspense>
          </AdminRoute>
        )
      }
        ,{
          path: 'admin/shops',
          element: (
            <AdminRoute>
              <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><ManageShopsAdmin /></Suspense>
            </AdminRoute>
          )
        }
      ,{
        path: 'admin/returns',
        element: (
          <AdminRoute>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><ManageReturnsAdmin /></Suspense>
          </AdminRoute>
        )
      }
    ]
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><Register /></Suspense> },
  { path: '/forgot-password', element: <Suspense fallback={<div className="p-8 text-center">Loading...</div>}><ForgotPassword /></Suspense> },
  { path: '*', element: <Navigate to="/" replace /> }
]);

export const App: React.FC = () => {
  const initializeAuth = useAuthStore(state => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
