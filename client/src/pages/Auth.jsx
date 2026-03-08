import React, { useContext, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import Register from "../components/Register";
import Login from "../components/Login";

const Auth = () => {
  const { isAuthenticated } = useContext(Context);
  const [isLogin, setIsLogin] = useState(true);

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 selection:bg-accent-yellow selection:text-black">
      <div className="fixed inset-0 pointer-events-none bg-glow overflow-hidden"></div>

      {/* Main Container */}
      <main className="w-full max-w-[480px] z-10">
        <div
          className="bg-card-dark rounded-2xl shadow-2xl p-8 md:p-10"
          style={{
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Tab Switcher */}
          <div className="flex bg-zinc-900/50 p-1 rounded-xl mb-10 relative overflow-hidden">
            <div
              className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-accent-yellow rounded-lg transition-all duration-300 ease-in-out"
              style={{
                transform: isLogin ? "translateX(0%)" : "translateX(100%)",
              }}
            ></div>
            <button
              className={`relative flex-1 py-2 text-sm font-semibold transition-colors duration-300 z-10 ${isLogin ? "text-black" : "text-zinc-400"}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`relative flex-1 py-2 text-sm font-semibold transition-colors duration-300 z-10 ${!isLogin ? "text-black" : "text-zinc-400"}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          {/* Form Sections */}
          <div className="fade-content">
            {isLogin ? <Login /> : <Register />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
