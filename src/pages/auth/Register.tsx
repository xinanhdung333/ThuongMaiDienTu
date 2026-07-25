import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/context/ToastContext';
import { ShoppingBag, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const registerSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

type RegisterInputs = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: signup, loading, error: authError } = useAuthStore();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterInputs) => {
    const success = await signup(data.fullName, data.email, data.phone, data.password);
    if (success) {
      toast('Registration successful! Welcome!', 'success');
      navigate('/');
    } else {
      toast('Registration failed. Email might already exist.', 'error');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 transition-colors">
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
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Account</h1>
            <p className="text-xs text-slate-400 mt-1.5">Join the Lumina premium marketplace</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 text-xs font-semibold text-rose-500 rounded-xl border border-rose-100 dark:border-rose-900/50">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* FULL NAME */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('fullName')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 dark:text-slate-200"
                />
              </div>
              {errors.fullName && <span className="text-[10px] text-rose-500 mt-1 block">{errors.fullName.message}</span>}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="john@email.com"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 dark:text-slate-200"
                />
              </div>
              {errors.email && <span className="text-[10px] text-rose-500 mt-1 block">{errors.email.message}</span>}
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  placeholder="0912345678"
                  {...register('phone')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 dark:text-slate-200"
                />
              </div>
              {errors.phone && <span className="text-[10px] text-rose-500 mt-1 block">{errors.phone.message}</span>}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
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
              {loading ? 'Creating Account...' : 'Register'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">Log In</Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
};
export default Register;
