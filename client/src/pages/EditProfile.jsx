import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../context/SocketContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EditProfile = () => {
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuthContext();
  
  const [username, setUsername] = useState(authUser?.username || '');
  const [bio, setBio] = useState(authUser?.bio || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/users/profile', 
        { username, bio }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAuthUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!authUser) return null;

  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl animate-in zoom-in-95 duration-300">
        
        <div className="flex items-center justify-between mb-8">
            <Link to="/profile" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                <span className="font-bold uppercase text-xs tracking-widest">Back to Profile</span>
            </Link>
            <h1 className="text-2xl font-black text-white tracking-tight italic">Customize Profile</h1>
        </div>

        <form onSubmit={handleSave} className="bg-dark-900 border border-dark-600 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700"></div>

          {msg.text && (
            <div className={`mb-8 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-center ${msg.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {msg.text}
            </div>
          )}

          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Display Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-dark-700/50 border border-dark-600 rounded-3xl px-6 py-4 text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold"
                  placeholder="Your awesome username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Bio / Status</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="4"
                className="w-full bg-dark-700/50 border border-dark-600 rounded-[32px] px-6 py-5 text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm leading-relaxed resize-none"
                placeholder="Tell the world something cool about you..."
              ></textarea>
              <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-right mr-4 italic">Visible to all your friends</p>
            </div>

            <div className="pt-4 flex items-center gap-4">
               <button 
                 type="submit" 
                 disabled={loading}
                 className="flex-1 bg-primary hover:bg-primaryHover disabled:opacity-50 text-white py-4 rounded-[28px] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 transition-all active:scale-95 group relative overflow-hidden"
               >
                 <span className="relative z-10">{loading ? 'Saving...' : 'Secure Profile'}</span>
               </button>
               <Link 
                 to="/profile"
                 className="bg-dark-700 hover:bg-dark-600 text-gray-400 px-8 py-4 rounded-[28px] font-bold uppercase tracking-widest text-[10px] transition-all"
               >
                 Cancel
               </Link>
            </div>
          </div>
        </form>

        <p className="mt-8 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            Privacy Guaranteed • QuickiChat Cloud Sync
        </p>
      </div>
    </div>
  );
};

export default EditProfile;