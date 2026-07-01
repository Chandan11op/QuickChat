import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useSocketStore } from "./store/useSocketStore";
import { useChatStore } from "./store/useChatStore";
import { Toaster } from "react-hot-toast";
import { useUIStore } from "./store/useUIStore";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatDashboard from "./pages/ChatDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function App() {
  const user = useAuthStore((state) => state.user);
  const { connect, disconnect, socket } = useSocketStore();
  const { addMessage, updateOnlineUsers, setTyping, updateConversationLastMessage } = useChatStore();
  const { theme, accentColor } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }

    root.style.setProperty("--accent", accentColor);

    if (accentColor.startsWith("#")) {
      const r = parseInt(accentColor.slice(1, 3), 16);
      const g = parseInt(accentColor.slice(3, 5), 16);
      const b = parseInt(accentColor.slice(5, 7), 16);
      root.style.setProperty("--accent-glow", `rgba(${r}, ${g}, ${b}, 0.4)`);
    }
  }, [theme, accentColor]);
  
  useEffect(() => {
    if (user?._id) {
      connect(user._id);
    } else {
      disconnect();
    }
  }, [user?._id, connect, disconnect]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message) => {
      addMessage(message);
      updateConversationLastMessage(message.conversationId, message);
    });

    socket.on("getOnlineUsers", (users) => {
      updateOnlineUsers(users);
    });

    socket.on("userStatusUpdate", ({ userId, status }) => {
      // Logic handled by getOnlineUsers mostly, but can be used for granular updates
    });

    socket.on("typingStart", ({ conversationId, userId }) => {
      setTyping(conversationId, userId, true);
    });

    socket.on("typingStop", ({ conversationId, userId }) => {
      setTyping(conversationId, userId, false);
    });

    socket.on("newConversationMessage", ({ conversationId, message }) => {
      updateConversationLastMessage(conversationId, message);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("getOnlineUsers");
      socket.off("userStatusUpdate");
      socket.off("typingStart");
      socket.off("typingStop");
      socket.off("newConversationMessage");
    };
  }, [socket, addMessage, updateOnlineUsers, setTyping, updateConversationLastMessage]);

  return (
    <div className="min-h-screen bg-background-primary">
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/chat" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/chat" /> : <Register />} />
          <Route path="/chat" element={user ? <ChatDashboard /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
          <Route path="/settings" element={user ? <Settings /> : <Navigate to="/" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;