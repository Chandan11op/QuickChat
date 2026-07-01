import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, Tag, ArrowRight, Loader2, Sparkles, CheckCircle2, RefreshCw, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

const Register = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    contactNumber: '',
    dob: ''
  });

  const [loading, setLoading] = useState(false);
  const [generatingOtp, setGeneratingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [smsNotification, setSmsNotification] = useState({ visible: false, otp: '' });

  // Generate CAPTCHA code
  const generateCaptchaText = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Draw CAPTCHA on Canvas
  const drawCaptcha = (code) => {
    const canvas = document.getElementById("captchaCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#1e1b4b"; // Dark indigo background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid / Noise lines
    for (let i = 0; i < 8; i++) {
      ctx.strokeStyle = `rgba(99, 102, 241, ${Math.random() * 0.4 + 0.1})`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Text configuration
    ctx.font = "italic bold 26px sans-serif";
    ctx.textBaseline = "middle";

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      ctx.fillStyle = `hsl(${Math.random() * 360}, 80%, 75%)`;
      ctx.save();
      // Translate to character position with some vertical jitter
      ctx.translate(15 + i * 22, canvas.height / 2 + (Math.random() * 8 - 4));
      ctx.rotate((Math.random() * 30 - 15) * Math.PI / 180);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  };

  const handleRefreshCaptcha = () => {
    const newCode = generateCaptchaText();
    setCaptchaText(newCode);
  };

  useEffect(() => {
    const newCode = generateCaptchaText();
    setCaptchaText(newCode);
  }, []);

  useEffect(() => {
    if (captchaText) {
      drawCaptcha(captchaText);
    }
  }, [captchaText]);

  // Username validator: alphanumeric, underscore, full-stop only
  const handleUsernameChange = (e) => {
    const val = e.target.value;
    // Allow typing only matching characters
    const filtered = val.replace(/[^a-zA-Z0-9_.]/g, '');
    setFormData({ ...formData, username: filtered });
  };

  const handleGenerateOtp = async () => {
    const { username, email, password, confirmPassword, fullName, contactNumber, dob } = formData;

    if (!fullName.trim()) return toast.error("Full Name is required");
    if (!contactNumber.trim()) return toast.error("Contact Number is required");
    if (!email.trim()) return toast.error("Email is required");
    if (!dob) return toast.error("Date of Birth is required");
    
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!username.trim()) {
      return toast.error("Username is required");
    }
    if (!usernameRegex.test(username)) {
      return toast.error("Username can only contain letters, numbers, underscores, and full-stops.");
    }
    if (username.length < 3) {
      return toast.error("Username must be at least 3 characters");
    }

    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    // CAPTCHA validation
    if (captchaInput !== captchaText) {
      handleRefreshCaptcha();
      setCaptchaInput('');
      return toast.error("Incorrect CAPTCHA code. Please try again.");
    }

    setGeneratingOtp(true);
    try {
      const { data } = await api.post('/auth/generate-otp', {
        contactNumber,
        email,
        username
      });

      setOtpSent(true);
      toast.success("OTP sent to your contact number!");
      
      // Trigger floating SMS notification mockup
      setSmsNotification({ visible: true, otp: data.otp });

      // Automatically hide simulated SMS notification after 15 seconds
      setTimeout(() => {
        setSmsNotification(prev => ({ ...prev, visible: false }));
      }, 15000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate OTP');
    } finally {
      setGeneratingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpSent) {
      return toast.error("Please click Generate OTP and enter the code sent to your SMS.");
    }
    if (!otpInput.trim()) {
      return toast.error("Please enter the verification OTP");
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        ...formData,
        otp: otpInput
      });

      setAuth(data.user, data.token);
      toast.success(`Account created! Welcome, ${data.user.username}!`);
      setSmsNotification({ visible: false, otp: '' });
      navigate('/chat');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary p-4 overflow-y-auto relative py-12">
      {/* Animated Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] right-[-10%] w-[50%] h-[60%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[60%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" 
      />

      {/* Simulated Premium SMS Notification Popup */}
      <AnimatePresence>
        {smsNotification.visible && (
          <motion.div
            initial={{ opacity: 0, y: -80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-sm z-50 px-4"
          >
            <div className="bg-zinc-900/95 border border-white/10 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md flex gap-3.5 items-start">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Messages</span>
                  <span className="text-[10px] text-zinc-500">now</span>
                </div>
                <h4 className="text-xs font-semibold text-zinc-300">QuickChat OTP Gateway</h4>
                <p className="text-sm text-zinc-100 mt-1 font-medium bg-zinc-800/40 p-2 rounded-lg border border-white/5">
                  Your verification code is <strong className="text-accent text-base tracking-widest px-1 font-mono">{smsNotification.otp}</strong>. It expires in 5 mins. Do not share it.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="glass-card-premium p-6 sm:p-8 neon-glow relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-3xl" />
          
          <div className="text-center mb-6 relative z-10">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, delay: 0.2 }}
              className="w-14 h-14 bg-gradient-to-tr from-accent/20 to-purple-500/20 backdrop-blur-md rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-white/10 overflow-hidden"
            >
              <img src={logo} alt="QuickChat Logo" className="w-9 h-9 object-contain" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Create Account</h1>
            <p className="text-text-secondary text-xs mt-1">Join QuickChat and send messages securely</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            
            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-text-secondary group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-background-tertiary/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Username</label>
                  <span className="text-[9px] text-zinc-500">letters, numbers, _, .</span>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="w-4 h-4 text-text-secondary group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={formData.username}
                    onChange={handleUsernameChange}
                    placeholder="john.doe_12"
                    className="w-full bg-background-tertiary/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest ml-1">Email Id</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-text-secondary group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-background-tertiary/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest ml-1">Contact Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-text-secondary group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type="tel" 
                    required
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-background-tertiary/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest ml-1">Date of Birth</label>
                <div className="relative group">
                  <input 
                    type="date" 
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-background-tertiary/50 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest ml-1">Create Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-text-secondary group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-background-tertiary/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-text-secondary group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-background-tertiary/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Captcha Box */}
            <div className="bg-background-tertiary/40 border border-white/10 rounded-2xl p-4 mt-2">
              <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest ml-1 block mb-2">Security Verification (CAPTCHA)</label>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="flex gap-2 items-center w-full sm:w-auto">
                  <canvas 
                    id="captchaCanvas" 
                    width="160" 
                    height="42" 
                    data-captcha={captchaText}
                    className="rounded-lg border border-white/10 shadow-inner"
                  />
                  <button 
                    type="button" 
                    onClick={handleRefreshCaptcha}
                    className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-white/5 transition-all"
                    title="Refresh CAPTCHA"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="Enter CAPTCHA code"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="flex-1 w-full bg-background-tertiary/60 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all font-mono"
                />
              </div>
            </div>

            {/* OTP Generation and Trigger */}
            <div className="mt-4 pt-2">
              {!otpSent ? (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleGenerateOtp}
                  disabled={generatingOtp}
                  className="w-full bg-gradient-to-r from-accent to-purple-600 hover:from-accent hover:to-purple-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(99,102,241,0.25)] border border-white/10"
                >
                  {generatingOtp ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      Generating OTP...
                    </>
                  ) : (
                    <>
                      Generate OTP <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-semibold text-accent uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> OTP Sent via SMS
                      </label>
                      <button 
                        type="button" 
                        onClick={handleGenerateOtp} 
                        className="text-[10px] text-zinc-400 hover:text-white transition-colors underline"
                      >
                        Resend OTP
                      </button>
                    </div>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter 6-digit OTP code"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      maxLength={6}
                      className="w-full bg-background-tertiary/80 border-2 border-accent/40 rounded-xl py-3 px-4 text-white text-center text-lg font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all font-mono"
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.25)] border border-white/10"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Complete Registration <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </div>

          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center relative z-10">
            <p className="text-text-secondary text-xs">
              Already have an account?{' '}
              <Link to="/" className="text-white font-semibold hover:text-accent transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;