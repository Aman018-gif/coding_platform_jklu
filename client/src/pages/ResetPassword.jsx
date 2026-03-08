import React, { useContext, useState } from "react";
// import "../styles/ResetPassword.css";
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { Navigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";

const ResetPassword = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(
        `http://localhost:4000/api/v1/user/password/reset/${token}`,
        { password, confirmPassword },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(res.data.message);
      setIsAuthenticated(true);
      setUser(res.data.user);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
<div className="min-h-screen bg-bg-dark flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-md auth-card backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-left">
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Reset Password
          </h1>
          <p className="text-zinc-400 text-sm">
            Enter your new password below.
          </p>
        </header>

        <form className="space-y-5" onSubmit={handleResetPassword}>
          
          {/* New Password Field */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">
              New Password
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center transition-colors group-focus-within:text-accent-yellow text-zinc-500">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-accent-yellow/20 focus:border-accent-yellow transition-all text-sm placeholder:text-zinc-700 text-white"
                placeholder="New Password"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">
              Confirm New Password
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center transition-colors group-focus-within:text-accent-yellow text-zinc-500">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-accent-yellow/20 focus:border-accent-yellow transition-all text-sm placeholder:text-zinc-700 text-white"
                placeholder="Confirm New Password"
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-accent-yellow hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl mt-4 transition-all active:scale-[0.98] shadow-lg shadow-accent-yellow/10 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>

          <div className="text-center mt-6">
            <Link 
              to="/auth" 
              className="text-sm text-zinc-500 hover:text-accent-yellow transition-colors inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
