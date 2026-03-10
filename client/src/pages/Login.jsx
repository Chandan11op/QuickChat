import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../context/SocketContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuthContext();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      
      // Store token and user info
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setAuthUser(res.data.user);
      
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-dark-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-wide">QuickChat</span>
        </div>
        <div className="text-gray-400 text-sm hidden sm:block">
          Secure Enterprise Messaging
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Login to your account to continue your conversations</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-gray-400 tracking-wider mb-2 uppercase">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@company.com" 
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 tracking-wider mb-2 uppercase">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••" 
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl py-3 pl-11 pr-11 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400 cursor-pointer hover:text-gray-300">
                <input type="checkbox" className="w-4 h-4 bg-dark-900 border-dark-600 rounded focus:ring-primary text-primary" />
                <span className="ml-2">Remember me</span>
              </label>
              <Link to="/forgot" className="text-primary hover:text-primaryHover font-medium transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2"
            >
              {loading ? 'Logging in...' : 'Login'}
              {!loading && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              )}
            </button>
          </form>

          <div className="mt-8 relative flex items-center justify-center">
            <div className="border-t border-dark-600 w-full absolute"></div>
            <span className="bg-dark-800 px-4 text-xs text-gray-500 uppercase z-10">Or continue with</span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 px-4 bg-dark-900 border border-dark-600 rounded-xl text-white hover:bg-dark-700 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 bg-dark-900 border border-dark-600 rounded-xl text-white hover:bg-dark-700 transition-colors">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              SSO
            </button>
          </div>

          <p className="mt-8 text-center text-gray-400">
            Don't have an account? <Link to="/register" className="text-primary hover:text-primaryHover font-medium transition-colors">Register now</Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-gray-500 font-medium flex justify-center gap-6">
        <span>© 2024 QuickChat Inc.</span>
        <a href="#" className="hover:text-gray-300">Privacy Policy</a>
        <a href="#" className="hover:text-gray-300">Terms of Service</a>
        <a href="#" className="hover:text-gray-300">Help Center</a>
      </footer>
    </div>
  );
};

export default Login;