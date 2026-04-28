import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Palette, HelpCircle, ArrowLeft, Check, Lock, Bell, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  const { accentColor, setAccentColor } = useUIStore();

  const [activeSection, setActiveSection] = useState('account');
  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', { username });
      setUser(data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="flex h-screen bg-background-primary text-text-primary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-glass-border bg-background-secondary flex flex-col h-full">
        <div className="p-10 pb-6 flex items-center gap-4">
          <button 
            onClick={() => navigate('/chat')}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-accent"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {sections.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all group ${
                activeSection === item.id 
                ? 'bg-accent/10 text-accent shadow-sm shadow-accent/5' 
                : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
              }`}
            >
              <item.icon size={20} className={activeSection === item.id ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary'} />
              <span>{item.label}</span>
              {activeSection === item.id && (
                <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 bg-accent rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-glass-border mt-auto">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl font-bold transition-all active:scale-95"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-12 lg:p-20">
        <div className="max-w-3xl mx-auto">
          {activeSection === 'account' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-bold">Profile Details</h2>
                  <div className="h-px flex-1 bg-glass-border"></div>
                </div>
                
                <div className="bg-background-secondary/30 backdrop-blur-xl border border-glass-border rounded-[2rem] p-10">
                  <form onSubmit={handleUpdateUsername} className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-10 items-center">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-glass-border group cursor-pointer" onClick={() => navigate('/profile')}>
                        <img 
                          src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=random`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <User size={24} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 w-full space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-accent uppercase tracking-widest ml-1">Username</label>
                          <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-background-tertiary border border-glass-border rounded-2xl px-5 py-3.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                            placeholder="Enter username"
                          />
                        </div>
                        <button 
                          type="submit" 
                          disabled={loading}
                          className="px-8 py-3 bg-accent hover:bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-accent/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-bold text-red-400">Danger Zone</h2>
                  <div className="h-px flex-1 bg-red-400/20"></div>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 rounded-[2rem] p-8 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-text-primary">Delete Account</h3>
                    <p className="text-sm text-text-secondary mt-1">Permanently remove your account and all data.</p>
                  </div>
                  <button className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all active:scale-95">
                    <Trash2 size={20} />
                  </button>
                </div>
              </section>
            </motion.div>
          )}

          {activeSection === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-bold">Security Settings</h2>
                  <div className="h-px flex-1 bg-glass-border"></div>
                </div>

                <div className="bg-background-secondary/30 backdrop-blur-xl border border-glass-border rounded-[2rem] p-10">
                  <form onSubmit={handleChangePassword} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-accent uppercase tracking-widest ml-1">Current Password</label>
                        <input 
                          type="password" 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-background-tertiary border border-glass-border rounded-2xl px-5 py-3.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-accent uppercase tracking-widest ml-1">New Password</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-background-tertiary border border-glass-border rounded-2xl px-5 py-3.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full md:w-auto px-10 py-3.5 bg-background-tertiary hover:bg-white/10 text-text-primary border border-glass-border rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </section>

              <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-6 flex gap-4">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 h-fit">
                  <Lock size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-1">Encryption</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Your messages are protected with state-of-the-art encryption. Only you and your participants can read them.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'appearance' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-bold">Theme & Style</h2>
                  <div className="h-px flex-1 bg-glass-border"></div>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-6 ml-1">Accent Color</h3>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
                      {['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#14b8a6', '#f43f5e'].map((color) => (
                        <button 
                          key={color} 
                          onClick={() => setAccentColor(color)}
                          className={`group aspect-square rounded-2xl cursor-pointer relative hover:scale-110 transition-all p-1 bg-background-tertiary border border-glass-border ${accentColor === color ? 'ring-2 ring-accent ring-offset-4 ring-offset-background-primary' : ''}`}
                        >
                          <div 
                            className="w-full h-full rounded-xl shadow-inner"
                            style={{ backgroundColor: color }}
                          >
                            {accentColor === color && <Check className="w-full h-full p-1 text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-background-secondary/30 border border-glass-border rounded-3xl p-8 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-text-primary">Glassmorphism</h3>
                      <p className="text-sm text-text-secondary mt-1">Enable frosted glass effects across the UI.</p>
                    </div>
                    <button className="w-14 h-8 bg-accent rounded-full p-1 transition-colors">
                      <div className="w-6 h-6 bg-white rounded-full ml-auto shadow-sm" />
                    </button>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeSection === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 bg-background-secondary rounded-3xl flex items-center justify-center mb-8 text-text-secondary">
                <Bell size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Notifications</h3>
              <p className="text-text-secondary max-w-sm">Push notification settings are being optimized for your browser.</p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;