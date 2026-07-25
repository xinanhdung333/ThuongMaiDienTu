import { create } from 'zustand';
import { User, Address } from '@/types';
import { api } from '@/services/api';

interface AuthState {
  user: User | null;
  addresses: Address[];
  loading: boolean;
  error: string | null;
  
  initialize: () => void;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (fullName: string, email: string, phone: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updated: Partial<User>) => void;
  
  // Addresses
  loadAddresses: () => void;
  addAddress: (address: Omit<Address, 'address_id' | 'user_id' | 'created_at'>) => void;
  updateAddress: (addressId: string, address: Partial<Address>) => void;
  deleteAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  addresses: [],
  loading: false,
  error: null,

  initialize: () => {
    const token = api.getToken();
    if (!token) {
      set({ user: null, addresses: [] });
      return;
    }

    const stored = localStorage.getItem('shopeelite_user');
    if (stored) {
      const parsed = JSON.parse(stored) as User;
      // Refresh user from API to get up-to-date roles/status
      api.users.getOne(parsed.user_id).then((fresh) => {
        localStorage.setItem('shopeelite_user', JSON.stringify(fresh));
        set({ user: fresh });
        get().loadAddresses();
      }).catch(() => {
        set({ user: parsed });
        get().loadAddresses();
      });
    }
  },

  login: async (email, pass) => {
    set({ loading: true, error: null });
    try {
      await api.auth.login(email, pass);
      const users = await api.users.getAll();
      const user = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase()) || null;
      if (!user) {
        set({ error: 'User not found.', loading: false });
        return false;
      }

      localStorage.setItem('shopeelite_user', JSON.stringify(user));
      set({ user, loading: false });
      get().loadAddresses();
      return true;
    } catch (err: any) {
      set({ error: err?.message || 'Authentication failed.', loading: false });
      return false;
    }
  },

  register: async (fullName, email, phone, pass) => {
    set({ loading: true, error: null });
    try {
      const newUser = await api.auth.register({ full_name: fullName, email, phone, password_hash: pass, roles: ['Customer'] } as any);
      localStorage.setItem('shopeelite_user', JSON.stringify(newUser));
      set({ user: newUser, loading: false });
      get().loadAddresses();
      return true;
    } catch (err: any) {
      set({ error: err?.message || 'Registration failed.', loading: false });
      return false;
    }
  },

  logout: () => {
    api.auth.logout();
    localStorage.removeItem('shopeelite_user');
    set({ user: null, addresses: [] });
  },

  updateProfile: (updated) => {
    const { user } = get();
    if (!user) return;

    api.users.update(user.user_id, updated).then((res) => {
      set({ user: res });
    }).catch(() => {
      set({ error: 'Profile update failed.' });
    });
  },

  loadAddresses: () => {
    const { user } = get();
    if (!user) return;
    api.users.getOne(user.user_id).then((res) => {
      const addrList = (res as any).addresses || [];
      set({ addresses: addrList });
    }).catch(() => {
      set({ addresses: [] });
    });
  },

  addAddress: (address) => {
    const { user } = get();
    if (!user) return;
    api.users.addAddress(user.user_id, address).then(() => {
      get().loadAddresses();
    }).catch(() => {
      set({ error: 'Unable to add address.' });
    });
  },

  updateAddress: (addressId, address) => {
    get().loadAddresses();
  },

  deleteAddress: (addressId) => {
    get().loadAddresses();
  },

  setDefaultAddress: (addressId) => {
    get().loadAddresses();
  }
}));
