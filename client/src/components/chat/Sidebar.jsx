import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Search, Settings, LogOut, MoreVertical, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { useUIStore } from '../../store/useUIStore';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { conversations, setConversations, activeConversation, setActiveConversation, onlineUsers } = useChatStore();
  const { sidebarOpen } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p._id !== user?._id);
    const name = conv.isGroup ? conv.groupName : otherParticipant?.username;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!sidebarOpen) return null;

  return (
    <motion.aside 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-80 border-r border-glass-border bg-background-secondary flex flex-col h-full z-20"
    >
      {/* Profile Header */}
      <div className="p-4 flex items-center justify-between border-b border-glass-border bg-background-tertiary/30 backdrop-blur-md">
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
        <div className="flex items-center gap-1">
          <button className="p-2 text-text-secondary hover:text-accent transition-colors hover:bg-white/5 rounded-lg">
            <Plus size={20} />
          </button>
          <button className="p-2 text-text-secondary hover:text-accent transition-colors hover:bg-white/5 rounded-lg">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" size={18} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-background-tertiary/50 border border-glass-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
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
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                    isActive 
                    ? 'bg-accent/10 border border-accent/20' 
                    : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img 
                      src={otherParticipant?.avatar || `https://ui-avatars.com/api/?name=${otherParticipant?.username}&background=random`} 
                      className="w-12 h-12 rounded-full object-cover shadow-lg"
                      alt={otherParticipant?.username}
                    />
                    {isOnline && (
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
                      {conv.lastMessage?.text || "No messages yet"}
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
      <div className="p-4 border-t border-glass-border bg-background-tertiary/10 backdrop-blur-sm flex items-center justify-between">
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
    </motion.aside>
  );
};

export default Sidebar;
