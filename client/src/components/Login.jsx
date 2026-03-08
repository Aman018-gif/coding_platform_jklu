import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { AtSign, Lock, Eye, EyeOff } from "lucide-react";
import { Context } from "../main";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const { setIsAuthenticated, setUser } = useContext(Context);
  const navigateTo = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleLogin = async (data) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/user/login",
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(res.data.message);
      setIsAuthenticated(true);
      setUser(res.data.user);
      navigateTo("/");
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    }
  };

  const [showPassword, setShowPassword]=useState(false);

  return (
    <div className="fade-content">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
        <p className="text-zinc-400">Log in to continue your journey.</p>
      </header>
      <form className="space-y-5" onSubmit={handleSubmit((data) => handleLogin(data))}>
        {/* Email Input */}
        <div data-purpose="input-group">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Username or Email</label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 group-focus-within:text-accent-yellow transition-colors">
              <AtSign className="h-5 w-5 text-zinc-500" />
            </span>
            <input
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-yellow/20 focus:border-accent-yellow transition-all text-sm placeholder:text-zinc-700 text-white"
              placeholder="dev@jklu.edu.in"
              type="email"
              required
              {...register("email")}
            />
          </div>
        </div>
        
        {/* Password Input */}
        <div data-purpose="input-group">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Password</label>
            <Link className="text-xs text-zinc-500 hover:text-accent-yellow transition-colors" to={"/password/forgot"}>Forgot Password?</Link>
          </div>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 group-focus-within:text-accent-yellow transition-colors">
              <Lock className="h-5 w-5 text-zinc-500" />
            </span>
            <input
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-accent-yellow/20 focus:border-accent-yellow transition-all text-sm placeholder:text-zinc-700 text-white"
              placeholder="••••••••••••"
              type={showPassword ? "text": "password"}
              {...register("password", { required: true })}
            />
            {/* Toggle Button Logic */}
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full bg-accent-yellow hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl mt-4 transition-all active:scale-[0.98] shadow-lg shadow-accent-yellow/10"
        >
          Login to Dashboard
        </button>
      </form>
    </div>
  );
};

export default Login;
