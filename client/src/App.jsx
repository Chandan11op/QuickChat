import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OAuthSuccess from "./pages/OAuthSuccess";

import ChatDashboard from "./pages/ChatDashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useAuthContext } from "./context/SocketContext";

function App() {
  const { authUser } = useAuthContext();
  
  return (
    <div className="min-h-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={authUser ? <Navigate to="/chat" /> : <Login />} />
          <Route path="/register" element={authUser ? <Navigate to="/chat" /> : <Register />} />
          <Route path="/forgot" element={authUser ? <Navigate to="/chat" /> : <ForgotPassword />} />
          <Route path="/reset" element={authUser ? <Navigate to="/chat" /> : <ResetPassword />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/chat" element={authUser ? <ChatDashboard /> : <Navigate to="/" />} />
          <Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/" />} />
          <Route path="/edit-profile" element={authUser ? <EditProfile /> : <Navigate to="/" />} />
          <Route path="/settings" element={authUser ? <Settings /> : <Navigate to="/" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;