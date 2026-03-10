import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext, useSocketContext } from '../context/SocketContext.jsx';

const Profile = () => {
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuthContext();
  const { onlineUsers } = useSocketContext();

  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authUser) {
      navigate('/');
      return;
    }
    fetchFriendsData();
  }, [authUser, navigate]);

  const fetchFriendsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [friendsRes, requestsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users/friends', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/users/friend-requests', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const uniqueFriends = friendsRes.data.reduce((acc, current) => {
         const x = acc.find(item => item._id === current._id);
         if (!x) {
           return acc.concat([current]);
         } else {
           return acc;
         }
      }, []);

      setFriends(uniqueFriends);
      setFriendRequests(requestsRes.data);
    } catch (err) {
      console.error("Error fetching friends data", err);
    }
  };

  const handleAcceptRequest = async (senderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users/accept-request', 
        { id: senderId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFriendsData();
    } catch (err) {
      alert("Failed to accept request");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/users/upload-avatar', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      // The backend now returns the full updated user object
      setAuthUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      alert("Failed to upload avatar");
    }
  };

  if (!authUser) return null;

  const getAvatar = (user) => {
    return user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=random`;
  };

  return (
    <div className="flex h-screen bg-dark-800 text-gray-200 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-dark-600 bg-dark-900 flex flex-col flex-shrink-0">
        <div className="p-8 pb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">QuickiChat</span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1">
          <Link to="/chat" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-dark-700 hover:text-white font-medium transition-all group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Dashboard
          </Link>
          <div className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-primary/10 text-primary font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Profile
          </div>
          <Link to="/settings" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-dark-700 hover:text-white font-medium transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            </svg>
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full custom-scrollbar relative bg-dark-800">
        <div className="max-w-4xl mx-auto py-16 px-8">
          
          {/* Hero Section */}
          <div className="relative mb-8 pt-20 pb-12 px-8 bg-dark-900 border border-dark-600 rounded-[32px] overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:items-end">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl p-1 bg-dark-700 border border-dark-600 shadow-2xl overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                  <img src={getAvatar(authUser)} alt="" className="w-full h-full rounded-[20px] object-cover" />
                </div>
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-2 -right-2 bg-primary hover:bg-primaryHover text-white p-2.5 rounded-2xl border-4 border-dark-900 shadow-xl transition-all hover:rotate-12"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{authUser.username}</h1>
                <p className="text-gray-400 font-medium mb-4">{authUser.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="bg-dark-700/50 px-4 py-2 rounded-xl border border-dark-600">
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-0.5">Joined</span>
                    <span className="text-white text-sm font-semibold">{new Date(authUser.createdAt).toLocaleDateString(undefined, {month: 'long', year: 'numeric'})}</span>
                  </div>
                  <div className="bg-dark-700/50 px-4 py-2 rounded-xl border border-dark-600">
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-0.5">Friends</span>
                    <span className="text-white text-sm font-semibold tracking-tighter">{friends.length} Accounts</span>
                  </div>
                  <Link to="/edit-profile" className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-xl border border-primary/20 text-[10px] font-black uppercase tracking-widest transition-all">
                    Edit Details
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bio Card */}
            <div className="bg-dark-900 border border-dark-600 rounded-[32px] p-8 shadow-xl">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">About Me</h3>
              <p className="text-sm text-gray-300 leading-relaxed italic">
                 "{authUser.bio || "This user prefers to keep their mystery. No bio set yet!"}"
              </p>
            </div>

            {/* Content Tabs */}
            <div className="md:col-span-2 bg-dark-900 border border-dark-600 rounded-[32px] p-8 shadow-xl flex flex-col min-h-[400px]">
              <div className="flex items-center gap-6 mb-8 border-b border-dark-600 pb-4">
                <button 
                  onClick={() => setActiveTab('friends')}
                  className={`text-sm font-bold tracking-tighter transition-all ${activeTab === 'friends' ? 'text-primary scale-110' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  My Network
                </button>
                <button 
                  onClick={() => setActiveTab('requests')}
                  className={`text-sm font-bold tracking-tighter flex items-center gap-2 transition-all ${activeTab === 'requests' ? 'text-primary scale-110' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Requests
                  {friendRequests.length > 0 && (
                    <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-lg border-2 border-dark-900">{friendRequests.length}</span>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {activeTab === 'friends' ? (
                  friends.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                       <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="1.5"/></svg>
                       <p className="text-xs font-bold uppercase tracking-widest italic">No connections yet</p>
                    </div>
                  ) : (
                    friends.map((friend) => (
                      <div key={friend._id} className="flex items-center justify-between p-4 rounded-2xl bg-dark-800/50 hover:bg-dark-700 hover:scale-[1.02] transition-all cursor-default">
                        <div className="flex items-center gap-4">
                          <img src={getAvatar(friend)} alt="" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
                          <div>
                            <h4 className="text-sm font-bold text-white">{friend.username}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                               <div className={`w-1.5 h-1.5 rounded-full ${onlineUsers.includes(friend._id) ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{onlineUsers.includes(friend._id) ? 'Online' : 'Offline'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  friendRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                       <p className="text-xs font-bold uppercase tracking-widest italic">Inbox is empty</p>
                    </div>
                  ) : (
                    friendRequests.map((reqUser) => (
                      <div key={reqUser._id} className="flex items-center justify-between p-4 rounded-2xl bg-dark-800 border-l-4 border-primary shadow-lg animate-in fade-in slide-in-from-left-4">
                        <div className="flex items-center gap-4">
                           <img src={getAvatar(reqUser)} alt="" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                           <h4 className="text-sm font-bold text-white uppercase tracking-tighter">{reqUser.username}</h4>
                        </div>
                        <button onClick={() => handleAcceptRequest(reqUser._id)} className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-primary/30">
                          Confirm
                        </button>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;