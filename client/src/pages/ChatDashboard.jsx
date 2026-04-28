import React, { useEffect } from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useSocketStore } from '../store/useSocketStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const ChatDashboard = () => {
  const user = useAuthStore(state => state.user);
  const { setConversations, setOnlineUsers, addMessage, setTyping, onlineUsers } = useChatStore();
  const { connect, disconnect, socket } = useSocketStore();

  // Fetch initial data
  useEffect(() => {
    const initData = async () => {
      try {
        const { data } = await api.get('/messages/conversations');
        setConversations(data);
      } catch (err) {
        toast.error('Failed to load chats');
      }
    };
    initData();
  }, [setConversations]);

  // Handle Socket Connection
  useEffect(() => {
    if (user?._id) {
      connect(user._id);
    }
    return () => disconnect();
  }, [user?._id, connect, disconnect]);

  // Listen for global events
  useEffect(() => {
    if (!socket) return;

    socket.on('getOnlineUsers', (users) => {
      setOnlineUsers(users);
    });

    socket.on('receiveMessage', (message) => {
      addMessage(message);
      // Play sound or show notification if not active
    });

    socket.on('typingStart', ({ conversationId, userId }) => {
      setTyping(conversationId, userId, true);
    });

    socket.on('typingStop', ({ conversationId, userId }) => {
      setTyping(conversationId, userId, false);
    });

    return () => {
      socket.off('getOnlineUsers');
      socket.off('receiveMessage');
      socket.off('typingStart');
      socket.off('typingStop');
    };
  }, [socket, addMessage, setOnlineUsers, setTyping]);

  return (
    <div className="flex h-screen bg-background-primary text-text-primary overflow-hidden">
      <Sidebar />
      <ChatWindow />
    </div>
  );
};

export default ChatDashboard;