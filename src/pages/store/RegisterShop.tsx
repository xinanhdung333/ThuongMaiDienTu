import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { Store, Sparkles, ArrowRight, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';

export const RegisterShop: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    shop_name: '',
    description: '',
    logo: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [existingShop, setExistingShop] = useState<any>(null);
  const [checkingShop, setCheckingShop] = useState(false);

  useEffect(() => {
    const checkShop = async () => {
      if (!user?.user_id) return;
      setCheckingShop(true);
      try {
        const shop = await api.client.get(`/shops/owner/${user.user_id}`);
        setExistingShop(shop.data || null);
      } catch {
        setExistingShop(null);
      } finally {
        setCheckingShop(false);
      }
    };

    checkShop();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage('Please sign in first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const created = await api.shops.create({
        owner_id: user.user_id,
        shop_name: form.shop_name,
        description: form.description,
        logo: form.logo || undefined,
        rating: 5,
        total_followers: 0,
        status: 'PENDING',
      } as any);

      setExistingShop(created);
      setMessage('Shop registration submitted. It is now waiting for admin approval.');
      setTimeout(() => navigate('/store'), 1200);
    } catch (err: any) {
      setMessage(err?.message || 'Unable to register shop right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Become a Seller</h1>
            <p className="text-sm text-slate-500">Create your shop and start selling on Lumina.</p>
          </div>
        </div>

        {checkingShop ? (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Checking your seller status...
          </div>
        ) : existingShop ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              You already have a shop registration.
            </div>
            <p className="mt-2">Shop: {existingShop.shop_name}</p>
            <p className="mt-1 text-xs">Status: {existingShop.status}</p>
            {existingShop.status === 'PENDING' && (
              <div className="mt-3 flex items-center gap-2 text-xs font-medium">
                <Clock3 className="h-3.5 w-3.5" /> Waiting for admin approval.
              </div>
            )}
            {existingShop.status === 'ACTIVE' && (
              <div className="mt-3 flex items-center gap-2 text-xs font-medium">
                <ShieldCheck className="h-3.5 w-3.5" /> Your shop is approved and ready.
              </div>
            )}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Shop Name</label>
            <input
              required
              value={form.shop_name}
              onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
              placeholder="e.g. Lumina Studio"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell buyers what makes your shop special"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Logo URL (optional)</label>
            <input
              value={form.logo}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading || !!existingShop}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {loading ? 'Submitting...' : existingShop ? 'Already Registered' : 'Create Shop'}
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Seller onboarding ready
            </div>
          </div>

          {message && (
            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterShop;
