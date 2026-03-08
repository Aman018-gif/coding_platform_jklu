import React, { useContext, useState } from "react";
// import "../styles/ForgotPassword.css";
import { Context } from "../main";
import axios from "axios";
import { toast } from "react-toastify";
import { Mail, ArrowLeft } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

const ForgotPassword = () => {
  const { isAuthenticated } = useContext(Context);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/user/password/forgot",
        { email },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-md bg-card-bg backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl fade-content text-left">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Reset Password
          </h1>
          <p className="text-zinc-400 text-sm">
            Enter your email to receive a reset link.
          </p>
        </header>

        <form className="space-y-5" onSubmit={handleForgotPassword}>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2">
              Email Address
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center transition-colors group-focus-within:text-accent-yellow text-zinc-500">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-yellow/20 focus:border-accent-yellow transition-all text-sm placeholder:text-zinc-700 text-white"
                placeholder="dev@jklu.edu.in"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-yellow hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl mt-4 transition-all active:scale-[0.98] shadow-lg shadow-accent-yellow/10 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
