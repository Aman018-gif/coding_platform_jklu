import React, { useState, useContext } from "react";
import { User, AtSign, Lock, Eye, EyeOff, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const { isAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: "Student" } });

  const selectedRole = watch("role");

  const handleRegister = async (data) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/user/register",
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );
      toast.success(res.data.message);
      navigateTo(`/otp-verification/${data.email}`);
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="fade-content">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Create Account
        </h1>
        <p className="text-zinc-400">Join our community today.</p>
      </header>
      <form
        className="space-y-4"
        onSubmit={handleSubmit((data) => handleRegister(data))}
      >
        {/* Name Input */}
        <div data-purpose="input-group">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Full Name
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 group-focus-within:text-accent-yellow transition-colors">
              <User className="h-5 w-5" />
            </span>
            <input
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-yellow/20 focus:border-accent-yellow transition-all text-sm placeholder:text-zinc-700 text-white"
              placeholder="John Doe"
              type="text"
              required
              {...register("name")}
            />
          </div>
        </div>

        {/* Email Input */}
        <div data-purpose="input-group">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 group-focus-within:text-accent-yellow transition-colors">
              <AtSign className="h-5 w-5" />
            </span>
            <input
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-yellow/20 focus:border-accent-yellow transition-all text-sm placeholder:text-zinc-700 text-white"
              placeholder="john@example.com"
              type="email"
              required
              {...register("email")}
            />
          </div>
        </div>

        {/* Password Input */}
        <div data-purpose="input-group">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 group-focus-within:text-accent-yellow transition-colors">
              <Lock className="h-5 w-5" />
            </span>
            <input
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-accent-yellow/20 focus:border-accent-yellow transition-all text-sm placeholder:text-zinc-700 text-white"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              {...register("password", { required: true })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-600 hover:text-zinc-400"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Role Selection */}
        <div data-purpose="input-group">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            I am a
          </label>
          <div className="grid grid-cols-2 gap-3">
            {["Student", "Teacher"].map((role) => (
              <label
                key={role}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === role
                    ? "border-accent-yellow bg-accent-yellow/5 text-white"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                <input
                  type="radio"
                  value={role}
                  {...register("role")}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedRole === role ? "border-accent-yellow" : "border-zinc-600"
                  }`}
                >
                  {selectedRole === role && (
                    <span className="w-2 h-2 rounded-full bg-accent-yellow" />
                  )}
                </span>
                <span className="text-sm font-medium">{role}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedRole === "Teacher" && (
          <p className="flex items-start gap-1.5 text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/15 rounded-lg px-3 py-2">
            <Info size={12} className="mt-0.5 flex-shrink-0" />
            Your email must be pre-approved by an admin. If it isn't, your account will be created as a Student.
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-accent-yellow hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl mt-4 transition-all active:scale-[0.98] shadow-lg shadow-accent-yellow/10"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default Register;
