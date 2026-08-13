import { create } from 'zustand';
import { WishlistItem } from '@/types';
import { api } from '@/services/api';

interface WishlistState {
  wishlist: WishlistItem[];
  isLoading: boolean;
  loadWishlist: (userId: string) => Promise<void>;
  toggleWishlist: (userId: string, productId: string) => Promise<boolean>;
  removeWishlistItem: (userId: string, productId: string) => Promise<boolean>;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],
  isLoading: false,
  loadWishlist: async (userId) => {
    set({ isLoading: true });
    try {
      const list = await api.wishlist.get(userId);
      set({ wishlist: list || [] });
    } catch {
      set({ wishlist: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  toggleWishlist: async (userId, productId) => {
    try {
      const res = await api.wishlist.toggle(userId, productId);
      await get().loadWishlist(userId);
      return !!res.added;
    } catch {
      return false;
    }
  },
  removeWishlistItem: async (userId, productId) => {
    try {
      await api.wishlist.remove(userId, productId);
      set((state) => ({
        wishlist: state.wishlist.filter((item) => item.product_id !== productId),
      }));
      return true;
    } catch {
      return false;
    }
  },
  clearWishlist: () => set({ wishlist: [] }),
}));
