import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../context/SocketContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Settings = () => {
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuthContext();
  const { theme, toggleTheme } = useTheme();

  const [activeSection, setActiveSection] = useState('account');
  const [username, setUsername] = useState(authUser?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/users/profile', 
        { username }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAuthUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setMessage({ type: 'success', text: 'Username updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update username.' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/users/change-password', 
        { currentPassword, newPassword }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    }
  };

  return (
    <div className="flex h-screen bg-[#0b141a] text-gray-200 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-80 border-r border-[#233138] bg-[#111b21] flex flex-col flex-shrink-0">
        <div className="p-10 pb-6 flex items-center gap-4">
          <Link to="/chat" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#202c33] transition-colors text-[#00a884]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-[#e9edef] tracking-tight">Settings</h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {[
            { id: 'account', label: 'Account', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { id: 'appearance', label: 'Appearance', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.172-1.172a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 000-5.656z' },
            { id: 'privacy', label: 'Privacy', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
            { id: 'help', label: 'Help & FAQ', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-medium transition-all duration-300 ${activeSection === item.id ? 'bg-[#202c33] text-[#00a884] shadow-sm' : 'text-[#d1d7db] hover:bg-[#202c33]'}`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
              </svg>
              <span>{item.label}</span>
              {activeSection === item.id && <div className="ml-auto w-1.5 h-1.5 bg-[#00a884] rounded-full"></div>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-[#233138] mt-auto">
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/'; }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Settings Content */}
      <main className="flex-1 overflow-y-auto bg-[#0b141a] custom-scrollbar">
        <div className="max-w-3xl mx-auto py-16 px-12">
          {message.text && (
            <div className={`mb-10 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-[#00a884]/10 text-[#00a884] border border-[#00a884]/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-[#00a884]/20' : 'bg-red-500/20'}`}>
                {message.type === 'success' ? '✓' : '!'}
              </div>
              <p className="font-semibold text-sm">{message.text}</p>
            </div>
          )}

          {activeSection === 'account' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <section>
                <div className="flex items-center gap-2 mb-8">
                  <h2 className="text-2xl font-bold text-[#e9edef]">Profile Details</h2>
                  <div className="h-1 flex-1 bg-[#233138] ml-4 rounded-full opacity-30"></div>
                </div>
                
                <div className="bg-[#111b21] border border-[#233138] rounded-3xl p-8 shadow-2xl">
                  <form onSubmit={handleUpdateUsername} className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="relative group">
                         <img 
                          src={authUser?.avatar || `https://ui-avatars.com/api/?name=${authUser?.username}&background=random`} 
                          alt="Avatar" 
                          className="w-32 h-32 rounded-full object-cover border-4 border-[#233138] group-hover:brightness-75 transition-all" 
                         />
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                           <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                         </div>
                      </div>
                      <div className="flex-1 w-full space-y-6">
                        <div>
                          <label className="block text-xs font-bold text-[#8696a0] uppercase tracking-widest mb-3">Your Screen Name</label>
                          <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#202c33] border border-transparent rounded-xl px-5 py-4 text-[#e9edef] focus:outline-none focus:border-[#00a884] transition-all placeholder-[#667781]"
                            placeholder="Enter username..."
                          />
                        </div>
                        <button type="submit" className="bg-[#00a884] hover:bg-[#06cf9c] text-[#0b141a] px-10 py-4 rounded-xl font-bold shadow-xl shadow-[#00a884]/20 transition-all active:scale-95 text-sm">
                          UPDATE PROFILE
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-8">
                  <h2 className="text-2xl font-bold text-[#e9edef]">Security Check</h2>
                  <div className="h-1 flex-1 bg-[#233138] ml-4 rounded-full opacity-30"></div>
                </div>

                <div className="bg-[#111b21] border border-[#233138] rounded-3xl p-8 shadow-2xl">
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-[#8696a0] uppercase tracking-widest mb-3">Current Password</label>
                        <input 
                          type="password" 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-[#202c33] border border-transparent rounded-xl px-5 py-4 text-[#e9edef] focus:outline-none focus:border-[#00a884] transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#8696a0] uppercase tracking-widest mb-3">New Password</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-[#202c33] border border-transparent rounded-xl px-5 py-4 text-[#e9edef] focus:outline-none focus:border-[#00a884] transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-[#202c33] hover:bg-[#233138] text-[#e9edef] border border-[#233138] px-10 py-4 rounded-xl font-bold transition-all active:scale-95 text-sm">
                      SECURE ACCOUNT
                    </button>
                  </form>
                </div>
              </section>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <section>
                <h2 className="text-2xl font-bold text-[#e9edef] mb-2">Display Mode</h2>
                <p className="text-[#a1bac8] text-sm mb-10">Manage your visual experience on QuickiChat.</p>
                
                <div className="bg-[#111b21] border border-[#233138] rounded-[2.5rem] p-8 flex items-center justify-between shadow-2xl hover:border-[#00a884]/30 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#00a884]/10 rounded-[1.5rem] flex items-center justify-center text-[#00a884]">
                      {theme === 'dark' ? (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                        </svg>
                      ) : (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m3.343-5.657l-.707.707m12.728 12.728l-.707.707M6.343 17.657l-.707.707M17.657 6.343l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#e9edef]">Dark Theme</h3>
                      <p className="text-sm text-[#8696a0] mt-1">{theme === 'dark' ? 'Modern dark interface optimized for OLED' : 'Standard light mode for high visibility'}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={toggleTheme}
                    className={`w-16 h-9 rounded-full p-1.5 relative transition-colors duration-500 ${theme === 'dark' ? 'bg-[#00a884]' : 'bg-[#3b4a54]'}`}
                  >
                    <div className={`w-6 h-6 bg-[#e9edef] rounded-full shadow-lg transition-transform duration-500 ease-out transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold text-[#8696a0] uppercase tracking-widest mb-6">Accent Colors</h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-5">
                  {['#00a884', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#10b981', '#6b7280'].map((color) => (
                    <div 
                      key={color} 
                      className="group aspect-square rounded-2xl cursor-pointer relative hover:scale-105 transition-all p-1 bg-[#111b21] border border-[#233138]"
                    >
                      <div 
                        className="w-full h-full rounded-xl shadow-inner transition-transform group-active:scale-95"
                        style={{ backgroundColor: color }}
                      ></div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-[#111b21] border border-[#233138] rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl">
                <svg className="w-10 h-10 text-[#00a884] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#e9edef] mb-3">End-to-End Privacy</h3>
              <p className="text-[#8696a0] text-sm max-w-sm leading-relaxed">Advanced privacy controls are being finalized. You will soon have granular control over your online status and encryption keys.</p>
              <div className="mt-8 px-6 py-2 bg-[#00a884]/10 text-[#00a884] rounded-full text-xs font-bold uppercase tracking-widest">In Development</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;