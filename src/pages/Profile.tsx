import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/context/ToastContext';
import { 
  User as UserIcon, MapPin, Phone, Mail, Calendar, Eye, 
  Trash2, Edit3, Plus, Check, Save, Sparkles, Loader2, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Profile: React.FC = () => {
  const { 
    user, addresses, updateProfile, loadAddresses, 
    addAddress, updateAddress, deleteAddress, setDefaultAddress 
  } = useAuthStore();
  
  const { toast } = useToast();

  // Profile fields state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [birthday, setBirthday] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address modal/form states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [receiverName, setReceiverName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setGender(user.gender || 'MALE');
      setBirthday(user.birthday || '');
      setAvatar(user.avatar || '');
      loadAddresses();
    }
  }, [user]);

  if (!user) return null;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    
    setTimeout(() => {
      updateProfile({
        full_name: fullName,
        phone: phone,
        gender: gender,
        birthday: birthday,
        avatar: avatar
      });
      toast('Profile updated successfully!', 'success');
      setIsSavingProfile(false);
    }, 800);
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setReceiverName('');
    setAddressPhone('');
    setProvince('');
    setDistrict('');
    setWard('');
    setDetailAddress('');
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr: any) => {
    setEditingAddressId(addr.address_id);
    setReceiverName(addr.receiver_name);
    setAddressPhone(addr.phone);
    setProvince(addr.province);
    setDistrict(addr.district);
    setWard(addr.ward);
    setDetailAddress(addr.detail_address);
    setShowAddressModal(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName || !addressPhone || !province || !district || !ward || !detailAddress) {
      toast('Please fill all fields', 'warning' as any);
      return;
    }

    const addrData = {
      receiver_name: receiverName,
      phone: addressPhone,
      province,
      district,
      ward,
      detail_address: detailAddress,
      is_default: editingAddressId ? false : (addresses.length === 0)
    };

    if (editingAddressId) {
      updateAddress(editingAddressId, addrData);
      toast('Address updated successfully!', 'success');
    } else {
      addAddress(addrData);
      toast('New address added successfully!', 'success');
    }

    setShowAddressModal(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteAddress(id);
      toast('Address deleted', 'info');
    }
  };

  const handleSetDefaultAddress = (id: string) => {
    setDefaultAddress(id);
    toast('Default address updated', 'success');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white mb-8 flex items-center gap-2">
        <UserIcon className="w-6 h-6 text-primary" /> My Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: Profile info */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          
          {/* Avatar and Welcome */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-slate-50 dark:border-slate-800 mb-6">
            <div className="relative group h-24 w-24 rounded-full overflow-hidden border-2 border-primary bg-slate-100 dark:bg-slate-950 mb-3 shadow-inner">
              <img 
                src={avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Lumina'} 
                alt={fullName} 
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{user.full_name}</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">{user.email}</span>
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {user.roles.map(r => (
                <span 
                  key={r} 
                  className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                    r === 'Admin' ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-950/20' :
                    r === 'Seller' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                    'bg-slate-100 text-slate-500 dark:bg-slate-800'
                  }`}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Profile form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Avatar URL</label>
              <div className="relative">
                <Eye className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  placeholder="Link to avatar image..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Birthday</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-white hover:bg-primary-dark font-extrabold text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </>
              )}
            </button>
          </form>

        </div>

        {/* RIGHT COLUMN: Addresses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-50 dark:border-slate-800">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-primary" /> Delivery Addresses
              </h2>
              <button 
                onClick={handleOpenAddAddress}
                className="inline-flex py-2 px-4 rounded-xl bg-primary text-white text-xs font-bold shadow-md cursor-pointer hover:bg-primary-dark transition-colors active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-xs text-slate-400 dark:text-slate-500">You haven't added any shipping addresses yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map(addr => (
                  <div 
                    key={addr.address_id}
                    className={`p-5 rounded-2xl border transition-all relative flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                      addr.is_default 
                        ? 'border-primary bg-primary-light/10 dark:bg-primary/5' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/20'
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">{addr.receiver_name}</span>
                        <span className="text-xs text-slate-400">|</span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{addr.phone}</span>
                        {addr.is_default && (
                          <span className="px-2 py-0.5 rounded-md bg-primary-light text-[9px] font-bold text-primary dark:bg-primary/10">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {addr.detail_address}, {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      {!addr.is_default && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.address_id)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEditAddress(addr)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        aria-label="Edit Address"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {!addr.is_default && (
                        <button
                          onClick={() => handleDeleteAddress(addr.address_id)}
                          className="p-1.5 rounded-lg border border-red-100 dark:border-red-950/20 hover:border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors cursor-pointer"
                          aria-label="Delete Address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADDRESS ADD/EDIT MODAL */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressModal(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" 
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 overflow-hidden z-10"
            >
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" /> {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h3>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Receiver Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0912345678"
                      value={addressPhone}
                      onChange={(e) => setAddressPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Province</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TPHCM"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">District</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Quận 1"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ward</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Phường Bến Nghé"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Street Address & Detail</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 120 Lê Lợi, Tòa nhà Lumina, Tầng 5"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-dark transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Address
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;
