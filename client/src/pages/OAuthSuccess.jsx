import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/SocketContext.jsx';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthUser } = useAuthContext();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update context
        setAuthUser(user);
        
        // Redirect to chat
        navigate('/chat');
      } catch (err) {
        console.error('Error parsing OAuth user data:', err);
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [location, navigate, setAuthUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">Completing sign in...</h2>
        <p className="text-gray-400 mt-2">Please wait while we set up your session.</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
