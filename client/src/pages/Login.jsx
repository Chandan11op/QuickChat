import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', formData);
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate('/chat');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card-premium p-8 sm:p-10 neon-glow relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-3xl" />
          
          <div className="text-center mb-10 relative z-10">
            <motion.div 
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-bl from-accent/20 to-purple-500/20 backdrop-blur-md rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-white/10 overflow-hidden"
            >
              <img src={logo} alt="QuickChat Logo" className="w-11 h-11 object-contain" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
            <p className="text-text-secondary text-sm">Enter your credentials to access QuickChat</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-text-secondary group-focus-within:text-white transition-colors" />
                </div>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-background-tertiary/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-text-secondary group-focus-within:text-white transition-colors" />
                </div>
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-background-tertiary/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-background-tertiary/50 text-accent focus:ring-accent focus:ring-offset-0" />
                <span className="text-sm text-text-secondary group-hover:text-white transition-colors">Remember me</span>
              </label>
              <Link to="/forgot" className="text-sm text-white font-semibold hover:text-accent transition-colors">Forgot password?</Link>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent to-purple-600 hover:from-accent hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(99,102,241,0.3)] mt-6 border border-white/10"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Login <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center relative z-10">
            <p className="text-text-secondary text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-white font-semibold hover:text-accent transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;