import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import BackButton from "../components/BackButton";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Placeholder for Supabase Auth logic
    setTimeout(() => {
      setIsLoading(false);
      // alert(isLogin ? "Logged in successfully!" : "Account created successfully!");
      // navigate("/dashboard"); 
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex selection:bg-[#C5A059] selection:text-black">
      <BackButton />

      {/* LEFT SIDE: Cinematic Image (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/suv.webp" // Feel free to swap with an interior car shot!
            alt="Luxury Fleet" 
            className="w-full h-full object-cover opacity-40 scale-105"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000"; }}
          />
          {/* Heavy gradients to blend image smoothly into the dark theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/50 via-transparent to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-md text-left px-12">
          <ShieldCheck size={48} className="text-[#C5A059] mb-8 opacity-80" />
          <span className="text-[#C5A059] font-bold tracking-[.3em] text-[10px] uppercase mb-4 block">
            Client Portal
          </span>
          <h1 className="text-5xl font-serif font-bold leading-tight mb-6">
            Your Premium <br />
            <span className="italic font-light">Journey Awaits.</span>
          </h1>
          <p className="text-gray-400 font-light leading-relaxed">
            Create an account to manage your bookings, save your preferred routes, and access exclusive VIP fleet upgrades.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#B35A38]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          
          {/* Logo for Mobile only */}
          <div className="lg:hidden flex justify-center mb-10">
            <img src="/jts-logoo.png" alt="Jamupet Logo" className="h-12 w-auto object-contain opacity-80" />
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
            
            {/* Toggle Switch (Login vs Signup) */}
            <div className="flex bg-[#0a0a0a] rounded-xl p-1 mb-10 border border-white/5 relative">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#1A1A1A] rounded-lg shadow-md border border-white/10 transition-all duration-300 ease-in-out ${isLogin ? 'left-1' : 'left-[calc(50%+2px)]'}`}
              />
              <button 
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest relative z-10 transition-colors duration-300 ${isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </button>
              <button 
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest relative z-10 transition-colors duration-300 ${!isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                onClick={() => setIsLogin(false)}
              >
                Create Account
              </button>
            </div>

            {/* Form Headers */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {isLogin ? "Welcome Back" : "Join the Elite"}
              </h2>
              <p className="text-gray-400 text-sm font-light">
                {isLogin ? "Enter your credentials to access your dashboard." : "Set up your secure client profile."}
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Name Field (Animated: Only shows on Signup) */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isLogin ? "max-h-0 opacity-0" : "max-h-24 opacity-100"}`}>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C5A059] transition-colors">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Legal Name" 
                    required={!isLogin}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#C5A059] transition-all placeholder:text-gray-600 font-light"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C5A059] transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address" 
                  required
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#C5A059] transition-all placeholder:text-gray-600 font-light"
                />
              </div>

              {/* Password Field */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C5A059] transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password" 
                  required
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white text-sm focus:outline-none focus:border-[#C5A059] transition-all placeholder:text-gray-600 font-light"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Forgot Password Link (Only on Login) */}
              {isLogin && (
                <div className="flex justify-end pt-1">
                  <span className="text-[#C5A059] text-xs hover:text-white cursor-pointer transition-colors font-medium">
                    Forgot your password?
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#C5A059] text-black py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(197,160,89,0.2)] mt-4 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Access Portal" : "Create Profile"} 
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

            </form>
          </div>
          
          <p className="text-center text-gray-500 text-xs mt-8">
            By proceeding, you agree to Jamupet Transit's <br />
            <span className="text-white hover:text-[#C5A059] cursor-pointer transition-colors">Terms of Service</span> and <span className="text-white hover:text-[#C5A059] cursor-pointer transition-colors">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}