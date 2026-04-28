import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, Info, Send, Smile, Paperclip, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { useSocketStore } from '../../store/useSocketStore';
import MessageBubble from './MessageBubble';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ChatWindow = () => {
  const user = useAuthStore(state => state.user);
  const { activeConversation, messages, setMessages, addMessage, onlineUsers, typingUsers } = useChatStore();
  const socket = useSocketStore(state => state.socket);
  const [messageInput, setMessageInput] = useState('');
  const scrollRef = useRef();
  const typingTimeoutRef = useRef();

  const otherParticipant = activeConversation?.participants.find(p => p._id !== user._id);
  const isOnline = onlineUsers.includes(otherParticipant?._id);
  const isTyping = typingUsers[activeConversation?._id]?.includes(otherParticipant?._id);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation?._id) return;
      try {
        const { data } = await api.get(`/messages/${activeConversation._id}`);
        setMessages(data);
        // Join conversation room
        if (socket) {
          socket.emit('joinChat', activeConversation._id);
        }
      } catch (err) {
        toast.error('Failed to load messages');
      }
    };
    fetchMessages();
  }, [activeConversation?._id, setMessages, socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;

    try {
      const { data } = await api.post('/messages/send', {
        text: messageInput,
        conversationId: activeConversation._id,
        receiverId: otherParticipant?._id
      });
      addMessage(data);
      setMessageInput('');
      socket.emit('typingStop', { conversationId: activeConversation._id, userId: user._id });
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (!socket || !activeConversation) return;

    socket.emit('typingStart', { conversationId: activeConversation._id, userId: user._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typingStop', { conversationId: activeConversation._id, userId: user._id });
    }, 3000);
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background-primary relative p-10 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mb-6"
        >
          <MessageSquare className="text-accent w-10 h-10" />
        </motion.div>
        <h3 className="text-2xl font-bold text-text-primary">QuickChat Web</h3>
        <p className="text-text-secondary mt-2 max-w-xs">
          Send and receive messages without keeping your phone online.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background-primary relative">
      {/* Header */}
      <header className="h-16 border-b border-glass-border flex items-center justify-between px-6 bg-background-secondary/50 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={otherParticipant?.avatar || `https://ui-avatars.com/api/?name=${otherParticipant?.username}&background=random`} 
              className="w-10 h-10 rounded-full object-cover"
              alt="Avatar"
            />
            {isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background-secondary"></div>}
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              {activeConversation.isGroup ? activeConversation.groupName : otherParticipant?.username}
            </h3>
            <p className="text-[10px] text-text-secondary font-medium uppercase tracking-tighter">
              {isOnline ? 'Active Now' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-text-secondary hover:text-accent transition-colors"><Phone size={20} /></button>
          <button className="p-2 text-text-secondary hover:text-accent transition-colors"><Video size={20} /></button>
          <button className="p-2 text-text-secondary hover:text-accent transition-colors"><Info size={20} /></button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <MessageBubble 
              key={msg._id || index} 
              message={msg} 
              isMe={msg.senderId === user._id} 
            />
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center text-xs text-text-secondary italic ml-2"
          >
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-text-secondary rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-text-secondary rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-text-secondary rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            {otherParticipant?.username} is typing...
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background-secondary/30 backdrop-blur-xl border-t border-glass-border">
        <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="flex-1 bg-background-tertiary border border-glass-border rounded-2xl flex items-center px-4 py-1.5 focus-within:ring-2 focus-within:ring-accent/30 transition-all">
            <button type="button" className="p-2 text-text-secondary hover:text-accent transition-colors">
              <Smile size={22} />
            </button>
            <input 
              type="text"
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none text-sm text-text-primary placeholder:text-zinc-600 focus:ring-0 py-2.5"
            />
            <button type="button" className="p-2 text-text-secondary hover:text-accent transition-colors">
              <Paperclip size={22} />
            </button>
          </div>
          <button 
            type="submit"
            disabled={!messageInput.trim()}
            className="bg-accent hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-accent text-white p-3.5 rounded-2xl shadow-lg shadow-accent/25 transition-all active:scale-95"
          >
            <Send size={22} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
