import { create } from "zustand";

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  typingUsers: {}, // { conversationId: [userIds] }
  onlineUsers: [],

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (conversation) => set({ activeConversation: conversation, messages: [] }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  updateOnlineUsers: (users) => set({ onlineUsers: users }),
  
  updateConversationLastMessage: (conversationId, message) => set((state) => {
    const updatedConversations = state.conversations.map(conv => {
      if (conv._id === conversationId) {
        return { 
          ...conv, 
          lastMessage: { ...conv.lastMessage, text: message.content || message.text }, // Map content/text correctly
          updatedAt: message.createdAt 
        };
      }
      return conv;
    });
    // Sort conversations by most recently updated
    return {
      conversations: updatedConversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    };
  }),
  
  setTyping: (conversationId, userId, isTyping) => set((state) => {
    const currentTyping = state.typingUsers[conversationId] || [];
    const updatedTyping = isTyping 
      ? [...new Set([...currentTyping, userId])]
      : currentTyping.filter(id => id !== userId);
    
    return {
      typingUsers: { ...state.typingUsers, [conversationId]: updatedTyping }
    };
  }),

  updateMessageStatus: (messageId, status) => set((state) => ({
    messages: state.messages.map(m => m._id === messageId ? { ...m, status } : m)
  }))
}));
