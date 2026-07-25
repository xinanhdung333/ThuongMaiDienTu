import { create } from 'zustand';
import { ProductWithDetails } from '@/types';
import { api } from '@/services/api';

interface WishlistState {
  wishlist: any[];
  loadWishlist: (userId: string) => void;
  toggleWishlist: (userId: string, productId: string) => Promise<boolean>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],
  loadWishlist: (userId) => {
    api.wishlist.get(userId).then((list: any) => {
      set({ wishlist: list || [] });
    }).catch(() => set({ wishlist: [] }));
  },
  toggleWishlist: async (userId, productId) => {
    try {
      const res = await api.wishlist.toggle(userId, productId);
      get().loadWishlist(userId);
      return !!res.added;
    } catch {
      return false;
    }
  }
}));
