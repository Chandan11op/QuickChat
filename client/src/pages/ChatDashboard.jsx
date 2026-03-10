import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext, useSocketContext } from '../context/SocketContext.jsx';

const ChatDashboard = () => {
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuthContext();
  const { socket, onlineUsers } = useSocketContext();
  
  const [activeTab, setActiveTab] = useState('chats');
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [msgSearchQuery, setMsgSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [sentRequestIds, setSentRequestIds] = useState([]);
  
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const messagesEndRef = useRef(null);
  const notificationSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'));

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '🔥', '🎉', '❤️', '👏', '🙌', '😎', '✨', '😢', '😡', '🙏', '💯'];

  // Initial redirect if not logged in
  useEffect(() => {
    if (!authUser) {
      navigate('/');
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then(setNotificationPermission);
    }
  }, [authUser, navigate]);

  // Fetch Friends
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/users/friends', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Ensure uniqueness of friends by ID
        const uniqueFriends = res.data.reduce((acc, current) => {
           const x = acc.find(item => item._id === current._id);
           if (!x) {
             return acc.concat([current]);
           } else {
             return acc;
           }
        }, []);

        setFriends(uniqueFriends);
      } catch (err) {
        console.error("Error fetching friends", err);
      }
    };
    if (authUser) fetchFriends();
  }, [authUser]);

  // Handle Search
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/users/search?search=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSearchResults(res.data);
      } catch (err) {
        console.error("Error searching users", err);
      }
    };

    const delayDebounce = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Fetch Messages for Selected Chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/messages/${selectedChat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages", err);
      }
    };
    fetchMessages();
  }, [selectedChat]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessageReceived) => {
      // Logic to check if message belongs to current active chat
      const isFromSelected = selectedChat && newMessageReceived.senderId === selectedChat._id;
      const isToSelected = selectedChat && newMessageReceived.receiverId === selectedChat._id;
      const isMe = newMessageReceived.senderId === authUser._id;

      if (isFromSelected || (isMe && isToSelected)) {
         // Avoid duplicates if optimistic update already added it
         setMessages((prev) => {
           const exists = prev.find(m => m._id === newMessageReceived._id);
           if (exists) return prev;
           return [...prev, newMessageReceived];
         });
      }

      // Notification & Chime (only if from others)
      if (!isMe) {
        notificationSound.current.play().catch(e => console.log("Sound play failed", e));

        if (Notification.permission === 'granted' && document.visibilityState !== 'visible') {
           new Notification(`New Message from ${newMessageReceived.senderName || 'Someone'}`, {
             body: newMessageReceived.text || (newMessageReceived.fileUrl ? "📎 Sent a file" : ""),
             icon: '/logo192.png'
           });
        }
      }
    };

    socket.on("receive_message", handleNewMessage);
    socket.on("message_deleted", (deletedMsgId) => {
      setMessages(prev => prev.filter(m => m._id !== deletedMsgId));
    });

    return () => {
      socket.off("receive_message", handleNewMessage);
      socket.off("message_deleted");
    };
  }, [socket, selectedChat, authUser?._id]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e, file = null) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !file) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
        formData.append('fileType', file.type.startsWith('image/') ? 'image' : 'file');
      }
      if (newMessage.trim()) {
        formData.append('text', newMessage);
      }

      const res = await axios.post(`http://localhost:5000/api/messages/send/${selectedChat._id}`, 
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      // OPTIMISTIC UPDATE: Add message to state immediately if socket doesn't loop back
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleSendMessage(null, file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthUser(null);
    navigate('/');
  };

  const deleteOneMessage = async (msgId) => {
      if (!window.confirm("Delete this message?")) return;
      try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/messages/delete/${msgId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setMessages(prev => prev.filter(m => m._id !== msgId));
      } catch (err) {
          console.error("Error deleting message", err);
      }
  };

  const handleClearChat = async () => {
      if (!window.confirm("Are you sure you want to clear this entire chat?")) return;
      try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/messages/clear/${selectedChat._id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setMessages([]);
          setShowUserDetails(false);
      } catch (err) {
          console.error("Error clearing chat", err);
      }
  };

  const handleBlockUser = async () => {
      const isBlocked = authUser.blockedUsers?.includes(selectedChat._id);
      const action = isBlocked ? 'unblock' : 'block';
      if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
      
      try {
          const token = localStorage.getItem('token');
          const res = await axios.post(`http://localhost:5000/api/users/${action}-user`, 
            { id: selectedChat._id }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          // Local update to authUser blocked list
          const updatedUser = { ...authUser };
          if (isBlocked) {
              updatedUser.blockedUsers = updatedUser.blockedUsers.filter(id => id !== selectedChat._id);
          } else {
              if (!updatedUser.blockedUsers) updatedUser.blockedUsers = [];
              updatedUser.blockedUsers.push(selectedChat._id);
          }
          setAuthUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          alert(res.data.message);
      } catch (err) {
          console.error(`Error ${action}ing user`, err);
      }
  };

  const handleReportUser = async () => {
    if (!reportReason.trim()) return alert("Please provide a reason for reporting.");
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users/report-user', 
        { reportedId: selectedChat._id, reason: reportReason }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Report submitted. Thank you.");
      setShowReportModal(false);
      setReportReason('');
      setShowChatMenu(false);
    } catch (err) {
      console.error("Error reporting user", err);
    }
  };

  const toggleMessageSelection = (msgId) => {
    setSelectedMessages(prev => 
      prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId]
    );
  };

  const deleteSelectedMessages = async () => {
    if (!window.confirm(`Delete ${selectedMessages.length} messages?`)) return;
    try {
      const token = localStorage.getItem('token');
      await Promise.all(selectedMessages.map(id => 
        axios.delete(`http://localhost:5000/api/messages/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
      setMessages(prev => prev.filter(m => !selectedMessages.includes(m._id)));
      setSelectedMessages([]);
      setIsSelectMode(false);
    } catch (err) {
      console.error("Error deleting selected messages", err);
    }
  };

  const sendFriendRequest = async (userId) => {
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/users/send-request', 
          { id: userId }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSentRequestIds(prev => [...prev, userId]);
        alert("Friend Request Sent!");
      } catch (err) {
          alert(err.response?.data?.message || 'Failed to send request');
      }
  };

  if (!authUser) return null;

  const getAvatar = (user) => {
    return user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=random`;
  };

  return (
    <div className="flex h-screen bg-dark-800 text-gray-200 overflow-hidden font-sans">
      
      {/* Sidebar - Left */}
      <aside className="w-80 border-r border-dark-600 bg-dark-900 flex flex-col flex-shrink-0 relative">
        {/* Profile snippet */}
        <div className="p-5 flex items-center gap-3 border-b border-dark-600 hover:bg-dark-700 cursor-pointer transition-colors" onClick={() => navigate('/profile')}>
          <div className="relative">
            <img src={getAvatar(authUser)} alt="Profile" className="w-12 h-12 rounded-full object-cover ring-2 ring-primary" />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-dark-900"></div>
          </div>
          <div className="flex-1 overflow-hidden">
            <h2 className="font-semibold text-white truncate">{authUser.username}</h2>
            <div className="flex items-center gap-1.5">
               <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Active Session</span>
               <div className="group relative">
                  <svg className="w-3 h-3 text-gray-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-dark-600 text-[9px] text-gray-200 rounded-lg shadow-xl z-50">
                    Expert Tip: To test multiple accounts, open the second one in an Incognito window or separate Browser Profile.
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="p-3 space-y-1">
          <button 
            onClick={() => { setActiveTab('chats'); setSearchQuery(''); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors ${activeTab === 'chats' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-dark-700 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03-8-9-8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            Chats
          </button>
          <button 
            onClick={() => { setActiveTab('friends'); setSearchQuery(''); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors ${activeTab === 'friends' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-dark-700 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            Find Friends
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              type="text" 
              placeholder={activeTab === 'chats' ? "Search conversations..." : "Search global users..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-700 border border-dark-600 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        {/* Sidebar List */}
        <div className="flex-1 overflow-y-auto px-2 pb-20 custom-scrollbar">
          {searchQuery && activeTab === 'friends' ? (
             <div className="space-y-1 mt-2">
                 <div className="px-3 pt-2 pb-1">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Global Search</h3>
                 </div>
                 {searchResults.length === 0 && <p className="text-xs text-gray-500 px-3 py-4 text-center">No users found.</p>}
                 {searchResults.map(user => {
                     const isFriend = friends.some(f => f._id === user._id);
                     const requestSent = sentRequestIds.includes(user._id);
                     return (
                         <div key={user._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-700 transition">
                           <div className="flex items-center gap-3">
                             <img src={getAvatar(user)} alt={user.username} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                             <h4 className="text-sm font-semibold text-white">{user.username}</h4>
                           </div>
                           {isFriend ? (
                               <span className="text-xs text-gray-500 font-medium px-2 italic">Friend</span>
                           ) : requestSent ? (
                               <span className="text-xs text-primary/80 font-medium px-2">Sent</span>
                           ) : (
                               <button onClick={() => sendFriendRequest(user._id)} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-all transform active:scale-95">
                                 Add
                               </button>
                           )}
                         </div>
                     );
                 })}
             </div>
          ) : (
             <div className="space-y-1 mt-2">
                <div className="px-3 pt-2 pb-1">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Messages</h3>
                </div>
                {friends.length === 0 && <p className="text-xs text-gray-500 px-3 py-4 text-center">Your friend list is empty.</p>}
                {friends.filter(f => f.username.toLowerCase().includes(searchQuery.toLowerCase())).map(friend => {
                  const isOnline = onlineUsers.includes(friend._id);
                  const isSelected = selectedChat?._id === friend._id;
                  return (
                    <div 
                      key={friend._id}
                      onClick={() => { setSelectedChat(friend); setShowUserDetails(false); }}
                      className={`flex items-center gap-3 p-3 mx-1 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-dark-700/50'}`}
                    >
                      <div className="relative flex-shrink-0">
                        <img src={getAvatar(friend)} alt={friend.username} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                        {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-900 shadow-sm"></div>}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-baseline">
                          <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-primary' : 'text-white'}`}>{friend.username}</h4>
                          <span className="text-[10px] text-gray-500">12:45 PM</span>
                        </div>
                        <p className={`text-xs truncate ${isSelected ? 'text-primary/70' : 'text-gray-400'}`}>Click to open chat...</p>
                      </div>
                    </div>
                  );
                })}
             </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-dark-600 bg-dark-900 flex items-center justify-between">
          <button onClick={() => navigate('/settings')} className="text-gray-400 hover:text-white transition-colors group">
            <svg className="w-6 h-6 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Exit
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex bg-dark-800 relative overflow-hidden">
        
        {/* Chat Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          {selectedChat ? (
              <>
                {/* Chat Header */}
                <header className="h-[72px] border-b border-dark-600 flex items-center justify-between px-6 bg-dark-900/50 backdrop-blur-md z-10">
                  <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setShowUserDetails(!showUserDetails)}>
                    <div className="relative">
                      <img src={getAvatar(selectedChat)} alt={selectedChat.username} className="w-10 h-10 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform" />
                      {onlineUsers.includes(selectedChat._id) && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-900 shadow-sm"></div>}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white group-hover:text-primary transition-colors">{selectedChat.username}</h2>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${onlineUsers.includes(selectedChat._id) ? 'text-green-500' : 'text-gray-500'}`}>
                          {onlineUsers.includes(selectedChat._id) ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 relative">
                    <button 
                      className={`text-gray-400 hover:text-white transition-colors ${showSearchInput ? 'text-primary' : ''}`}
                      onClick={() => setShowSearchInput(!showSearchInput)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors" onClick={() => setShowUserDetails(!showUserDetails)}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </button>
                    <div className="relative">
                      <button 
                        className="text-gray-400 hover:text-white transition-colors p-1"
                        onClick={() => setShowChatMenu(!showChatMenu)}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                        </svg>
                      </button>
                      {showChatMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-dark-900 border border-dark-600 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                          <button onClick={() => { setIsSelectMode(true); setShowChatMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 transition-colors">Select Messages</button>
                          <button onClick={handleClearChat} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 transition-colors border-b border-dark-600">Clear Chat</button>
                          <button onClick={handleBlockUser} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-700 transition-colors">{authUser.blockedUsers?.includes(selectedChat._id) ? 'Unblock User' : 'Block User'}</button>
                          <button onClick={() => { setShowReportModal(true); setShowChatMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-700 transition-colors">Report User</button>
                        </div>
                      )}
                    </div>
                  </div>
                </header>

                {showSearchInput && (
                  <div className="bg-dark-900/80 px-4 py-3 border-b border-dark-600 flex items-center gap-2 animate-in slide-in-from-top duration-300">
                    <input 
                      type="text" 
                      placeholder="Search messages..." 
                      className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                      value={msgSearchQuery}
                      onChange={(e) => setMsgSearchQuery(e.target.value)}
                    />
                    <button onClick={() => { setShowSearchInput(false); setMsgSearchQuery(''); }} className="text-gray-400 hover:text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                )}

                {isSelectMode && (
                  <div className="bg-primary/10 px-6 py-3 border-b border-primary/20 flex items-center justify-between text-primary font-bold text-sm animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-4">
                      <button onClick={() => { setIsSelectMode(false); setSelectedMessages([]); }} className="p-1 hover:bg-primary/20 rounded-full transition-colors">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                      <span>{selectedMessages.length} selected</span>
                    </div>
                    <button 
                      onClick={deleteSelectedMessages}
                      disabled={selectedMessages.length === 0}
                      className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs hover:bg-red-600 disabled:opacity-50 transition-all active:scale-95"
                    >
                      Delete Selected
                    </button>
                  </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-[0.98]">
                  {messages.length === 0 && (
                      <div className="flex justify-center items-center h-full">
                          <div className="bg-dark-900/80 backdrop-blur-sm border border-dark-600 px-6 py-2 rounded-full text-xs text-gray-400 font-medium">
                            No messages here yet. Say hello!
                          </div>
                      </div>
                  )}

                  {messages.filter(m => m.text?.toLowerCase().includes(msgSearchQuery.toLowerCase())).map((msg, index) => {
                      const isMe = msg.senderId === authUser?._id;
                      const isSelected = selectedMessages.includes(msg._id);
                      const msgDate = new Date(msg.createdAt);
                      const prevMsgDate = index > 0 ? new Date(messages[index-1].createdAt) : null;
                      const showDate = index === 0 || msgDate.toDateString() !== prevMsgDate?.toDateString();
                      
                      return (
                          <React.Fragment key={msg._id || index}>
                            {showDate && (
                              <div className="flex justify-center my-6">
                                <span className="bg-dark-900/60 backdrop-blur-sm px-4 py-1 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">{msgDate.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                              </div>
                            )}
                            <div className={`flex items-end gap-3 group/row ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {isSelectMode && (
                                  <div 
                                    onClick={() => toggleMessageSelection(msg._id)}
                                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 cursor-pointer transition-all flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-gray-600 hover:border-primary'}`}
                                  >
                                    {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                  </div>
                                )}
                                {!isMe && <img src={getAvatar(selectedChat)} alt="" className="w-6 h-6 rounded-full object-cover mb-1 border border-dark-600" />}
                                <div className={`max-w-[65%] group relative ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-4 py-2.5 text-sm shadow-xl transition-all hover:brightness-110 group/msg ${
                                        isMe 
                                        ? 'bg-primary text-white rounded-2xl rounded-br-none' 
                                        : 'bg-dark-900 border border-dark-600 text-gray-200 rounded-2xl rounded-bl-none'
                                    }`}>
                                        {isMe && (
                                          <button 
                                            onClick={() => deleteOneMessage(msg._id)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/msg:opacity-100 transition-opacity shadow-lg z-10"
                                          >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                          </button>
                                        )}
                                        {msg.fileUrl && (
                                          <div className="mb-2">
                                            {msg.fileType === 'image' ? (
                                              <img 
                                                src={`http://localhost:5000${msg.fileUrl}`} 
                                                alt="Shared content" 
                                                className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                                onClick={() => window.open(`http://localhost:5000${msg.fileUrl}`, '_blank')}
                                              />
                                            ) : (
                                              <a 
                                                href={`http://localhost:5000${msg.fileUrl}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-2 bg-dark-800/50 rounded-lg hover:bg-dark-700 transition-colors"
                                              >
                                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                <div className="flex-1 overflow-hidden">
                                                  <p className="text-[10px] font-bold truncate">File Attachment</p>
                                                  <p className="text-[8px] text-gray-400">Click to preview</p>
                                                </div>
                                              </a>
                                            )}
                                          </div>
                                        )}
                                        {msg.text}
                                        <div className={`text-[9px] mt-1 font-bold flex items-center gap-1 ${isMe ? 'text-blue-100 justify-end' : 'text-gray-500'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            {isMe && (
                                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth="2"/></svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                          </React.Fragment>
                      )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-dark-900/80 backdrop-blur-md border-t border-dark-600">
                  {authUser.blockedUsers?.includes(selectedChat._id) ? (
                    <div className="flex justify-center p-4">
                      <p className="text-red-400 font-bold text-xs uppercase tracking-widest">You have blocked this user. Unblock to send messages.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
                      <div className="flex-1 relative flex items-center bg-dark-700 rounded-2xl border border-dark-600 focus-within:border-primary transition-all pr-2">
                        <div className="relative">
                          <button 
                            type="button" 
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-3 text-gray-400 hover:text-primary transition-colors"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          </button>
                          {showEmojiPicker && (
                            <div className="absolute bottom-full left-0 mb-4 bg-dark-900 border border-dark-600 rounded-2xl p-4 shadow-2xl grid grid-cols-4 gap-2 z-50 w-48">
                              {emojis.map(e => (
                                <button 
                                  key={e} 
                                  type="button" 
                                  onClick={() => { setNewMessage(prev => prev + e); setShowEmojiPicker(false); }}
                                  className="text-xl hover:scale-125 transition-transform"
                                >
                                  {e}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input 
                          type="text" 
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..." 
                          className="w-full bg-transparent border-none text-sm text-white placeholder-gray-400 focus:ring-0 py-3 mt-1"
                        />
                        
                        <input 
                          type="file" 
                          id="fileInput" 
                          className="hidden" 
                          onChange={handleFileChange}
                          accept="image/*,application/pdf,.doc,.docx,.txt"
                        />
                        
                        <button 
                          type="button" 
                          onClick={() => document.getElementById('fileInput').click()}
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        </button>
                      </div>
                      <button type="submit" disabled={!newMessage.trim()} className="bg-primary hover:bg-primaryHover disabled:opacity-50 disabled:scale-100 text-white w-12 h-12 rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-primary/30 flex-shrink-0">
                        <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                      </button>
                    </form>
                  )}
                </div>
              </>
          ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-dark-800/50">
                <div className="w-24 h-24 bg-dark-700/50 rounded-full flex items-center justify-center mb-8 animate-pulse">
                    <svg className="w-12 h-12 text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03-8-9-8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Welcome to QuickiChat</h3>
                <p className="text-sm text-gray-400">Select a conversation to start messaging people around you.</p>
              </div>
          )}
        </div>

        {/* Right Sidebar - User Info (WhatsApp Style) */}
        {showUserDetails && selectedChat && (
          <aside className="w-80 border-l border-dark-600 bg-dark-900 flex flex-col flex-shrink-0 transition-all duration-300 animate-in slide-in-from-right-full h-full">
            <header className="h-[72px] border-b border-dark-600 flex items-center px-6 gap-6">
              <button onClick={() => setShowUserDetails(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <h3 className="font-bold text-white uppercase text-xs tracking-widest">Contact Info</h3>
            </header>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-8 text-center bg-dark-800/50">
                <img src={getAvatar(selectedChat)} alt="" className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-dark-700 shadow-2xl mb-6 hover:scale-105 transition-transform" />
                <h2 className="text-2xl font-bold text-white truncate">{selectedChat.username}</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">{selectedChat.email}</p>
              </div>

              <div className="p-6 space-y-8">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">About</h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-normal">
                    {selectedChat.bio || "No bio information available. This user is keeping it brief!"}
                  </p>
                </div>

                <div className="space-y-4">
                  <button onClick={handleClearChat} className="w-full flex items-center justify-between text-left p-4 rounded-xl hover:bg-dark-700 transition-colors group">
                    <div className="flex items-center gap-4">
                       <svg className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       <span className="text-sm font-semibold text-gray-300">Clear Chat</span>
                    </div>
                  </button>
                  <button onClick={handleBlockUser} className="w-full flex items-center justify-between text-left p-4 rounded-xl hover:bg-dark-700 transition-colors group text-red-400">
                    <div className="flex items-center gap-4">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                       <span className="text-sm font-bold">{authUser.blockedUsers?.includes(selectedChat._id) ? 'Unblock User' : 'Block User'}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
        {/* Report User Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-center">
             <div className="bg-dark-900 border border-dark-600 rounded-[2rem] max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Report {selectedChat?.username}</h3>
                <p className="text-sm text-gray-400 mb-8">Please describe the issue with this user. This report will be reviewed by our moderation team.</p>
                <textarea 
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Tell us what happened..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-xl p-4 text-sm text-white h-32 mb-8 focus:outline-none focus:border-red-500 transition-colors placeholder-gray-500 resize-none"
                />
                <div className="flex gap-4">
                  <button onClick={() => setShowReportModal(false)} className="flex-1 bg-dark-700 hover:bg-dark-600 text-white font-bold py-3 rounded-xl transition-all">Cancel</button>
                  <button onClick={handleReportUser} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95">Submit Report</button>
                </div>
             </div>
          </div>
        )}
      </main>
      
    </div>
  );
};

export default ChatDashboard;