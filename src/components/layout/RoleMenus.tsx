import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/types';
import { User as UserIcon, ShoppingCart, Store, Grid, Shield } from 'lucide-react';

const RoleMenus: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
  const roles = user.roles && user.roles.length > 0 ? user.roles : ['Customer'];
  const [active, setActive] = useState<string>(roles[0]);

  const renderCustomer = () => (
    <div className="space-y-1">
      <Link to="/profile" onClick={onClose} className="block px-3 py-2 text-xs text-slate-600 hover:text-primary rounded-xl"> <UserIcon className="inline-block w-4 h-4 mr-2"/> My Profile</Link>
      <Link to="/orders" onClick={onClose} className="block px-3 py-2 text-xs text-slate-600 hover:text-primary rounded-xl"> <ShoppingCart className="inline-block w-4 h-4 mr-2"/> My Orders</Link>
      <Link to="/wishlist" onClick={onClose} className="block px-3 py-2 text-xs text-slate-600 hover:text-primary rounded-xl"> <Grid className="inline-block w-4 h-4 mr-2"/> Wishlist</Link>
    </div>
  );

  const renderSeller = () => (
    <div className="space-y-1">
      <Link to="/store" onClick={onClose} className="block px-3 py-2 text-xs text-slate-600 hover:text-primary rounded-xl"> <Store className="inline-block w-4 h-4 mr-2"/> Seller Manager</Link>
      {/* Only show register link when user isn't already a Seller */}
      {!roles.includes('Seller') && (
        <Link to="/store/register" onClick={onClose} className="block px-3 py-2 text-xs text-slate-600 hover:text-primary rounded-xl"> <Store className="inline-block w-4 h-4 mr-2"/> Register Shop</Link>
      )}
    </div>
  );

  const renderAdmin = () => (
    <div className="space-y-1">
      <Link to="/admin" onClick={onClose} className="block px-3 py-2 text-xs text-slate-600 hover:text-primary rounded-xl"> <Shield className="inline-block w-4 h-4 mr-2"/> Admin Dashboard</Link>
      <Link to="/admin/users" onClick={onClose} className="block px-3 py-2 text-xs text-slate-600 hover:text-primary rounded-xl"> <UserIcon className="inline-block w-4 h-4 mr-2"/> Manage Users</Link>
      <Link to="/admin/products" onClick={onClose} className="block px-3 py-2 text-xs text-slate-600 hover:text-primary rounded-xl"> <Grid className="inline-block w-4 h-4 mr-2"/> Manage Products</Link>
    </div>
  );

  return (
    <div>
      {/* Role tabs */}
      <div className="flex gap-2 mb-2 px-2">
        {roles.map(r => (
          <button key={r} onClick={() => setActive(r)} className={`text-[11px] px-2 py-1 rounded-full font-semibold ${active === r ? 'bg-primary text-white' : 'bg-slate-50 text-slate-600 dark:bg-slate-800'}`}>
            {r}
          </button>
        ))}
      </div>

      <div className="px-1">
        {active === 'Admin' && renderAdmin()}
        {active === 'Seller' && renderSeller()}
        {active === 'Customer' && renderCustomer()}
        {/* Fallback: render customer menu if unknown role */}
        {!['Admin','Seller','Customer'].includes(active) && renderCustomer()}
      </div>
    </div>
  );
};

export default RoleMenus;
