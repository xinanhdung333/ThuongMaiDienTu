import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/context/ToastContext';
import { ShoppingBag, Mail, Lock, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

type LoginInputs = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuthStore();
  const { toast } = useToast();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginInputs) => {
    const success = await login(data.email, data.password);
    if (success) {
      toast('Welcome back to Lumina!', 'success');
      navigate('/');
    } else {
      toast('Login failed. Please check credentials.', 'error');
    }
  };

  const fillCredentials = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="relative w-full max-w-md">
        
        {/* Glow Effects */}
        <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-secondary/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl"
        >
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Lumina Marketplace</h1>
            <p className="text-xs text-slate-400 mt-1.5">Sign in to your premium shopping account</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 text-xs font-semibold text-rose-500 rounded-xl border border-rose-100 dark:border-rose-900/50">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* EMAIL */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@email.com"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 dark:text-slate-200"
                />
              </div>
              {errors.email && <span className="text-[10px] text-rose-500 mt-1 block">{errors.email.message}</span>}
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-[10px] font-bold text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 dark:text-slate-200"
                />
              </div>
              {errors.password && <span className="text-[10px] text-rose-500 mt-1 block">{errors.password.message}</span>}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Logins */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 text-center">
              Quick testing profiles
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => fillCredentials('buyer@lumina.com', 'buyer123')}
                className="py-2 px-1 rounded-xl bg-slate-50 hover:bg-primary-light hover:text-primary border border-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-primary/5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer flex flex-col items-center gap-1 transition-all"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                Buyer
              </button>
              <button
                onClick={() => fillCredentials('seller@lumina.com', 'seller123')}
                className="py-2 px-1 rounded-xl bg-slate-50 hover:bg-primary-light hover:text-primary border border-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-primary/5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer flex flex-col items-center gap-1 transition-all"
              >
                <User className="w-3.5 h-3.5 shrink-0 text-secondary" />
                Seller
              </button>
              <button
                onClick={() => fillCredentials('admin@lumina.com', 'admin123')}
                className="py-2 px-1 rounded-xl bg-slate-50 hover:bg-primary-light hover:text-primary border border-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-primary/5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer flex flex-col items-center gap-1 transition-all"
              >
                <User className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                Admin
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">Register now</Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
};
export default Login;
