import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Calendar, Users, UserCheck, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { onlineUsers } = useChatStore();
  
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [friendsRes, requestsRes] = await Promise.all([
          api.get('/users/friends'),
          api.get('/users/friend-requests')
        ]);
        setFriends(friendsRes.data);
        setFriendRequests(requestsRes.data);
      } catch (err) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAcceptRequest = async (senderId) => {
    try {
      await api.post('/users/accept-request', { id: senderId });
      toast.success('Friend request accepted!');
      // Refresh data
      const [friendsRes, requestsRes] = await Promise.all([
        api.get('/users/friends'),
        api.get('/users/friend-requests')
      ]);
      setFriends(friendsRes.data);
      setFriendRequests(requestsRes.data);
    } catch (err) {
      toast.error('Failed to accept request');
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

  if (loading) {
    return (
      <div className="h-screen bg-background-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      {/* Header */}
      <div className="h-64 bg-gradient-to-br from-accent/30 via-background-secondary to-background-primary relative">
        <button 
          onClick={() => navigate('/chat')}
          className="absolute top-8 left-8 p-2 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-md border border-white/10 transition-all z-10"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-32 pb-20 relative">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-secondary/50 backdrop-blur-2xl border border-glass-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-44 h-44 rounded-full p-1.5 bg-gradient-to-tr from-accent to-purple-500 shadow-2xl relative overflow-hidden">
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=random`} 
                  className="w-full h-full rounded-full object-cover border-4 border-background-secondary"
                  alt="Profile"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-2 right-2 p-3 bg-accent hover:bg-blue-600 text-white rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                <Camera size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center md:text-left pt-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-text-primary">{user?.username}</h1>
                  <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-text-secondary">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <Mail size={16} className="text-accent" />
                      {user?.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <Calendar size={16} className="text-accent" />
                      Joined {new Date(user?.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/settings')}
                  className="px-6 py-2.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl border border-accent/20 font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Edit Profile
                </button>
              </div>

              <div className="mt-8 p-6 bg-background-tertiary/30 rounded-3xl border border-glass-border max-w-2xl">
                <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3">About Me</h3>
                <p className="text-text-secondary leading-relaxed italic">
                  "{user?.bio || "No bio set yet. Tell your story!"}"
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats & Network */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-background-secondary/50 backdrop-blur-xl border border-glass-border rounded-3xl p-6">
              <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <Users size={18} className="text-accent" />
                    Friends
                  </div>
                  <span className="font-bold">{friends.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <UserCheck size={18} className="text-accent" />
                    Pending
                  </div>
                  <span className="font-bold text-orange-400">{friendRequests.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Content */}
          <div className="lg:col-span-2 bg-background-secondary/50 backdrop-blur-xl border border-glass-border rounded-[2.5rem] p-8 min-h-[400px]">
            <div className="flex items-center gap-8 mb-8 border-b border-glass-border pb-4">
              <button 
                onClick={() => setActiveTab('friends')}
                className={`text-sm font-bold tracking-tight transition-all relative py-2 ${
                  activeTab === 'friends' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                My Network
                {activeTab === 'friends' && (
                  <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('requests')}
                className={`text-sm font-bold tracking-tight transition-all relative py-2 flex items-center gap-2 ${
                  activeTab === 'requests' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Friend Requests
                {friendRequests.length > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                    {friendRequests.length}
                  </span>
                )}
                {activeTab === 'requests' && (
                  <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            </div>

            <div className="space-y-3">
              {activeTab === 'friends' ? (
                friends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-background-tertiary rounded-2xl flex items-center justify-center mb-4 text-text-secondary">
                      <Users size={32} />
                    </div>
                    <p className="text-sm text-text-secondary italic">No friends in your network yet.</p>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <motion.div 
                      key={friend._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-background-tertiary/30 rounded-2xl border border-glass-border hover:bg-background-tertiary/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={friend.avatar || `https://ui-avatars.com/api/?name=${friend.username}`} className="w-11 h-11 rounded-xl object-cover shadow-lg" alt="" />
                          {onlineUsers.includes(friend._id) && (
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background-secondary shadow-lg"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-text-primary">{friend.username}</h4>
                          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
                            {onlineUsers.includes(friend._id) ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                      <button className="p-2.5 bg-background-primary/50 text-text-secondary hover:text-accent rounded-xl border border-glass-border transition-all">
                        <Mail size={18} />
                      </button>
                    </motion.div>
                  ))
                )
              ) : (
                friendRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-background-tertiary rounded-2xl flex items-center justify-center mb-4 text-text-secondary">
                      <UserCheck size={32} />
                    </div>
                    <p className="text-sm text-text-secondary italic">No pending requests at the moment.</p>
                  </div>
                ) : (
                  friendRequests.map((req) => (
                    <motion.div 
                      key={req._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-4 bg-background-tertiary/50 border-l-4 border-accent rounded-2xl shadow-xl"
                    >
                      <div className="flex items-center gap-4">
                        <img src={req.avatar || `https://ui-avatars.com/api/?name=${req.username}`} className="w-11 h-11 rounded-xl object-cover shadow-md" alt="" />
                        <h4 className="text-sm font-bold text-text-primary">{req.username}</h4>
                      </div>
                      <button 
                        onClick={() => handleAcceptRequest(req._id)}
                        className="px-5 py-2 bg-accent hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/20 transition-all active:scale-95"
                      >
                        Accept
                      </button>
                    </motion.div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;