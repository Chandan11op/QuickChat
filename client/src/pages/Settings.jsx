import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Palette, ArrowLeft, Check, Lock, Bell, Trash2, Camera, Loader2, Mail, Phone, Calendar, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  const { theme, setTheme, accentColor, setAccentColor } = useUIStore();

  const [activeSection, setActiveSection] = useState('account');
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [bio, setBio] = useState(user?.bio || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Update local state when user store refreshes
    if (user) {
      setUsername(user.username || '');
      setFullName(user.fullName || '');
      setContactNumber(user.contactNumber || '');
      setDob(user.dob || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', {
        username,
        fullName,
        contactNumber,
        dob,
        bio
      });
      setUser(data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('File size must be less than 2MB');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const { data } = await api.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(data);
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
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
  ];

  return (
    <div className="flex h-screen bg-background-primary text-text-primary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 bg-background-secondary flex flex-col h-full">
        <div className="p-8 pb-4 flex items-center gap-4">
          <button 
            onClick={() => navigate('/chat')}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-accent"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black tracking-tight text-white">Settings</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {sections.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all group text-xs uppercase tracking-wider ${
                activeSection === item.id 
                ? 'bg-accent/15 text-accent shadow-sm shadow-accent/5 border border-accent/20' 
                : 'text-text-secondary hover:bg-white/5 hover:text-text-primary border border-transparent'
              }`}
            >
              <item.icon size={18} className={activeSection === item.id ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary'} />
              <span>{item.label}</span>
              {activeSection === item.id && (
                <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 bg-accent rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 mt-auto">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-2xl font-bold transition-all active:scale-95"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-16 bg-background-primary/40">
        <div className="max-w-3xl mx-auto">
          
          {/* Account Profile Section */}
          {activeSection === 'account' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">Profile Details</h2>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>
                
                <div className="bg-background-secondary/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    
                    {/* Avatar Upload Banner */}
                    <div className="flex flex-col sm:flex-row gap-8 items-center border-b border-white/5 pb-8 mb-4">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent relative shadow-lg bg-background-tertiary">
                          <img 
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=random`} 
                            alt="Avatar" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {uploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="absolute -bottom-1 -right-1 p-2 bg-accent hover:bg-blue-600 text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                          title="Upload Avatar"
                        >
                          <Camera size={14} />
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleAvatarUpload} 
                          className="hidden" 
                          accept="image/*" 
                        />
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="text-base font-bold text-white">Profile Photo</h3>
                        <p className="text-xs text-text-secondary mt-1">Accepts PNG, JPG or GIF. Max size 2MB.</p>
                      </div>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text" 
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-background-tertiary/60 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all font-medium"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>

                      {/* Username */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Username</label>
                        <div className="relative">
                          <span className="text-sm font-bold text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2">@</span>
                          <input 
                            type="text" 
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-background-tertiary/60 border border-white/10 rounded-2xl py-3 pl-9 pr-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all font-medium"
                            placeholder="john.doe"
                          />
                        </div>
                      </div>

                      {/* Contact Number */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Contact Number</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input 
                            type="tel" 
                            required
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            className="w-full bg-background-tertiary/60 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all font-medium"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Date of Birth</label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input 
                            type="date" 
                            required
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full bg-background-tertiary/60 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all font-medium"
                          />
                        </div>
                      </div>

                      {/* Email (Read-Only) */}
                      <div className="space-y-1.5 md:col-span-2">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Email Id</label>
                          <span className="text-[9px] text-zinc-500 flex items-center gap-1"><Lock size={10} /> Registered identity cannot be edited</span>
                        </div>
                        <div className="relative opacity-60">
                          <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input 
                            type="email" 
                            readOnly
                            value={user?.email || ''}
                            className="w-full bg-background-tertiary border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-zinc-400 focus:outline-none font-medium cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Bio / About Me</label>
                        <textarea 
                          rows="3"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full bg-background-tertiary/60 border border-white/10 rounded-2xl py-3 px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all font-medium resize-none"
                          placeholder="Tell your story..."
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full md:w-auto px-10 py-3.5 bg-accent hover:bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-accent/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Profile Details"
                      )}
                    </button>
                  </form>
                </div>
              </section>

              {/* Danger Zone */}
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xl font-bold text-red-400 uppercase tracking-wider">Danger Zone</h2>
                  <div className="h-px flex-1 bg-red-400/20"></div>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6 sm:p-8 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-text-primary">Delete Account</h3>
                    <p className="text-xs text-text-secondary mt-1">Permanently remove your account and all associated data.</p>
                  </div>
                  <button className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/10 rounded-2xl transition-all active:scale-95">
                    <Trash2 size={18} />
                  </button>
                </div>
              </section>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeSection === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">Security Settings</h2>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>

                <div className="bg-background-secondary/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Current Password</label>
                        <input 
                          type="password" 
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-background-tertiary/60 border border-white/10 rounded-2xl px-5 py-3.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all text-sm font-medium"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">New Password</label>
                        <input 
                          type="password" 
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-background-tertiary/60 border border-white/10 rounded-2xl px-5 py-3.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all text-sm font-medium"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full md:w-auto px-10 py-3.5 bg-background-tertiary hover:bg-white/10 text-text-primary border border-white/10 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </form>
                </div>
              </section>

              <div className="bg-accent/5 border border-accent/15 rounded-3xl p-6 flex gap-4">
                <div className="p-2 bg-accent/10 rounded-xl text-accent h-fit">
                  <Lock size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Encryption Details</h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Your conversations are fully protected with cryptographic algorithms. They are encrypted before storage and can only be decrypted when loaded on verified client sessions.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Appearance Style Settings Tab */}
          {activeSection === 'appearance' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">Theme & Style</h2>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>
                
                <div className="space-y-8 bg-background-secondary/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
                  {/* Theme Select */}
                  <div>
                    <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4 ml-1">Theme Mode</h3>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border font-bold text-xs uppercase tracking-wider transition-all ${theme === 'dark' ? 'bg-accent/15 border-accent text-accent shadow-sm' : 'bg-background-tertiary border-white/10 text-text-secondary hover:text-white'}`}
                      >
                        <Moon size={16} />
                        <span>Dark Theme</span>
                      </button>
                      <button 
                        onClick={() => setTheme('light')}
                        className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border font-bold text-xs uppercase tracking-wider transition-all ${theme === 'light' ? 'bg-accent/15 border-accent text-accent shadow-sm' : 'bg-background-tertiary border-white/10 text-text-secondary hover:text-white'}`}
                      >
                        <Sun size={16} />
                        <span>Light Theme</span>
                      </button>
                    </div>
                  </div>

                  {/* Accent Color picker */}
                  <div>
                    <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4 ml-1">Accent Color</h3>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                      {['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#14b8a6', '#f43f5e'].map((color) => (
                        <button 
                          key={color} 
                          type="button"
                          onClick={() => setAccentColor(color)}
                          className={`group aspect-square rounded-2xl cursor-pointer relative hover:scale-105 transition-all p-1 bg-background-tertiary border border-white/10 ${accentColor === color ? 'ring-2 ring-accent ring-offset-4 ring-offset-background-primary' : ''}`}
                        >
                          <div 
                            className="w-full h-full rounded-xl shadow-inner flex items-center justify-center"
                            style={{ backgroundColor: color }}
                          >
                            {accentColor === color && <Check className="w-4 h-4 text-white font-bold" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Glassmorphism Toggle */}
                  <div className="bg-background-tertiary/40 border border-white/5 rounded-3xl p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-text-primary">Glassmorphism UI</h3>
                      <p className="text-xs text-text-secondary mt-1">Enable premium frosted glass blur effects across dashboard panels.</p>
                    </div>
                    <button className="w-14 h-8 bg-accent rounded-full p-1 transition-colors relative flex items-center cursor-pointer">
                      <div className="w-6 h-6 bg-white rounded-full ml-auto shadow-sm" />
                    </button>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Settings;