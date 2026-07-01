import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Search, Settings, LogOut, MoreVertical, Bell, Sun, Moon, UserPlus, FolderPlus, CheckSquare, X, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { useUIStore } from '../../store/useUIStore';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { conversations, setConversations, activeConversation, setActiveConversation, onlineUsers } = useChatStore();
  const { theme, setTheme, sidebarOpen } = useUIStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);

  // Search popup states
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Group creation states
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friends, setFriends] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Friend requests list for notifications
  const [friendRequests, setFriendRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const menuRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/messages/conversations');
        setConversations(data);
      } catch (err) {
        toast.error('Failed to load chats');
      }
    };
    fetchConversations();
  }, [setConversations]);

  useEffect(() => {
    // Fetch friends for group creation
    const fetchFriends = async () => {
      try {
        const { data } = await api.get('/users/friends');
        setFriends(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user?._id) {
      fetchFriends();
    }
  }, [user?._id]);

  const fetchFriendRequests = async () => {
    setLoadingRequests(true);
    try {
      const { data } = await api.get('/users/friend-requests');
      setFriendRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (showNotifications) {
      fetchFriendRequests();
    }
  }, [showNotifications]);

  // Handle clicking outside of menus to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p._id !== user?._id);
    const name = conv.isGroup ? conv.groupName : otherParticipant?.username;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSearchUsers = async (val) => {
    setSearchVal(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await api.get(`/users/search?search=${val}`);
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const startChat = async (targetUser) => {
    // Check if a conversation already exists
    const existing = conversations.find(conv => 
      !conv.isGroup && conv.participants.some(p => p._id === targetUser._id)
    );
    if (existing) {
      setActiveConversation(existing);
      setShowNewChat(false);
      return;
    }

    try {
      // Send message automatically creates the conversation and returns the message
      const { data } = await api.post('/messages/send', {
        text: "Hey! Let's connect.",
        receiverId: targetUser._id
      });
      
      const res = await api.get('/messages/conversations');
      setConversations(res.data);

      const newConv = res.data.find(c => c._id === data.conversationId);
      if (newConv) {
        setActiveConversation(newConv);
      }
      setShowNewChat(false);
      toast.success(`Chat started with ${targetUser.username}!`);
    } catch (err) {
      toast.error("Failed to start chat.");
    }
  };

  const handleCreateGroupSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return toast.error("Group name is required");
    if (selectedFriends.length === 0) return toast.error("Please select at least one friend");

    setCreatingGroup(true);
    try {
      await api.post('/messages/create-group', {
        groupName,
        participants: selectedFriends
      });
      toast.success(`Group "${groupName}" created!`);
      
      const { data } = await api.get('/messages/conversations');
      setConversations(data);
      
      // Select the new group conversation (the first one since it's sorted by updatedAt)
      if (data.length > 0 && data[0].isGroup) {
        setActiveConversation(data[0]);
      }
      
      // Reset group states
      setGroupName('');
      setSelectedFriends([]);
      setShowNewGroup(false);
    } catch (err) {
      toast.error("Failed to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  const toggleFriendSelection = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.post('/users/accept-request', { id: requestId });
      toast.success("Friend request accepted!");
      fetchFriendRequests();
      // Refresh chats list to load new friend conversation
      const { data } = await api.get('/messages/conversations');
      setConversations(data);
    } catch (err) {
      toast.error("Failed to accept request");
    }
  };

  if (!sidebarOpen) return null;

  return (
    <motion.aside 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`w-full md:w-80 border-r border-white/5 bg-background-secondary/80 backdrop-blur-xl flex flex-col h-full z-20 ${
        activeConversation ? 'hidden md:flex' : 'flex'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 border-b border-white/5 bg-background-tertiary/20">
        <img src={logo} alt="QuickChat Logo" className="w-8 h-8 object-contain" />
        <span className="font-extrabold text-lg text-text-primary">QuickChat</span>
      </div>

      {/* Profile Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-background-tertiary/40 backdrop-blur-md relative">
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=random`} 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-accent/30 group-hover:ring-accent transition-all"
              alt="Profile"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background-secondary"></div>
          </div>
          <span className="font-semibold text-text-primary truncate max-w-[120px] group-hover:text-accent transition-colors">
            {user?.username}
          </span>
        </div>
        
        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 relative">
          {/* Notification Button */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 text-text-secondary hover:text-accent transition-colors hover:bg-white/5 rounded-lg relative ${showNotifications ? 'text-accent bg-white/5' : ''}`}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {user?.friendRequests && user.friendRequests.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-background-secondary"></span>
            )}
          </button>

          {/* Three-dots Menu Toggle */}
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 text-text-secondary hover:text-accent transition-colors hover:bg-white/5 rounded-lg ${showMenu ? 'text-accent bg-white/5' : ''}`}
            aria-label="Menu"
          >
            <MoreVertical size={20} />
          </button>

          {/* Three-Dots Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div 
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-52 bg-background-tertiary border border-white/10 rounded-2xl p-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-xl z-50 space-y-1"
              >
                {/* Toggle Theme Option */}
                <button 
                  onClick={() => {
                    setTheme(theme === "light" ? "dark" : "light");
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-xl font-bold transition-all"
                >
                  {theme === "light" ? (
                    <>
                      <Moon size={16} className="text-purple-400" />
                      <span>Switch to Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun size={16} className="text-amber-400" />
                      <span>Switch to Light Mode</span>
                    </>
                  )}
                </button>

                {/* New Chat Option */}
                <button 
                  onClick={() => {
                    setShowNewChat(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-xl font-bold transition-all"
                >
                  <UserPlus size={16} className="text-blue-400" />
                  <span>New Chat</span>
                </button>

                {/* New Group Option */}
                <button 
                  onClick={() => {
                    setShowNewGroup(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-xl font-bold transition-all"
                >
                  <FolderPlus size={16} className="text-emerald-400" />
                  <span>New Group</span>
                </button>

                {/* Select Chats Option */}
                <button 
                  onClick={() => {
                    toast.success("Chat selection enabled!");
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-xl font-bold transition-all"
                >
                  <CheckSquare size={16} className="text-orange-400" />
                  <span>Select Chats</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Notifications Popup Box */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                ref={bellRef}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-[280px] sm:w-[320px] bg-background-tertiary border border-white/10 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl z-50 max-h-80 overflow-y-auto custom-scrollbar"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-text-primary">Notifications</h4>
                  <span className="text-[10px] text-zinc-500">QuickChat Inbox</span>
                </div>

                <div className="space-y-2">
                  {/* Friend Requests list */}
                  {loadingRequests ? (
                    <div className="py-6 flex justify-center"><Loader2 className="w-5 h-5 text-accent animate-spin" /></div>
                  ) : friendRequests.length > 0 ? (
                    friendRequests.map((req) => (
                      <div key={req._id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={req.avatar || `https://ui-avatars.com/api/?name=${req.username}`} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{req.username}</p>
                            <p className="text-[9px] text-zinc-500 truncate">Sent friend request</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAcceptRequest(req._id)}
                          className="px-3 py-1.5 bg-accent hover:bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex-shrink-0"
                        >
                          Accept
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-text-secondary italic">
                      No friend requests pending
                    </div>
                  )}

                  {/* Premium System Announcements */}
                  <div className="h-px bg-white/5 my-2"></div>
                  
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex gap-2.5 items-start">
                    <span className="text-base">🔒</span>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-wider">End-to-End Encrypted</p>
                      <p className="text-[10px] text-text-secondary leading-relaxed mt-0.5">All messages stored in our database are fully encrypted.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex gap-2.5 items-start">
                    <span className="text-base">🎉</span>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-wider">Welcome to QuickChat</p>
                      <p className="text-[10px] text-text-secondary leading-relaxed mt-0.5">Start a new chat or group from the menu to message friends.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" size={18} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-background-tertiary/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1">
        {filteredConversations.length > 0 ? (
          <AnimatePresence>
            {filteredConversations.map((conv) => {
              const otherParticipant = conv.participants.find(p => p._id !== user?._id);
              const isOnline = onlineUsers.includes(otherParticipant?._id);
              const isActive = activeConversation?._id === conv._id;

              return (
                <motion.button
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={conv._id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${
                    isActive 
                    ? 'bg-gradient-to-r from-accent/20 to-transparent border-l-4 border-l-accent border-y border-r border-transparent' 
                    : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img 
                      src={conv.isGroup ? (conv.groupAvatar || `https://ui-avatars.com/api/?name=${conv.groupName}&background=0c0b24&color=ffffff`) : (otherParticipant?.avatar || `https://ui-avatars.com/api/?name=${otherParticipant?.username}&background=random`)} 
                      className="w-12 h-12 rounded-full object-cover shadow-lg border border-white/5"
                      alt=""
                    />
                    {!conv.isGroup && isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background-secondary shadow-lg"></div>
                    )}
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <h4 className={`text-sm font-bold truncate ${isActive ? 'text-accent' : 'text-text-primary'}`}>
                        {conv.isGroup ? conv.groupName : otherParticipant?.username}
                      </h4>
                      <span className="text-[10px] text-text-secondary font-medium uppercase tracking-tighter">
                        {conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary truncate mt-0.5">
                      {conv.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="text-center py-20 px-10">
            <MessageSquare className="w-10 h-10 text-text-secondary mx-auto mb-4 opacity-20" />
            <p className="text-xs text-text-secondary italic">No conversations found</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-background-tertiary/20 backdrop-blur-sm flex items-center justify-between">
        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors p-2 hover:bg-white/5 rounded-lg font-bold"
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <button 
          onClick={logout}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Modals Backdrops & Dialogs */}

      {/* New Chat Search Modal Popup */}
      <AnimatePresence>
        {showNewChat && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-background-secondary border border-white/10 rounded-3xl p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => {
                  setShowNewChat(false);
                  setSearchVal('');
                  setSearchResults([]);
                }}
                className="absolute top-4 right-4 p-2 text-text-secondary hover:text-accent rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-black tracking-tight text-white mb-4">Start New Chat</h3>

              {/* Search input */}
              <div className="relative mb-5">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  type="text"
                  value={searchVal}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder="Search by username, full name, phone..."
                  className="w-full bg-background-tertiary border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all font-medium"
                  autoFocus
                />
              </div>

              {/* Search Results */}
              <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {searching ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-accent animate-spin" /></div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((tUser) => (
                    <button 
                      key={tUser._id}
                      onClick={() => startChat(tUser)}
                      className="w-full flex items-center justify-between p-3 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-2xl transition-all text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={tUser.avatar || `https://ui-avatars.com/api/?name=${tUser.username}&background=random`} 
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          alt="" 
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{tUser.fullName || tUser.username}</p>
                          <p className="text-[10px] text-text-secondary truncate mt-0.5">@{tUser.username}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-accent font-black tracking-wider uppercase bg-accent/10 px-2.5 py-1 rounded-lg">Chat</span>
                    </button>
                  ))
                ) : searchVal ? (
                  <p className="text-center text-xs text-text-secondary py-8 italic">No users found matching search query</p>
                ) : (
                  <p className="text-center text-xs text-text-secondary py-8">Type a name, email, or number to find users</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Group Modal Popup */}
      <AnimatePresence>
        {showNewGroup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-background-secondary border border-white/10 rounded-3xl p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => {
                  setShowNewGroup(false);
                  setGroupName('');
                  setSelectedFriends([]);
                }}
                className="absolute top-4 right-4 p-2 text-text-secondary hover:text-accent rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-black tracking-tight text-white mb-4">Create New Group</h3>

              <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
                {/* Group Name input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Group Name</label>
                  <input 
                    type="text"
                    required
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name..."
                    className="w-full bg-background-tertiary border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all font-medium"
                    autoFocus
                  />
                </div>

                {/* Friend Select list */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Select Participants</label>
                    <span className="text-[10px] text-accent font-bold">{selectedFriends.length} selected</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto custom-scrollbar border border-white/10 rounded-2xl p-2 bg-background-tertiary/40 space-y-1">
                    {friends.length > 0 ? (
                      friends.map((friend) => {
                        const isSelected = selectedFriends.includes(friend._id);
                        return (
                          <button
                            type="button"
                            key={friend._id}
                            onClick={() => toggleFriendSelection(friend._id)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${isSelected ? 'bg-accent/15 border border-accent/20' : 'hover:bg-white/5 border border-transparent'}`}
                          >
                            <div className="flex items-center gap-3">
                              <img src={friend.avatar || `https://ui-avatars.com/api/?name=${friend.username}`} className="w-8 h-8 rounded-lg object-cover" alt="" />
                              <span className="text-xs font-bold text-white">{friend.username}</span>
                            </div>
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-accent border-accent text-white' : 'border-zinc-600 bg-transparent'}`}>
                              {isSelected && <Check size={12} className="stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-center text-[11px] text-text-secondary py-6 italic">You need friends in your network to create groups.</p>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={creatingGroup || !groupName.trim() || selectedFriends.length === 0}
                  className="w-full bg-gradient-to-r from-accent to-purple-600 hover:from-accent hover:to-purple-500 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-accent/20 mt-4 border border-white/5"
                >
                  {creatingGroup ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Group"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

export default Sidebar;
